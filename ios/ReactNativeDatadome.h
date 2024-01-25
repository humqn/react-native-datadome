
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNReactNativeDatadomeSpec.h"

@interface ReactNativeDatadome : NSObject <NativeReactNativeDatadomeSpec>
#else
#import <React/RCTBridgeModule.h>

@interface ReactNativeDatadome : NSObject <RCTBridgeModule>
#endif

@end
