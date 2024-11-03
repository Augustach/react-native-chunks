#include "AndroidChunkLoader.h"
#include "ChunkLoader.h"

#include <memory>
#include <string>
#include <utility>

#include <jsi/jsi.h>

namespace react_native_chunks
{
    using TSelf = facebook::jni::local_ref<facebook::jni::HybridClass<AndroidChunkLoader>::jhybriddata>;
    using TJSCallInvokerHolder = jni::alias_ref<facebook::react::CallInvokerHolder::javaobject>;
    using TScheduler = jni::alias_ref<AndroidChunkLoader::javaobject>;

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

    void AndroidChunkLoader::registerNatives()
    {
        registerHybrid({makeNativeMethod("initHybrid", AndroidChunkLoader::initHybrid),
                        makeNativeMethod("loadChunk", AndroidChunkLoader::loadChunk)});
    }

    TSelf AndroidChunkLoader::initHybrid(facebook::jni::alias_ref<jhybridobject> jThis, jlong jsRuntimePointer, TJSCallInvokerHolder jsCallInvokerHolder)
    {
        auto jsRuntime = reinterpret_cast<jsi::Runtime *>(jsRuntimePointer);
        auto jsCallInvoker = jsCallInvokerHolder->cthis()->getCallInvoker();

        return makeCxxInstance(jThis, jsRuntime, jsCallInvoker);
    }
}
