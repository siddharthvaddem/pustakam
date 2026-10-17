package expo.modules.litertlm

import com.google.ai.edge.litertlm.Backend
import com.google.ai.edge.litertlm.EmbeddingEngine
import com.google.ai.edge.litertlm.EmbeddingEngineConfig
import com.google.ai.edge.litertlm.EmbeddingOptions
import com.google.ai.edge.litertlm.InputData
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class LiteRtLmException(code: String, message: String, cause: Throwable? = null) :
  CodedException(code, message, cause)

// Runs the embedding model with Google's LiteRT-LM.
class LiteRtLmModule : Module() {
  private val lock = Any()
  private var engine: EmbeddingEngine? = null

  override fun definition() = ModuleDefinition {
    Name("LiteRtLm")

    AsyncFunction("loadEmbedder") { modelPath: String, backend: String ->
      val context = appContext.reactContext ?: throw Exceptions.ReactContextLost()
      synchronized(lock) {
        engine?.close()
        engine = null
        try {
          val config = EmbeddingEngineConfig(
            modelPath = modelPath,
            backend = if (backend == "gpu") Backend.GPU() else Backend.CPU(),
            cacheDir = context.cacheDir.path,
          )
          engine = EmbeddingEngine(config).apply { initialize() }
        } catch (e: Throwable) {
          throw LiteRtLmException("E_LOAD", "Couldn't load the embedding model: ${e.message}", e)
        }
      }
    }

    AsyncFunction("embed") { texts: List<String> ->
      synchronized(lock) {
        val loaded = engine ?: throw LiteRtLmException("E_NOT_LOADED", "No embedding model is loaded")
        try {
          loaded
            .computeEmbeddingBatch(texts.map { listOf(InputData.Text(it)) }, EmbeddingOptions(normalize = true))
            .map { it.embedding }
        } catch (e: Throwable) {
          throw LiteRtLmException("E_EMBED", "Couldn't embed the text: ${e.message}", e)
        }
      }
    }

    AsyncFunction("closeEmbedder") {
      synchronized(lock) {
        engine?.close()
        engine = null
      }
    }
  }
}
