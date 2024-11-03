#include <fbjni/fbjni.h>
#include <jni.h>

#include "ChunkLoader.h"
#include "AndroidChunkLoader.h"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *)
{
    return facebook::jni::initialize(vm, [] {
        react_native_chunks::AndroidChunkLoader::registerNatives();
    });
}
