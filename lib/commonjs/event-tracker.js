"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _reactNative = require("react-native");
var _datadomeModule = _interopRequireDefault(require("./datadome-module"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class EventTracker {
  static lastTrackedRequestTime = 0;
  static logEvent = async (DataDome, url, options) => {
    let key = DataDome.getInstance().getSdkKey();
    let cookie = await DataDome.getInstance().getStoredDatadomeCookie();
    // no cookie is set with Lambda@Edge be cause set-cookie header is not sent
    if (cookie == null) {
      cookie = "";
    }
    // payload sender interval of 10 seconds
    if (Date.now() - EventTracker.lastTrackedRequestTime < 10000) {
      return;
    }
    fetch('https://api-sdk.datadome.co/sdk/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: await EventTracker.body(DataDome, url, key, cookie, options)
    }).then(function (response) {
      return response.json();
    }).then(function (json) {
      DataDome.getInstance().storeCookie(json.cookie);
      EventTracker.lastTrackedRequestTime = Date.now();
    });
  };
  static body = async (DataDome, url, key, cookie, options) => {
    var os = _reactNative.Platform.OS;
    if (os == "android") {
      os = "Android";
    } else if (os == "ios") {
      os = "iOS";
    }
    var details = {
      'cid': DataDome.getInstance().parseDataDomeCookie(cookie),
      'ddv': '1.2.1',
      'ddvc': await _datadomeModule.default.appVersion(),
      'ddk': key,
      'request': url,
      'os': os,
      'osr': await _datadomeModule.default.systemVersion(),
      'osn': await _datadomeModule.default.systemName(),
      'osv': await _datadomeModule.default.systemShortVersion(),
      'mdl': await _datadomeModule.default.deviceModel(),
      'ua': options.headers['User-Agent'],
      'inte': 'react-native-fetch',
      'screen_x': await _datadomeModule.default.deviceScreenWidth(),
      'screen_y': await _datadomeModule.default.deviceScreenHeight(),
      'screen_d': await _datadomeModule.default.deviceScreenScale(),
      'events': '[]',
      'camera': '{"auth":false, "info":""}'
    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    return formBody;
  };
}
exports.default = EventTracker;
//# sourceMappingURL=event-tracker.js.map