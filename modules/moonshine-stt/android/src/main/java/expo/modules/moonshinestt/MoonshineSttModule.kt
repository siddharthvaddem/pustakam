package expo.modules.moonshinestt

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import androidx.core.content.ContextCompat
import ai.moonshine.voice.JNI
import ai.moonshine.voice.Transcriber
import ai.moonshine.voice.TranscriberOption
import ai.moonshine.voice.TranscriptEvent
import ai.moonshine.voice.TranscriptLine
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.util.concurrent.ConcurrentLinkedQueue
import java.util.concurrent.Executors
import kotlin.math.sqrt

// Recorder is created once and reused; creating it on tap lost the first words.
class MoonshineSttModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  // Moonshine runs only here; the mic thread just queues audio so it never waits on it.
  private val worker = Executors.newSingleThreadExecutor()
  private val pending = ConcurrentLinkedQueue<FloatArray>()
  private var modelPath: String? = null
  private var transcriber: Transcriber? = null
  private var record: AudioRecord? = null
  private var captureThread: Thread? = null
  @Volatile private var listening = false

  // Worker-only. Kept here so every model reload picks up the latest values.
  private var keyterms: List<String> = emptyList()
  // Matches BOOST_DEFAULT in JS so the first load needs no reload.
  private var keytermBoost = 4.0
  // Boost changes need a model reload, deferred until recording stops.
  private var reloadPending = false

  override fun definition() = ModuleDefinition {
    Name("MoonshineStt")

    Events("onLine", "onLevel", "onError")

    AsyncFunction("load") { modelPath: String, promise: Promise ->
      worker.execute {
        this@MoonshineSttModule.modelPath = modelPath
        try {
          loadIfNeeded()
          promise.resolve(null)
        } catch (e: Throwable) {
          promise.reject("E_LOAD", "Could not load the speech model: ${e.message}", e)
          return@execute
        }
        prewarmIfPermitted()
      }
    }

    // Applies to the next utterance, even mid-recording.
    AsyncFunction("setKeyterms") { terms: List<String>, promise: Promise ->
      worker.execute {
        keyterms = terms
        try {
          transcriber?.setKeyterms(terms)
          promise.resolve(null)
        } catch (e: Throwable) {
          promise.reject("E_KEYTERMS", e.message ?: "Could not set key terms", e)
        }
      }
    }

    // Moonshine reads the boost only at load, so this reloads the model after any recording.
    AsyncFunction("setKeytermBoost") { boost: Double, promise: Promise ->
      worker.execute {
        if (boost != keytermBoost) {
          keytermBoost = boost
          when {
            transcriber == null -> {}
            listening -> reloadPending = true
            else -> reloadModel()
          }
        }
        promise.resolve(null)
      }
    }

    AsyncFunction("start") { promise: Promise ->
      if (ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO)
        != PackageManager.PERMISSION_GRANTED
      ) {
        promise.reject("E_MIC_DENIED", "Microphone access was denied", null)
        return@AsyncFunction
      }
      worker.execute {
        try {
          startListening()
          promise.resolve(null)
        } catch (e: Throwable) {
          listening = false
          releaseRecorder()
          promise.reject("E_START", e.message ?: "Could not start the microphone", e)
        }
      }
    }

    AsyncFunction("stop") { promise: Promise ->
      stopListening()
      promise.resolve(null)
    }

    OnActivityEntersBackground {
      stopListening()
      worker.execute { releaseRecorder() }
    }

    OnActivityEntersForeground {
      worker.execute { prewarmIfPermitted() }
    }

    OnDestroy {
      stopListening()
      worker.execute {
        releaseRecorder()
        transcriber?.close()
      }
      worker.shutdown()
    }
  }

  private fun loadIfNeeded() {
    if (transcriber != null) return
    val dir = modelPath?.let(::File)?.takeIf { it.isDirectory }
      ?: throw IllegalStateException("Speech model folder is missing")
    val options = listOf(TranscriberOption("keyterm_boost", keytermBoost.toString()))
    transcriber = Transcriber(options).apply {
      loadFromFiles(dir.absolutePath, JNI.MOONSHINE_MODEL_ARCH_SMALL_STREAMING)
      setUpdateInterval(0.3)
      if (keyterms.isNotEmpty()) setKeyterms(keyterms)
      addListener { event -> event.accept(forwarder) }
    }
  }

  private fun reloadModel() {
    reloadPending = false
    transcriber?.close()
    transcriber = null
    try {
      loadIfNeeded()
    } catch (e: Throwable) {
      sendEvent("onError", mapOf("message" to "Could not reload the model: ${e.message}"))
    }
  }


  private fun hasMicPermission() =
    ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED

  private fun prewarmIfPermitted() {
    if (!hasMicPermission()) return
    try {
      preparedRecorder()
    } catch (_: Throwable) {
      releaseRecorder()
    }
  }

  private fun preparedRecorder(): AudioRecord {
    record?.let { return it }
    val minBuffer = AudioRecord.getMinBufferSize(SAMPLE_RATE, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_FLOAT)
    val recorder = AudioRecord(
      MediaRecorder.AudioSource.VOICE_RECOGNITION,
      SAMPLE_RATE,
      AudioFormat.CHANNEL_IN_MONO,
      AudioFormat.ENCODING_PCM_FLOAT,
      maxOf(minBuffer, CHUNK * 4 * 8)
    )
    if (recorder.state != AudioRecord.STATE_INITIALIZED) {
      recorder.release()
      error("Microphone unavailable")
    }
    record = recorder
    return recorder
  }

  private fun startListening() {
    if (listening) return
    loadIfNeeded()
    val recorder = preparedRecorder()
    transcriber!!.start()
    listening = true
    recorder.startRecording()

    captureThread = Thread({
      val chunk = FloatArray(CHUNK)
      while (listening) {
        val read = recorder.read(chunk, 0, chunk.size, AudioRecord.READ_BLOCKING)
        if (read <= 0) continue
        val samples = chunk.copyOf(read)
        emitLevel(samples)
        pending.add(samples)
        worker.execute { drain() }
      }
    }, "moonshine-capture").apply { start() }
  }

  private fun stopListening() {
    if (!listening) return
    listening = false
    captureThread?.join(500)
    captureThread = null
    worker.submit {
      try { record?.stop() } catch (_: IllegalStateException) {}
      drain()
      try {
        transcriber?.stop()
      } catch (e: Throwable) {
        sendEvent("onError", mapOf("message" to (e.message ?: "stop failed")))
      }
      if (reloadPending) reloadModel()
    }.get()
    sendEvent("onLevel", mapOf("level" to 0.0))
  }

  private fun releaseRecorder() {
    record?.run {
      try { stop() } catch (_: IllegalStateException) {}
      release()
    }
    record = null
  }

  private fun drain() {
    var total = 0
    val chunks = ArrayList<FloatArray>()
    while (true) {
      val next = pending.poll() ?: break
      chunks.add(next)
      total += next.size
    }
    if (total == 0) return
    val batch = FloatArray(total)
    var offset = 0
    for (c in chunks) {
      c.copyInto(batch, offset)
      offset += c.size
    }
    try {
      transcriber?.addAudio(batch, SAMPLE_RATE)
    } catch (e: Throwable) {
      sendEvent("onError", mapOf("message" to (e.message ?: "transcription failed")))
    }
  }

  // RMS loudness for the orb.
  private fun emitLevel(samples: FloatArray) {
    var sum = 0.0
    for (s in samples) sum += s * s
    sendEvent("onLevel", mapOf("level" to sqrt(sum / samples.size)))
  }

  // Line ids are 64-bit, too big for JS numbers, so they go as strings.
  private fun sendLine(line: TranscriptLine) {
    sendEvent("onLine", mapOf(
      "id" to line.id.toULong().toString(),
      "text" to (line.text ?: ""),
      "isComplete" to line.isComplete,
    ))
  }

  private val forwarder = object : TranscriptEvent.Visitor {
    override fun onLineStarted(event: TranscriptEvent.LineStarted) = sendLine(event.line)
    override fun onLineUpdated(event: TranscriptEvent.LineUpdated) {}
    override fun onLineTextChanged(event: TranscriptEvent.LineTextChanged) = sendLine(event.line)
    override fun onLineSpeakersChanged(event: TranscriptEvent.LineSpeakersChanged) {}
    override fun onLineCompleted(event: TranscriptEvent.LineCompleted) = sendLine(event.line)
    override fun onError(event: TranscriptEvent.Error) {
      sendEvent("onError", mapOf("message" to (event.cause?.message ?: "transcription error")))
    }
  }

  private companion object {
    const val SAMPLE_RATE = 16000
    const val CHUNK = 512 // 32 ms
  }
}
