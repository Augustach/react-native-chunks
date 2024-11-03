#import <React/RCTBridge+Private.h>
#import "Chunks.h"
#include <jsireact/JSIExecutor.h>

using namespace facebook::react;

@interface RCTBridge (JSIRuntime)
- (void *)runtime;
@end

@implementation Chunks

RCT_EXPORT_MODULE(Chunks);

@synthesize bridge = _bridge;

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(loadChunk:(NSString *)uri name:(NSString *)name)
{
  facebook::jsi::Runtime *jsiRuntime = [self.bridge respondsToSelector:@selector(runtime)]
          ? reinterpret_cast<facebook::jsi::Runtime *>(self.bridge.runtime)
          : nullptr;
  
  NSString *filePath = [uri stringByReplacingOccurrencesOfString:@"file://" withString:@""];
  if ([filePath hasPrefix:@"assets://"]) {
      filePath = [filePath substringFromIndex:@"assets://".length];
      NSArray<NSString *> *components = [filePath componentsSeparatedByString:@"."];
      filePath = [[NSBundle mainBundle] pathForResource:components.firstObject ofType:components.lastObject];
  }
    
  react_native_chunks::loadChunk(*jsiRuntime, [filePath UTF8String], [name UTF8String]);
  
  return @YES;
}

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
