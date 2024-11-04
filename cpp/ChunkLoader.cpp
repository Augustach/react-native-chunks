#include "ChunkLoader.h"
#include <jsireact/JSIExecutor.h>

using namespace facebook::react;

namespace react_native_chunks
{
  void loadChunk(facebook::jsi::Runtime &runtime, const std::string &uri, const std::string &name)
  {
    auto script = JSBigFileString::fromPath(uri);
    runtime.evaluateJavaScript(std::make_unique<BigStringBuffer>(std::move(script)), name);
  }

  void loadChunkFromBuffer(facebook::jsi::Runtime &runtime, std::unique_ptr<facebook::react::JSBigString> script, const std::string &name) {
      runtime.evaluateJavaScript(std::make_unique<BigStringBuffer>(std::move(script)), name);
  }
}
