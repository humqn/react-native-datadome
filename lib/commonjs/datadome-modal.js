"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _reactNativeWebview = require("react-native-webview");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
class DataDomeModal extends _react.default.Component {
  state = {
    modalVisible: false,
    uri: "",
    onCaptchaPassed: newDDCookie => {},
    onError: errorMessage => {}
  };
  componentDidMount() {
    this.props.onRef(this);
  }
  componentWillUnmount() {
    this.props.onRef(undefined);
  }
  setModalVisible(visible) {
    this.setState({
      modalVisible: visible
    });
  }
  setOnCaptchaPassed(onCaptchaPassed) {
    this.setState({
      onCaptchaPassed: onCaptchaPassed
    });
  }
  setOnError(onError) {
    this.setState({
      onError: onError
    });
  }
  openView(url, onCaptchaPassed, onError) {
    this.setState({
      uri: url
    });
    this.setOnCaptchaPassed(onCaptchaPassed);
    this.setOnError(onError);
    this.setState({
      modalVisible: true
    });
  }
  parseNewCookieValue(cookieString) {
    var parts = cookieString.split(";");
    var nameValue = parts.shift().split("=");
    var name = nameValue.shift();
    var value = nameValue.join("=");
    return value;
  }
  render() {
    return /*#__PURE__*/_react.default.createElement(_reactNative.View, null, /*#__PURE__*/_react.default.createElement(_reactNative.Modal, {
      animationType: "slide",
      transparent: false,
      visible: this.state.modalVisible,
      onRequestClose: () => {
        this.state.onError("DATADOME ERROR: Captcha page closed before being passed");
        this.setModalVisible(false);
      }
    }, /*#__PURE__*/_react.default.createElement(_reactNativeWebview.WebView, {
      originWhitelist: ['*'],
      source: {
        uri: this.state.uri
      },
      style: {
        marginTop: 20
      },
      incognito: true,
      onMessage: syntheticEvent => {
        var wholeCookie = syntheticEvent.nativeEvent.data;
        var cookie = wholeCookie; //this.parseNewCookieValue(wholeCookie);
        this.state.onCaptchaPassed(cookie);
        this.setModalVisible(false);
      }
    })));
  }
}
exports.default = DataDomeModal;
//# sourceMappingURL=datadome-modal.js.map