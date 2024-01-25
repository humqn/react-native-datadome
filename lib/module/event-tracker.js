import { Platform } from 'react-native';
import RNDatadome from './datadome-module';
export default class EventTracker {
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
    var os = Platform.OS;
    if (os == "android") {
      os = "Android";
    } else if (os == "ios") {
      os = "iOS";
    }
    var details = {
      'cid': DataDome.getInstance().parseDataDomeCookie(cookie),
      'ddv': '1.2.1',
      'ddvc': await RNDatadome.appVersion(),
      'ddk': key,
      'request': url,
      'os': os,
      'osr': await RNDatadome.systemVersion(),
      'osn': await RNDatadome.systemName(),
      'osv': await RNDatadome.systemShortVersion(),
      'mdl': await RNDatadome.deviceModel(),
      'ua': options.headers['User-Agent'],
      'inte': 'react-native-fetch',
      'screen_x': await RNDatadome.deviceScreenWidth(),
      'screen_y': await RNDatadome.deviceScreenHeight(),
      'screen_d': await RNDatadome.deviceScreenScale(),
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
//# sourceMappingURL=event-tracker.js.map