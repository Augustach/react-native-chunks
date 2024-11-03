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
}
