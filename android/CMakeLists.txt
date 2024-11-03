cmake_minimum_required(VERSION 3.8)
project(ReactNativeChunks)

set(PACKAGE_NAME "ReactNativeChunks")
set(BUILD_DIR ${CMAKE_SOURCE_DIR}/build)
set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 20)


include("${NODE_MODULES_DIR}/react-native/ReactAndroid/cmake-utils/folly-flags.cmake")
add_compile_options(${folly_FLAGS})

find_package(ReactAndroid REQUIRED CONFIG)
find_package(fbjni REQUIRED CONFIG)

add_library(
    ${PACKAGE_NAME}
    SHARED
    ../cpp/ChunkLoader.cpp
    ChunksModule.cpp
    src/main/cpp/AndroidChunkLoader.cpp
)

# Header Search Paths (includes)
target_include_directories(
    ${PACKAGE_NAME}
    PRIVATE
    "../cpp"
    "src/main/cpp"
    "${NODE_MODULES_DIR}/react-native/ReactCommon"
    "${NODE_MODULES_DIR}/react-native/ReactCommon/jsiexecutor"
    "${NODE_MODULES_DIR}/react-native/ReactCommon/jsiexecutor/jsireact"
    "${NODE_MODULES_DIR}/react-native/ReactCommon/runtimeexecutor"
    "${NODE_MODULES_DIR}/react-native/ReactCommon/callinvoker"
    "${NODE_MODULES_DIR}/react-native/ReactAndroid/src/main/jni/react/turbomodule" # <-- CallInvokerHolder JNI wrapper
)

# Link everything together
target_link_libraries(
        ${PACKAGE_NAME}
        android                             # <-- Android JNI core
        ReactAndroid::jsi                   # <-- RN: JSI
        ReactAndroid::folly_runtime
        ReactAndroid::reactnativejni        # <-- RN: React Native JNI bindings
        fbjni::fbjni                        # <-- fbjni
)
