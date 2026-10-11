import AVFoundation
import ExpoModulesCore

// Bridge between the app's JS and Moonshine on iOS.
//
// Flow: JS calls load() once, then start()/stop() per recording. While recording,
// mic audio is converted to 16 kHz mono and fed to Moonshine, which sends back
// text through the onLine event. We also send the mic volume (onLevel) for the orb.
//
// The mic is set up ahead of time and reused between recordings. Setting it up
// on tap takes a few hundred ms, and anything said in that time was being lost.
public final class MoonshineSttModule: Module {
  private static let modelDirName = "models/small-streaming-en"
  private static let targetFormat = AVAudioFormat(
    commonFormat: .pcmFormatFloat32, sampleRate: 16000, channels: 1, interleaved: false)!

  // All the state below is only touched on this one queue, so no locks are needed for it.
  private let audioQueue = DispatchQueue(label: "memorybank.moonshine.audio", qos: .userInitiated)
  private var transcriber: Transcriber?
  private var stream: Stream?
  private var engine: AVAudioEngine?
  private var engineObserver: NSObjectProtocol?
  private var sessionActive = false
  private var isListening = false

  // The mic callback hands audio over here and returns right away. If it waited
  // for Moonshine to finish transcribing, iOS would drop audio.
  private let pendingLock = NSLock()
  private var pending: [Float] = []

  public func definition() -> ModuleDefinition {
    Name("MoonshineStt")

    Events("onLine", "onLevel", "onError")

    AsyncFunction("load") { (promise: Promise) in
      self.audioQueue.async {
        do {
          try self.loadIfNeeded()
          promise.resolve(nil)
        } catch {
          promise.reject("E_LOAD", "Could not load the bundled model: \(error.localizedDescription)")
          return
        }
        self.prewarmIfPermitted()
      }
    }

    AsyncFunction("start") { (promise: Promise) in
      AVAudioSession.sharedInstance().requestRecordPermission { granted in
        guard granted else {
          promise.reject("E_MIC_DENIED", "Microphone access was denied")
          return
        }
        self.audioQueue.async {
          do {
            try self.startListening()
            promise.resolve(nil)
          } catch {
            self.isListening = false
            self.discardEngine()
            promise.reject("E_START", error.localizedDescription)
          }
        }
      }
    }

    AsyncFunction("stop") { (promise: Promise) in
      self.audioQueue.async {
        self.stopListening()
        promise.resolve(nil)
      }
    }

    OnAppEntersBackground {
      self.audioQueue.async {
        self.stopListening()
        self.discardEngine()
        self.deactivateSession()
      }
    }

    OnAppEntersForeground {
      self.audioQueue.async { self.prewarmIfPermitted() }
    }

    OnDestroy {
      self.audioQueue.sync {
        self.stopListening()
        self.discardEngine()
        self.deactivateSession()
        self.stream?.close()
        self.transcriber?.close()
      }
    }
  }

  // Loads the model that ships inside the app (see the `resources` line in the podspec).
  private func loadIfNeeded() throws {
    guard transcriber == nil else { return }
    guard let root = Bundle.main.resourceURL?.appendingPathComponent(Self.modelDirName),
      FileManager.default.fileExists(atPath: root.path)
    else {
      throw MoonshineError.custom(message: "Model folder missing from app bundle", code: -1)
    }
    let transcriber = try Transcriber(modelPath: root.path, modelArch: .smallStreaming)
    let stream = try transcriber.createStream(updateInterval: 0.3)
    stream.addListener { [weak self] event in self?.forward(event) }
    self.transcriber = transcriber
    self.stream = stream
  }

  // Get the mic ready before the first tap. Skipped until the user has granted mic access,
  // because before that iOS doesn't tell us the mic's format.
  private func prewarmIfPermitted() {
    guard AVAudioSession.sharedInstance().recordPermission == .granted else { return }
    do {
      try activateSession()
      _ = try preparedEngine()
    } catch {
      discardEngine()
    }
  }

  private func activateSession() throws {
    guard !sessionActive else { return }
    let session = AVAudioSession.sharedInstance()
    // No `.allowBluetooth`: switching AirPods to their mic takes seconds and
    // swallows the first words. `.mixWithOthers` keeps other apps' audio playing.
    try session.setCategory(.playAndRecord, mode: .measurement, options: [.mixWithOthers])
    try? session.setPreferredIOBufferDuration(0.02)
    try session.setActive(true)
    sessionActive = true
  }

  private func deactivateSession() {
    guard sessionActive else { return }
    try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    sessionActive = false
  }

  // Builds the audio engine once and reuses it. Its tap receives mic buffers in the
  // mic's native format, which we convert to what Moonshine expects.
  private func preparedEngine() throws -> AVAudioEngine {
    if let engine { return engine }
    let engine = AVAudioEngine()
    let input = engine.inputNode
    let inputFormat = input.inputFormat(forBus: 0)
    guard inputFormat.sampleRate > 0,
      let converter = AVAudioConverter(from: inputFormat, to: Self.targetFormat)
    else {
      throw MoonshineError.custom(message: "Microphone unavailable", code: -1)
    }

    input.installTap(onBus: 0, bufferSize: 1024, format: inputFormat) { [weak self] buffer, _ in
      guard let self, self.isListening else { return }
      self.emitLevel(buffer)
      guard let samples = Self.convert(buffer, with: converter) else { return }
      self.pendingLock.lock()
      self.pending.append(contentsOf: samples)
      self.pendingLock.unlock()
      self.audioQueue.async { self.drain() }
    }
    engine.prepare()

    // Plugging in headphones or taking a call breaks the engine, so rebuild it when that happens.

    engineObserver = NotificationCenter.default.addObserver(
      forName: .AVAudioEngineConfigurationChange, object: engine, queue: nil
    ) { [weak self] _ in
      self?.audioQueue.async { self?.recoverFromConfigurationChange() }
    }
    self.engine = engine
    return engine
  }

  private func discardEngine() {
    if let engineObserver { NotificationCenter.default.removeObserver(engineObserver) }
    engineObserver = nil
    engine?.inputNode.removeTap(onBus: 0)
    engine?.stop()
    engine = nil
  }

  private func recoverFromConfigurationChange() {
    discardEngine()
    guard isListening else { return }
    do {
      try preparedEngine().start()
    } catch {
      isListening = false
      sendEvent("onError", ["message": "Microphone was interrupted: \(error.localizedDescription)"])
    }
  }

  private func startListening() throws {
    guard !isListening else { return }
    try loadIfNeeded()
    guard let stream else { return }
    try activateSession()
    let engine = try preparedEngine()
    try stream.start()
    isListening = true
    try engine.start()
  }

  private func stopListening() {
    guard isListening else { return }
    isListening = false
    engine?.stop()
    drain()
    do {
      try stream?.stop()
    } catch {
      sendEvent("onError", ["message": error.localizedDescription])
    }
    sendEvent("onLevel", ["level": 0])
  }

  // Hands everything the mic has captured so far to Moonshine.
  private func drain() {
    pendingLock.lock()
    let batch = pending
    pending.removeAll(keepingCapacity: true)
    pendingLock.unlock()
    guard !batch.isEmpty, let stream else { return }
    do {
      try stream.addAudio(batch, sampleRate: Int32(Self.targetFormat.sampleRate))
    } catch {
      sendEvent("onError", ["message": error.localizedDescription])
    }
  }

  // Resamples one mic buffer (usually 48 kHz) to 16 kHz mono.
  private static func convert(_ buffer: AVAudioPCMBuffer, with converter: AVAudioConverter) -> [Float]? {
    let ratio = targetFormat.sampleRate / buffer.format.sampleRate
    let capacity = AVAudioFrameCount((Double(buffer.frameLength) * ratio).rounded(.up)) + 1
    guard let out = AVAudioPCMBuffer(pcmFormat: targetFormat, frameCapacity: capacity) else { return nil }
    var consumed = false
    var error: NSError?
    converter.convert(to: out, error: &error) { _, status in
      if consumed {
        status.pointee = .noDataNow
        return nil
      }
      consumed = true
      status.pointee = .haveData
      return buffer
    }
    guard error == nil, let data = out.floatChannelData else { return nil }
    return Array(UnsafeBufferPointer(start: data[0], count: Int(out.frameLength)))
  }

  // Loudness of one buffer (root mean square), used to animate the orb.
  private func emitLevel(_ buffer: AVAudioPCMBuffer) {
    guard let data = buffer.floatChannelData else { return }
    let count = Int(buffer.frameLength)
    guard count > 0 else { return }
    var sum: Float = 0
    for i in 0..<count { sum += data[0][i] * data[0][i] }
    sendEvent("onLevel", ["level": sqrt(sum / Float(count))])
  }

  // Passes Moonshine's events to JS. Line ids are 64-bit, which JS numbers can't hold, so they go as strings.
  private func forward(_ event: TranscriptEvent) {
    switch event {
    case let failure as TranscriptError:
      sendEvent("onError", ["message": failure.error.localizedDescription])
    case is LineStarted, is LineTextChanged, is LineCompleted:
      let line = event.line
      sendEvent("onLine", [
        "id": String(line.lineId),
        "text": line.text,
        "isComplete": line.isComplete,
      ])
    default:
      break
    }
  }
}
