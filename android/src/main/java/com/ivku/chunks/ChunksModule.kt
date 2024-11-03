package com.ivku.chunks

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.io.FileOutputStream
import java.io.FileNotFoundException
import java.io.InputStream

class ChunksModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  companion object {
    const val NAME = "Chunks"
    const val CHUNKS_APK_BUILD_TIME = "CHUNKS_APK_BUILD_TIME"
    init {
      try {
        // Load the native part of ChunksModule
        System.loadLibrary("ReactNativeChunks")
      } catch (error: UnsatisfiedLinkError) {
        Log.e(NAME, "Failed to load ChunksModule C++ library!", error)
        throw error
      }
    }
  }

  override fun getName(): String {
    return NAME
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun loadChunk(uri: String, name: String?) {
    val sourceUri = name ?: uri

    val file = File(uri)
    val loader = AndroidChunkLoader(reactApplicationContext)

    if (file.exists()) {
      loader.loadChunk(uri, sourceUri)
      return
    }

    loader.loadChunk(assetFile(uri).absolutePath, sourceUri)
  }

  private fun assetFile(uri: String): File {
    if (uri.startsWith("assets://")) {
      val assetFileName = uri.replace("assets://", "")
      val assetInputStream = reactApplicationContext.assets.open(assetFileName)
      return createOrGetRawResourceFile(assetFileName, assetInputStream)
    }

    val resourceId = reactApplicationContext.resources.getIdentifier(uri, "raw", reactApplicationContext.packageName)
    if (resourceId == 0) {
        throw FileNotFoundException("Resource not found for uri: $uri")
    }
    return createOrGetRawResourceFile(uri, reactApplicationContext.resources.openRawResource(resourceId))
  }

  private fun createOrGetRawResourceFile(uri: String, inputStream: InputStream): File {
    val file = File(reactApplicationContext.filesDir, uri)
    removePreviousVersionFile(file)
    if (file.exists()) {
      return file
    }

    inputStream.use { it ->
      FileOutputStream(file).use { outputStream ->
        it.copyTo(outputStream)
      }
    }

    saveBinaryResourcesModifiedTime(binaryResourcesModifiedTime)
    return file
  }

  private fun removePreviousVersionFile(file: File) {
    if (!file.exists()) {
      return
    }

    val savedModifiedTime = getSavedBinaryResourcesModifiedTime()
    if (binaryResourcesModifiedTime != savedModifiedTime) {
      file.delete()
    }
  }

  private fun getSavedBinaryResourcesModifiedTime(): Long {
    return sharedPref.getLong(CHUNKS_APK_BUILD_TIME, 0L)
  }

  private fun saveBinaryResourcesModifiedTime(time: Long) {
    sharedPref.edit().putLong(CHUNKS_APK_BUILD_TIME, time).apply()
  }

  private val binaryResourcesModifiedTime: Long by lazy {
    try {
      val packageName = reactApplicationContext.packageName
      val resourceId = reactApplicationContext.resources.getIdentifier(CHUNKS_APK_BUILD_TIME, "string", packageName)
      val resourceString = reactApplicationContext.resources.getString(resourceId).replace("\"", "")
      resourceString.toLong()
    } catch (e: Exception) {
      throw RuntimeException("[$NAME] Error getting binary resources modified time", e)
    }
  }

  private val sharedPref: SharedPreferences by lazy {
    reactApplicationContext.getSharedPreferences(CHUNKS_APK_BUILD_TIME, Context.MODE_PRIVATE)
  }
}
