//
//  RNDatadome.m
//  RNDatadome
//
//  Created by Hugh Maurer on 10/11/2019.
//  Copyright (c) 2019 DataDome. All rights reserved.
//

#import "RNDatadome.h"
#import <React/RCTLog.h>
#import <sys/utsname.h>
#import <UIKit/UIKit.h>

@implementation RNDatadome

RCT_EXPORT_MODULE(RNDatadome)

RCT_EXPORT_METHOD(setDataDomeCookie:(NSString *)cookie) {
    RCTLogInfo(@"Setting cookie %@", cookie);
    
    NSMutableDictionary *properties = [[NSMutableDictionary alloc] init];
    NSArray *elements = [cookie componentsSeparatedByString: @"; "];
    for (NSString *element in elements) {
        NSArray *attributes = [element componentsSeparatedByString:@"="];
        NSString *key = attributes[0];
        if ([[key lowercaseString] isEqualToString:@"datadome"]) {
            properties[NSHTTPCookieName] = key;
            properties[NSHTTPCookieValue] = attributes[1];
        }
        
        if ([[key lowercaseString] isEqualToString:@"max-age"]) {
            properties[NSHTTPCookieMaximumAge] = attributes[1];
        }
        
        if ([[key lowercaseString] isEqualToString:@"domain"]) {
            properties[NSHTTPCookieDomain] = attributes[1];
        }
        
        if ([[key lowercaseString] isEqualToString:@"path"]) {
            properties[NSHTTPCookiePath] = attributes[1];
        }
        
        if ([[key lowercaseString] isEqualToString:@"secure"]) {
            properties[NSHTTPCookieSecure] = @"TRUE";
        }
        
        if (@available(iOS 13.0, *)) {
            if ([[key lowercaseString] isEqualToString:@"samesite"]) {
                properties[NSHTTPCookieSameSitePolicy] = attributes[1];
            }
        }
    }
            
    NSHTTPCookie *forged = [[NSHTTPCookie alloc] initWithProperties:properties];
    if (forged == nil) {
        RCTLogError(@"Unable to create a new cookie");
        return;
    }
    
    [[NSHTTPCookieStorage sharedHTTPCookieStorage] setCookie:forged];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(appVersion) {
    NSString *version = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"];
    return version ? version : @"1.0";
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(systemVersion) {
    return [[UIDevice currentDevice] systemVersion];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(systemName) {
    return [[UIDevice currentDevice] systemName];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(systemShortVersion) {
    CGFloat version = (([[UIDevice currentDevice] systemVersion].floatValue * 10.0) / 10.0);
    NSString *versionString = [NSString stringWithFormat:@"%.1f", version];
    return versionString;
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(deviceModel) {
    struct utsname systemInfo;
    uname(&systemInfo);
    
    NSString *model = [NSString stringWithCString:systemInfo.machine encoding:NSUTF8StringEncoding];
    return model;
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(deviceScreenWidth) {
    NSString *widthString = [NSString stringWithFormat:@"%.1f", UIScreen.mainScreen.nativeBounds.size.width];
    return widthString;
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(deviceScreenHeight) {
    NSString *heightString = [NSString stringWithFormat:@"%.1f", UIScreen.mainScreen.nativeBounds.size.height];
    return heightString;
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(deviceScreenScale) {
    NSString *scaleString = [NSString stringWithFormat:@"%.1f", UIScreen.mainScreen.nativeScale];
    return scaleString;
}

@end
