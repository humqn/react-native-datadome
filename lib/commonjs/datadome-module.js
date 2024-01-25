"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _reactNative = require("react-native");
const LINKING_ERROR = `The package '@datadome/react-native-datadome' doesn't seem to be linked. Make sure: \n\n` + _reactNative.Platform.select({
  ios: "- You have run 'pod install'\n",
  default: ''
}) + '- You rebuilt the app after installing the package\n' + '- You are not using Expo Go\n';
const ReactNativeDatadome = _reactNative.NativeModules.ReactNativeDatadome ? _reactNative.NativeModules.ReactNativeDatadome : new Proxy({}, {
  get() {
    throw new Error(LINKING_ERROR);
  }
});
var _default = exports.default = ReactNativeDatadome;
//# sourceMappingURL=datadome-module.js.map