#pragma once

#include <jsi/jsi.h>
#include <string>

namespace react_native_chunks
{
  void loadChunk(facebook::jsi::Runtime &runtime, const std::string &uri, const std::string &name);
}
