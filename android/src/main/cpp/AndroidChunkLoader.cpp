#include "AndroidChunkLoader.h"
#include "ChunkLoader.h"

#include <memory>
#include <string>
#include <utility>

#include <jsi/jsi.h>
#include <cxxreact/JSBigString.h>
#include <android/asset_manager_jni.h>

namespace react_native_chunks {
    // origin - https://github.com/facebook/react-native/blob/cba1d4bae7285ba160b05f31ca18cfa0b91e9ef5/packages/react-native/ReactAndroid/src/main/jni/react/jni/JSLoader.cpp#L25C1-L49C1
    class AssetManagerString : public facebook::react::JSBigString {
    public:
        explicit AssetManagerString(AAsset* asset) : asset_(asset){};

        virtual ~AssetManagerString() {
            AAsset_close(asset_);
        }

        bool isAscii() const override {
            return false;
        }

        const char* c_str() const override {
            return (const char*)AAsset_getBuffer(asset_);
        }

        size_t size() const override {
            return AAsset_getLength(asset_);
        }

    private:
        AAsset* asset_;
    };
}

namespace react_native_chunks
{
    using TSelf = facebook::jni::local_ref<facebook::jni::HybridClass<AndroidChunkLoader>::jhybriddata>;
    using TJSCallInvokerHolder = jni::alias_ref<facebook::react::CallInvokerHolder::javaobject>;

    AndroidChunkLoader::AndroidChunkLoader(const jni::alias_ref<AndroidChunkLoader::jhybridobject> &javaThis, jsi::Runtime *runtime,
                                           const std::shared_ptr<facebook::react::CallInvoker> &callInvoker)
    {
        _runtime = runtime;
    }

    AndroidChunkLoader::~AndroidChunkLoader() = default;

    void AndroidChunkLoader::loadChunk(const std::string &uri, const std::string &name)
    {
        react_native_chunks::loadChunk(*getJSRuntime(), uri, name);
    }

    void AndroidChunkLoader::loadChunkFormAssets(const jni::alias_ref<JAssetManager::javaobject>& assetManager, const std::string &assetName, const std::string &name) {
        auto env = facebook::jni::Environment::current();
        auto manager = AAssetManager_fromJava(env, assetManager.get());

        // https://github.com/facebook/react-native/blob/cba1d4bae7285ba160b05f31ca18cfa0b91e9ef5/packages/react-native/ReactAndroid/src/main/jni/react/jni/JSLoader.cpp#L65
        auto asset = AAssetManager_open(
                manager,
                assetName.c_str(),
                AASSET_MODE_STREAMING); // Optimized for sequential read: see
        // AssetManager.java for docs

        if (asset) {
            auto script = std::make_unique<AssetManagerString>(asset);
            react_native_chunks::loadChunkFromBuffer(*getJSRuntime(), std::move(script), name);
        }
    }

    void AndroidChunkLoader::registerNatives()
    {
        registerHybrid({
            makeNativeMethod("initHybrid", AndroidChunkLoader::initHybrid),
            makeNativeMethod("loadChunk", AndroidChunkLoader::loadChunk),
            makeNativeMethod("loadChunkFormAssets", AndroidChunkLoader::loadChunkFormAssets)
        });
    }

    TSelf AndroidChunkLoader::initHybrid(facebook::jni::alias_ref<jhybridobject> jThis, jlong jsRuntimePointer, TJSCallInvokerHolder jsCallInvokerHolder)
    {
        auto jsRuntime = reinterpret_cast<jsi::Runtime *>(jsRuntimePointer);
        auto jsCallInvoker = jsCallInvokerHolder->cthis()->getCallInvoker();

        return makeCxxInstance(jThis, jsRuntime, jsCallInvoker);
    }
}
