#pragma once

#include <jsi/jsi.h>
#include <string>
#include <cxxreact/JSBigString.h>

namespace react_native_chunks
{
  void loadChunk(facebook::jsi::Runtime &runtime, const std::string &uri, const std::string &name);

  void loadChunkFromBuffer(facebook::jsi::Runtime &runtime, std::unique_ptr<facebook::react::JSBigString> script, const std::string &name);
}
