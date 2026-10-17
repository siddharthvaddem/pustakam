import ExpoModulesCore

// Runs the embedding model with Google's LiteRT-LM (Swift API copied into ios/LiteRTLM).
public final class LiteRtLmModule: Module {
  private let embedder = Embedder()

  public func definition() -> ModuleDefinition {
    Name("LiteRtLm")

    AsyncFunction("loadEmbedder") { (modelPath: String, backend: String) async throws in
      try await self.embedder.load(modelPath: modelPath, backend: backend == "gpu" ? .gpu : .cpu())
    }

    AsyncFunction("embed") { (texts: [String]) async throws -> [[Float]] in
      try await self.embedder.embed(texts)
    }

    AsyncFunction("closeEmbedder") { () async in
      await self.embedder.close()
    }
  }
}

// An actor so calls from JS run one at a time.
private actor Embedder {
  private var engine: EmbeddingEngine?

  // Compiled-model caches go in Caches so iOS can clear them.
  private static let cacheDir: String = {
    let dir = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
      .appendingPathComponent("litert-lm")
    try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
    return dir.path
  }()

  func load(modelPath: String, backend: Backend) async throws {
    await close()
    let config = EmbeddingEngineConfig(modelPath: modelPath, backend: backend, cacheDir: Self.cacheDir)
    let fresh = EmbeddingEngine(config: config)
    do {
      try await fresh.initialize()
    } catch {
      throw Self.error("E_LOAD", "Couldn't load the embedding model: \(error)")
    }
    engine = fresh
  }

  func embed(_ texts: [String]) async throws -> [[Float]] {
    guard let engine else { throw Self.error("E_NOT_LOADED", "No embedding model is loaded") }
    do {
      let responses = try await engine.computeEmbeddingBatch(
        contentsBatch: texts.map { [.text($0)] },
        options: EmbeddingOptions(normalize: true))
      return responses.map(\.embedding)
    } catch {
      throw Self.error("E_EMBED", "Couldn't embed the text: \(error)")
    }
  }

  func close() async {
    await engine?.close()
    engine = nil
  }

  private static func error(_ code: String, _ message: String) -> Exception {
    Exception(name: "LiteRtLmError", description: message, code: code)
  }
}
