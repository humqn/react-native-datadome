import React, { Component } from 'react';
import { View, Modal } from 'react-native';
import { WebView } from 'react-native-webview';

export default class DataDomeModal extends React.Component {
  state = {
    modalVisible: false,
    uri: "",
    onCaptchaPassed: (newDDCookie) => {},
    onError: (errorMessage) => {},
  };

  componentDidMount() {
    this.props.onRef(this)
  }

  componentWillUnmount() {
    this.props.onRef(undefined)
  }

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  setOnCaptchaPassed(onCaptchaPassed) {
    this.setState({onCaptchaPassed: onCaptchaPassed});
  }

  setOnError(onError) {
    this.setState({onError: onError});
  }

  openView(url, onCaptchaPassed, onError) {
    this.setState({uri: url});
    this.setOnCaptchaPassed(onCaptchaPassed)
    this.setOnError(onError)
    this.setState({modalVisible: true});
  }

  parseNewCookieValue(cookieString) {
    var parts = cookieString.split(";");
    var nameValue = parts.shift().split("=");
    var name = nameValue.shift();
    var value = nameValue.join("=");
    return value;
  }

  render() {
    return (
      <View>
      <Modal
      animationType="slide"
      transparent={false}
      visible={this.state.modalVisible}
      onRequestClose={() => {
        this.state.onError("DATADOME ERROR: Captcha page closed before being passed");
        this.setModalVisible(false);
      }}
      >
      <WebView
      originWhitelist={['*']}
      source={{uri: this.state.uri}}
      style={{marginTop: 20}}
      incognito={true}
      onMessage={ syntheticEvent => {
        var wholeCookie = syntheticEvent.nativeEvent.data;
        var cookie = wholeCookie;//this.parseNewCookieValue(wholeCookie);
        this.state.onCaptchaPassed(cookie);
        this.setModalVisible(false);
      }}
      />
      </Modal>
      </View>
      );
  }
}
