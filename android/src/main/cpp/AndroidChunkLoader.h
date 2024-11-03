#pragma once

#include <ReactCommon/CallInvokerHolder.h>
#include <fbjni/fbjni.h>
#include <jsi/jsi.h>

#include <memory>
#include <string>

namespace react_native_chunks
{

    using namespace facebook;

    class AndroidChunkLoader : public jni::HybridClass<AndroidChunkLoader> {
    public:
        ~AndroidChunkLoader() override;
        static void registerNatives();

        jsi::Runtime* getJSRuntime() {
            return _runtime;
        }

        void loadChunk(const std::string &uri, const std::string &name);

    private:
        friend HybridBase;
        jsi::Runtime* _runtime;

        static auto constexpr TAG = "AndroidChunkLoader";
        static auto constexpr kJavaDescriptor = "Lcom/ivku/chunks/AndroidChunkLoader;";

        explicit AndroidChunkLoader(const jni::alias_ref<AndroidChunkLoader::jhybridobject>& javaThis, jsi::Runtime* jsRuntime,
                                    const std::shared_ptr<facebook::react::CallInvoker>& jsCallInvoker);
        static jni::local_ref<jhybriddata> initHybrid(jni::alias_ref<jhybridobject> javaThis, jlong jsRuntimePointer,
                                                      jni::alias_ref<facebook::react::CallInvokerHolder::javaobject> jsCallInvokerHolder);
    };
}
