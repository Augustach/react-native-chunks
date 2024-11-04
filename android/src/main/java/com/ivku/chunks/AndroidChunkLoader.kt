package com.ivku.chunks

import android.content.res.AssetManager
import androidx.annotation.Keep
import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.common.annotations.FrameworkAPI
import com.facebook.react.turbomodule.core.CallInvokerHolderImpl

// we use fbjni
@OptIn(FrameworkAPI::class)
@Suppress("KotlinJniMissingFunction") // we use fbjni.
class AndroidChunkLoader(context: ReactApplicationContext) {

  @DoNotStrip
  @Keep
  private var mHybridData: HybridData

  init {
    val jsCallInvokerHolder = context.catalystInstance.jsCallInvokerHolder as CallInvokerHolderImpl
    val jsRuntimeHolder =
      context.javaScriptContextHolder?.get() ?: throw Error("JSI Runtime is null! react-native-chunks does not yet support bridgeless mode..")
    mHybridData = initHybrid(jsRuntimeHolder, jsCallInvokerHolder)
  }

  external fun loadChunk(uri: String, name: String)

  external fun loadChunkFormAssets(assets: AssetManager, uri: String, name: String)

  // private C++ funcs
  private external fun initHybrid(jsContext: Long, jsCallInvokerHolder: CallInvokerHolderImpl): HybridData
}
