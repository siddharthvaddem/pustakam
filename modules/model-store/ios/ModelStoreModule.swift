import CryptoKit
import ExpoModulesCore
import UIKit

struct PackFile: Record {
  @Field var name: String = ""
  @Field var url: String = ""
  @Field var sha256: String = ""
  @Field var size: Double = 0
}

// Files resume into `<name>.part` via HTTP Range and move into place once the SHA-256 matches.
public final class ModelStoreModule: Module {
  private let lock = NSLock()
  private var activeTasks: [String: URLSessionDataTask] = [:]
  private var cancelledPacks: Set<String> = []

  public func definition() -> ModuleDefinition {
    Name("ModelStore")

    Events("onProgress")

    AsyncFunction("getStatus") { (packId: String, version: String) throws -> [String: Any] in
      let dir = try Self.packDirectory(packId)
      return ["installed": Self.isInstalled(dir, version: version), "path": dir.path]
    }

    AsyncFunction("download") {
      (packId: String, version: String, files: [PackFile]) async throws -> String in
      try await self.download(packId: packId, version: version, files: files)
    }

    AsyncFunction("cancel") { (packId: String) in
      self.lock.lock()
      self.cancelledPacks.insert(packId)
      let task = self.activeTasks[packId]
      self.lock.unlock()
      task?.cancel()
    }

    AsyncFunction("freeBytes") { () throws -> Double in
      let values = try Self.modelsRoot().resourceValues(forKeys: [
        .volumeAvailableCapacityForImportantUsageKey
      ])
      return Double(values.volumeAvailableCapacityForImportantUsage ?? 0)
    }
  }

  private func download(packId: String, version: String, files: [PackFile]) async throws -> String {
    let fm = FileManager.default
    let dir = try Self.packDirectory(packId)
    if Self.isInstalled(dir, version: version) { return dir.path }

    // Files from another version can't be trusted, so the pack starts over.
    let versionFile = dir.appendingPathComponent(".version")
    if (try? String(contentsOf: versionFile, encoding: .utf8)) != version {
      try? fm.removeItem(at: dir)
      try fm.createDirectory(at: dir, withIntermediateDirectories: true)
      try version.write(to: versionFile, atomically: true, encoding: .utf8)
    }

    lock.lock()
    cancelledPacks.remove(packId)
    lock.unlock()

    Self.keepScreenAwake(true)
    defer { Self.keepScreenAwake(false) }

    let total = files.reduce(0) { $0 + Int64($1.size) }
    let reporter = ProgressReporter { [weak self] done in
      self?.sendEvent(
        "onProgress",
        ["packId": packId, "bytesDone": Double(done), "bytesTotal": Double(total)])
    }

    var done: Int64 = 0
    for file in files {
      let dest = dir.appendingPathComponent(file.name)
      // Only verified files get renamed into place, so an existing one is good.
      if !fm.fileExists(atPath: dest.path) {
        let base = done
        try await fetch(file, to: dest, packId: packId) { received in
          reporter.report(base + received)
        }
      }
      done += Int64(file.size)
      reporter.report(done, force: true)
    }

    // Written last, so a pack only counts as installed once every file is in.
    try version.write(
      to: dir.appendingPathComponent(".installed"), atomically: true, encoding: .utf8)
    return dir.path
  }

  private func fetch(
    _ file: PackFile, to dest: URL, packId: String, onBytes: @escaping (Int64) -> Void
  ) async throws {
    guard let url = URL(string: file.url) else {
      throw Self.error("E_NETWORK", "Bad download address for \(file.name)")
    }
    let part = dest.appendingPathExtension("part")
    let loader = PartDownload(part: part, onBytes: onBytes)
    do {
      try loader.prepare()
    } catch {
      throw Self.error("E_STORAGE", "Couldn't write \(file.name): \(error.localizedDescription)")
    }

    var request = URLRequest(url: url, timeoutInterval: 30)
    if loader.existing > 0 {
      request.setValue("bytes=\(loader.existing)-", forHTTPHeaderField: "Range")
    }
    let session = URLSession(configuration: .default, delegate: loader, delegateQueue: nil)
    defer { session.finishTasksAndInvalidate() }

    do {
      try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
        lock.lock()
        if cancelledPacks.contains(packId) {
          lock.unlock()
          continuation.resume(throwing: URLError(.cancelled))
          return
        }
        let task = session.dataTask(with: request)
        loader.completion = { error in
          if let error {
            continuation.resume(throwing: error)
          } else {
            continuation.resume()
          }
        }
        activeTasks[packId] = task
        lock.unlock()
        task.resume()
      }
    } catch {
      lock.lock()
      activeTasks[packId] = nil
      lock.unlock()
      throw Self.mapError(error, file: file.name)
    }
    lock.lock()
    activeTasks[packId] = nil
    lock.unlock()

    guard loader.digestHex == file.sha256.lowercased() else {
      try? FileManager.default.removeItem(at: part)
      throw Self.error("E_CHECKSUM", "\(file.name) didn't match its checksum")
    }
    try? FileManager.default.removeItem(at: dest)
    do {
      try FileManager.default.moveItem(at: part, to: dest)
    } catch {
      throw Self.error("E_STORAGE", "Couldn't save \(file.name): \(error.localizedDescription)")
    }
  }

  private static func modelsRoot() throws -> URL {
    let support = try FileManager.default.url(
      for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
    var root = support.appendingPathComponent("models", isDirectory: true)
    try FileManager.default.createDirectory(at: root, withIntermediateDirectories: true)
    // Big and re-downloadable, so keep them out of iCloud backups.
    var values = URLResourceValues()
    values.isExcludedFromBackup = true
    try root.setResourceValues(values)
    return root
  }

  private static func packDirectory(_ packId: String) throws -> URL {
    try modelsRoot().appendingPathComponent(packId, isDirectory: true)
  }

  private static func isInstalled(_ dir: URL, version: String) -> Bool {
    let marker = dir.appendingPathComponent(".installed")
    return (try? String(contentsOf: marker, encoding: .utf8)) == version
  }

  private static func keepScreenAwake(_ on: Bool) {
    DispatchQueue.main.async { UIApplication.shared.isIdleTimerDisabled = on }
  }

  private static func error(_ code: String, _ message: String) -> Exception {
    Exception(name: "ModelStoreError", description: message, code: code)
  }

  private static func mapError(_ error: Error, file: String) -> Error {
    if let exception = error as? Exception { return exception }
    if let partError = error as? PartDownload.Failure {
      switch partError {
      case .httpStatus(let status):
        return Self.error("E_NETWORK", "The server answered \(status) for \(file)")
      case .storage(let underlying):
        return Self.error("E_STORAGE", "Couldn't write \(file): \(underlying.localizedDescription)")
      }
    }
    if (error as? URLError)?.code == .cancelled {
      return Self.error("E_CANCELLED", "Download cancelled")
    }
    return Self.error("E_NETWORK", error.localizedDescription)
  }
}

// At most ~10 events a second so JS isn't flooded.
private final class ProgressReporter {
  private let send: (Int64) -> Void
  private let lock = NSLock()
  private var lastSent: CFAbsoluteTime = 0

  init(send: @escaping (Int64) -> Void) {
    self.send = send
  }

  func report(_ bytes: Int64, force: Bool = false) {
    lock.lock()
    let now = CFAbsoluteTimeGetCurrent()
    let due = force || now - lastSent >= 0.1
    if due { lastSent = now }
    lock.unlock()
    if due { send(bytes) }
  }
}

// Hashes bytes already on disk too, so the digest covers the whole file.
private final class PartDownload: NSObject, URLSessionDataDelegate {
  enum Failure: Error {
    case httpStatus(Int)
    case storage(Error)
  }

  private let part: URL
  private let onBytes: (Int64) -> Void
  private var handle: FileHandle?
  private var hasher = SHA256()
  private var received: Int64 = 0
  private var failure: Failure?
  // HTTP 416: nothing past what we have, so the part is complete.
  private var alreadyComplete = false
  private(set) var existing: Int64 = 0
  var completion: ((Error?) -> Void)?

  init(part: URL, onBytes: @escaping (Int64) -> Void) {
    self.part = part
    self.onBytes = onBytes
  }

  var digestHex: String {
    hasher.finalize().map { String(format: "%02x", $0) }.joined()
  }

  func prepare() throws {
    let fm = FileManager.default
    if !fm.fileExists(atPath: part.path) {
      fm.createFile(atPath: part.path, contents: nil)
    }
    let reader = try FileHandle(forReadingFrom: part)
    defer { try? reader.close() }
    while let chunk = try reader.read(upToCount: 1 << 20), !chunk.isEmpty {
      hasher.update(data: chunk)
      existing += Int64(chunk.count)
    }
    received = existing
    if existing > 0 { onBytes(existing) }
  }

  func urlSession(
    _ session: URLSession, dataTask: URLSessionDataTask, didReceive response: URLResponse,
    completionHandler: @escaping (URLSession.ResponseDisposition) -> Void
  ) {
    let status = (response as? HTTPURLResponse)?.statusCode ?? 0
    do {
      switch status {
      case 206:
        handle = try FileHandle(forWritingTo: part)
        try handle?.seekToEnd()
      case 200:
        // Server ignored the Range and sent the whole file, so start over.
        try Data().write(to: part)
        hasher = SHA256()
        existing = 0
        received = 0
        handle = try FileHandle(forWritingTo: part)
      case 416:
        alreadyComplete = true
        completionHandler(.cancel)
        return
      default:
        failure = .httpStatus(status)
        completionHandler(.cancel)
        return
      }
      completionHandler(.allow)
    } catch {
      failure = .storage(error)
      completionHandler(.cancel)
    }
  }

  func urlSession(_ session: URLSession, dataTask: URLSessionDataTask, didReceive data: Data) {
    guard let handle, failure == nil else { return }
    do {
      try handle.write(contentsOf: data)
      hasher.update(data: data)
      received += Int64(data.count)
      onBytes(received)
    } catch {
      failure = .storage(error)
      dataTask.cancel()
    }
  }

  func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
    try? handle?.close()
    handle = nil
    let result: Error? = alreadyComplete ? nil : (failure ?? error)
    completion?(result)
    completion = nil
  }
}
