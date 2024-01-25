'use strict';

var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _datadome = _interopRequireDefault(require("./datadome"));
var _eventTracker = _interopRequireDefault(require("./event-tracker"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const barriers = [];
const makeAsyncBarrier = require("async-barrier");
module.exports = async function (url, options) {
  var datadome = false;
  const barrier = makeAsyncBarrier(2);
  barriers.push(barrier);
  if (options && options.datadome != null) {
    datadome = options.datadome;
  }
  var cookieToReplace = await _datadome.default.getInstance().getStoredDatadomeCookie();
  if (_reactNative.Platform.OS === 'android' && cookieToReplace != null && cookieToReplace != "") {
    options.headers.Cookie = mergeCookies(cookieToReplace, options.headers.Cookie);
  }
  var _response = null;
  var result = await fetch(url, options).then(response => {
    _response = response.clone();
    if (datadome == null || datadome == false) {
      barrier();
      return _response;
    }
    _datadome.default.getInstance().isFinished = barriers;
    _datadome.default.getInstance().handleDatadomeResponse(response);
    _eventTracker.default.logEvent(_datadome.default, url, options);
  });
  await barrier();
  if (_datadome.default.getInstance().error && _datadome.default.getInstance().error instanceof Error) {
    var errorToThrow = _datadome.default.getInstance().error;
    _datadome.default.getInstance().error = null;
    throw errorToThrow;
  }
  if (_datadome.default.getInstance().needRetry) {
    //DataDome.getInstance().needRetry = false;

    var storedCookie = await _datadome.default.getInstance().getStoredDatadomeCookie();
    var opt = options;
    if (_reactNative.Platform.OS === 'android' && storedCookie != null && storedCookie != "") {
      opt.headers.Cookie = mergeCookies(storedCookie, opt.headers.Cookie);
    }
    var resultFromRetry = await fetch(url, opt);
    return resultFromRetry;
  }
  return _response;
};
function mergeCookies(datadomeCookie, existingCookie) {
  if (!existingCookie || !existingCookie.trim()) {
    return datadomeCookie;
  }
  var attributes = existingCookie.split('; ');
  const datadomeValue = parseCookieValue(datadomeCookie, 'datadome');
  var added = false;
  for (var i = 0; i < attributes.length; i++) {
    var attribute = attributes[i];
    if (attribute.startsWith("datadome=")) {
      attributes[i] = "datadome=" + datadomeValue;
      added = true;
    }
  }
  if (!added) {
    attributes.push("datadome=" + datadomeValue);
  }
  const datadomeAttributes = datadomeCookie.split('; ');
  for (const attribute of datadomeAttributes) {
    var found = false;
    const key = attribute.split('=')[0];
    for (const existing of attributes) {
      if (existing.startsWith(key)) {
        found = true;
        break;
      }
    }
    if (!found) {
      attributes.push(attribute);
    }
  }
  return attributes.join('; ');
}
function parseCookieValue(cookieString, key) {
  var parts = cookieString.split("; ");
  for (const part of parts) {
    if (part.startsWith(key)) {
      var nameValue = part.split('=');
      return nameValue[1];
    }
  }
  return '';
}
function ArgumentError(message) {
  this.name = 'ArgumentError';
  this.message = message;
}
//# sourceMappingURL=datadome-fetch.js.map