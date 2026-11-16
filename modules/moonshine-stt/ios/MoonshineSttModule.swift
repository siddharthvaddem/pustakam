import AVFoundation
import ExpoModulesCore

// Mic is set up once and reused; setting it up on tap lost the first words.
public final class MoonshineSttModule: Module {
  private static let targetFormat = AVAudioFormat(
    commonFormat: .pcmFormatFloat32, sampleRate: 16000, channels: 1, interleaved: false)!

  // State below is only touched on this queue, so no locks.
  private let audioQueue = DispatchQueue(label: "memorybank.moonshine.audio", qos: .userInitiated)
  private var modelPath: String?
  private var transcriber: Transcriber?
  private var stream: Stream?
  private var engine: AVAudioEngine?
  private var engineObserver: NSObjectProtocol?
  private var sessionActive = false
  private var isListening = false

  // Kept here so every model reload picks up the latest values.
  private var keyterms: [String] = []
  // Matches BOOST_DEFAULT in JS so the first load needs no reload.
  private var keytermBoost: Float = 4.0
  // Boost changes need a model reload, deferred until recording stops.
  private var reloadPending = false

  // Mic callback only queues samples here; blocking on Moonshine makes iOS drop audio.
  private let pendingLock = NSLock()
  private var pending: [Float] = []

  public func definition() -> ModuleDefinition {
    Name("MoonshineStt")

    Events("onLine", "onLevel", "onError")

    AsyncFunction("load") { (modelPath: String, promise: Promise) in
      self.audioQueue.async {
        self.modelPath = modelPath
        do {
          try self.loadIfNeeded()
          promise.resolve(nil)
        } catch {
          promise.reject("E_LOAD", "Could not load the speech model: \(error.localizedDescription)")
          return
        }
        self.prewarmIfPermitted()
      }
    }

    // Applies to the next utterance, even mid-recording.
    AsyncFunction("setKeyterms") { (terms: [String], promise: Promise) in
      self.audioQueue.async {
        self.keyterms = terms
        do {
          try self.transcriber?.setKeyterms(terms)
          promise.resolve(nil)
        } catch {
          promise.reject("E_KEYTERMS", error.localizedDescription)
        }
      }
    }

    // Moonshine reads the boost only at load, so this reloads the model after any recording.
    AsyncFunction("setKeytermBoost") { (boost: Double, promise: Promise) in
      self.audioQueue.async {
        let boost = Float(boost)
        guard boost != self.keytermBoost else {
          promise.resolve(nil)
          return
        }
        self.keytermBoost = boost
        if self.transcriber == nil {
          promise.resolve(nil)
        } else if self.isListening {
          self.reloadPending = true
          promise.resolve(nil)
        } else {
          self.reloadModel()
          promise.resolve(nil)
        }
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

  private func loadIfNeeded() throws {
    guard transcriber == nil else { return }
    guard let modelPath, FileManager.default.fileExists(atPath: modelPath) else {
      throw MoonshineError.custom(message: "Speech model folder is missing", code: -1)
    }
    let transcriber = try Transcriber(
      modelPath: modelPath,
      modelArch: .smallStreaming,
      options: [TranscriberOption(name: "keyterm_boost", value: String(keytermBoost))])
    if !keyterms.isEmpty {
      try transcriber.setKeyterms(keyterms)
    }
    let stream = try transcriber.createStream(updateInterval: 0.3)
    stream.addListener { [weak self] event in self?.forward(event) }
    self.transcriber = transcriber
    self.stream = stream
  }

  private func reloadModel() {
    reloadPending = false
    stream?.close()
    transcriber?.close()
    stream = nil
    transcriber = nil
    do {
      try loadIfNeeded()
    } catch {
      sendEvent("onError", ["message": "Could not reload the model: \(error.localizedDescription)"])
    }
  }

  // Needs mic permission first; iOS hides the mic format until then.
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
    // No .allowBluetooth: switching AirPods to their mic takes seconds and eats the first words.
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

    // Headphone changes and calls break the engine, so rebuild it.
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
    if reloadPending { reloadModel() }
  }

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

  // Usually 48 kHz in, 16 kHz mono out.
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

  // RMS loudness for the orb.
  private func emitLevel(_ buffer: AVAudioPCMBuffer) {
    guard let data = buffer.floatChannelData else { return }
    let count = Int(buffer.frameLength)
    guard count > 0 else { return }
    var sum: Float = 0
    for i in 0..<count { sum += data[0][i] * data[0][i] }
    sendEvent("onLevel", ["level": sqrt(sum / Float(count))])
  }

  // Line ids are 64-bit, too big for JS numbers, so they go as strings.
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
