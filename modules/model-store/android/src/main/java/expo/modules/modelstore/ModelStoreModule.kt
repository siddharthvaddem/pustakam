package expo.modules.modelstore

import android.content.Context
import android.os.StatFs
import android.view.WindowManager
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors

class PackFile : Record {
  @Field val name: String = ""
  @Field val url: String = ""
  @Field val sha256: String = ""
  @Field val size: Double = 0.0
}

class DownloadException(code: String, message: String, cause: Throwable? = null) :
  CodedException(code, message, cause)

// Files resume into `<name>.part` via HTTP Range and move into place once the SHA-256 matches.
class ModelStoreModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private val worker = Executors.newSingleThreadExecutor()
  private val cancelled = ConcurrentHashMap.newKeySet<String>()

  override fun definition() = ModuleDefinition {
    Name("ModelStore")

    Events("onProgress")

    AsyncFunction("getStatus") { packId: String, version: String ->
      val dir = packDirectory(packId)
      mapOf("installed" to isInstalled(dir, version), "path" to dir.absolutePath)
    }

    AsyncFunction("download") { packId: String, version: String, files: List<PackFile>, promise: Promise ->
      worker.execute {
        try {
          promise.resolve(download(packId, version, files))
        } catch (e: DownloadException) {
          promise.reject(e)
        } catch (e: Throwable) {
          promise.reject(DownloadException("E_NETWORK", e.message ?: "Download failed", e))
        }
      }
    }

    AsyncFunction("cancel") { packId: String ->
      cancelled.add(packId)
    }

    AsyncFunction("freeBytes") {
      StatFs(modelsRoot().absolutePath).availableBytes.toDouble()
    }

    OnDestroy {
      worker.shutdownNow()
    }
  }

  private fun download(packId: String, version: String, files: List<PackFile>): String {
    val dir = packDirectory(packId)
    if (isInstalled(dir, version)) return dir.absolutePath

    // Older builds copied a bundled model here; no longer used.
    File(context.filesDir, "models").deleteRecursively()

    // Files from another version can't be trusted, so the pack starts over.
    val versionFile = File(dir, ".version")
    if (!versionFile.exists() || versionFile.readText() != version) {
      dir.deleteRecursively()
      dir.mkdirs()
      versionFile.writeText(version)
    }

    cancelled.remove(packId)
    keepScreenAwake(true)
    try {
      val total = files.sumOf { it.size.toLong() }
      val reporter = ProgressReporter { done ->
        sendEvent(
          "onProgress",
          mapOf("packId" to packId, "bytesDone" to done.toDouble(), "bytesTotal" to total.toDouble())
        )
      }

      var done = 0L
      for (file in files) {
        val dest = File(dir, file.name)
        // Only verified files get renamed into place, so an existing one is good.
        if (!dest.exists()) {
          val base = done
          fetch(file, dest, packId) { received -> reporter.report(base + received) }
        }
        done += file.size.toLong()
        reporter.report(done, force = true)
      }

      // Written last, so a pack only counts as installed once every file is in.
      File(dir, ".installed").writeText(version)
      return dir.absolutePath
    } finally {
      keepScreenAwake(false)
    }
  }

  private fun fetch(file: PackFile, dest: File, packId: String, onBytes: (Long) -> Unit) {
    val part = File(dest.parentFile, "${dest.name}.part")
    val digest = MessageDigest.getInstance("SHA-256")
    val buffer = ByteArray(64 * 1024)

    // Hash bytes already on disk so a resumed file gets one digest over all of it.
    var existing = 0L
    if (part.exists()) {
      FileInputStream(part).use { input ->
        while (true) {
          val read = input.read(buffer)
          if (read <= 0) break
          digest.update(buffer, 0, read)
          existing += read
        }
      }
      if (existing > 0) onBytes(existing)
    }

    val connection = try {
      (URL(file.url).openConnection() as HttpURLConnection).apply {
        connectTimeout = 15_000
        readTimeout = 30_000
        if (existing > 0) setRequestProperty("Range", "bytes=$existing-")
      }
    } catch (e: IOException) {
      throw DownloadException("E_NETWORK", "Couldn't reach the server for ${file.name}", e)
    }

    try {
      val status = try {
        connection.responseCode
      } catch (e: IOException) {
        throw DownloadException("E_NETWORK", "Couldn't reach the server for ${file.name}", e)
      }
      val append = when (status) {
        HttpURLConnection.HTTP_PARTIAL -> true
        HttpURLConnection.HTTP_OK -> {
          // Server ignored the Range and sent the whole file, so start over.
          digest.reset()
          existing = 0
          false
        }
        416 -> null // nothing past what we have, so the part is complete
        else -> throw DownloadException("E_NETWORK", "The server answered $status for ${file.name}")
      }

      if (append != null) {
        var received = existing
        val output = try {
          FileOutputStream(part, append)
        } catch (e: IOException) {
          throw DownloadException("E_STORAGE", "Couldn't write ${file.name}", e)
        }
        output.use { out ->
          connection.inputStream.use { input ->
            while (true) {
              if (cancelled.contains(packId)) {
                throw DownloadException("E_CANCELLED", "Download cancelled")
              }
              val read = try {
                input.read(buffer)
              } catch (e: IOException) {
                throw DownloadException("E_NETWORK", "The connection dropped while downloading ${file.name}", e)
              }
              if (read <= 0) break
              try {
                out.write(buffer, 0, read)
              } catch (e: IOException) {
                throw DownloadException("E_STORAGE", "Couldn't write ${file.name}", e)
              }
              digest.update(buffer, 0, read)
              received += read
              onBytes(received)
            }
          }
        }
      }
    } finally {
      connection.disconnect()
    }

    val hex = digest.digest().joinToString("") { "%02x".format(it) }
    if (hex != file.sha256.lowercase()) {
      part.delete()
      throw DownloadException("E_CHECKSUM", "${file.name} didn't match its checksum")
    }
    dest.delete()
    if (!part.renameTo(dest)) {
      throw DownloadException("E_STORAGE", "Couldn't save ${file.name}")
    }
  }

  // Big and re-downloadable, so keep them out of backups.
  private fun modelsRoot(): File = File(context.noBackupFilesDir, "models").apply { mkdirs() }

  private fun packDirectory(packId: String): File = File(modelsRoot(), packId)

  private fun isInstalled(dir: File, version: String): Boolean {
    val marker = File(dir, ".installed")
    return marker.exists() && marker.readText() == version
  }

  private fun keepScreenAwake(on: Boolean) {
    val activity = appContext.currentActivity ?: return
    activity.runOnUiThread {
      if (on) {
        activity.window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
      } else {
        activity.window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
      }
    }
  }
}

// At most ~10 events a second so JS isn't flooded.
private class ProgressReporter(private val send: (Long) -> Unit) {
  private var lastSent = 0L

  fun report(bytes: Long, force: Boolean = false) {
    val now = System.nanoTime()
    if (force || now - lastSent >= 100_000_000L) {
      lastSent = now
      send(bytes)
    }
  }
}
