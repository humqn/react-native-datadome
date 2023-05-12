import React, { Component } from 'react';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EventTracker from './event-tracker';

import makeAsyncBarrier from 'async-barrier';
import RNDatadome from './datadome-module';


export default class DataDome {

  static instance = null;
  static getInstance() {
    if (DataDome.instance == null) {
      DataDome.instance = new DataDome();
    }
    return this.instance;
  }

  _sdkKey = ""
  _containerViewRef = null
  _userAgent = ""
  _bypassAcceptHeader = false
  _lastDatadomeCookie = ""
  _captchaVisible = false

  isFinished = null;
  error = null;
  needRetry = false;

  getSdkKey() {
    return this._sdkKey;
  }
  setSdkKey(sdkKey) {
    this._sdkKey = sdkKey;
  }

  getContainerViewRef() {
    return this._containerViewRef;
  }
  setContainerViewRef(containerViewRef) {
    this._containerViewRef = containerViewRef;
  }

  static setContainer(captchaContainerView) {
    if (DataDome.instance == null) {
      DataDome.instance = new DataDome();
    }
    this.instance.setContainerViewRef(captchaContainerView);
  }

  getUserAgent() {
    return this._userAgent;
  }
  setUserAgent(userAgent) {
    this._userAgent = userAgent;
  }

  getBypassAcceptHeader() {
    return this._bypassAcceptHeader;
  }
  setBypassAcceptHeader(bypassAcceptHeader) {
    this._bypassAcceptHeader = bypassAcceptHeader;
  }

  getCaptchaVisible() {
    return this._captchaVisible;
  }

  parseDataDomeCookie(cookieString) {
    if(cookieString == "") {
      return ""
    }
    var datadomeCookie = "";
    var parts = cookieString.split(";");
    parts.forEach(function (item) {
      var nameValue = item.split("=");
      if (nameValue.shift() === "datadome") {
        datadomeCookie = nameValue.join("=");
      }
    })
    return datadomeCookie;
  }

  static configure(sdkKey, captchaContainerView) {
    if (DataDome.instance == null) {
      DataDome.instance = new DataDome();
    }
    this.instance.setSdkKey(sdkKey);
    this.instance.setContainerViewRef(captchaContainerView);

    return this.instance;
  }

  getHeaders() {
    let headers = {};
    if (!this.getBypassAcceptHeader()) {
      headers["Accept"] = "application/json"
    }
    if (!this.getUserAgent() === "") {
      headers["User-Agent"] = this.getUserAgent();
    }
    return headers
  }

  isDataDomeResponse(response) {
    var dd = response.headers.get("x-dd-b");
    return ((response.status == 403 || response.status == 401) && (dd != null));
  }

  async storeCookie(ddCookie) {
    try {
      if (ddCookie === null || ddCookie === undefined) {
        return
      }
      
      await AsyncStorage.setItem('datadome_cookie_key', ddCookie)
      RNDatadome.setDataDomeCookie(ddCookie);
    } catch (e) {
      console.error(e)
    }
  }

  async storeCookieAndRemoveBarrier(ddCookie, barrier) {
    await this.storeCookie(ddCookie);
    if (this.isFinished != null) {
      for (const aBarrier of this.isFinished) {
        aBarrier();
      }
    }
    barrier();
  }

  async finishWithError(errorMessage) {
    this.error = Error(errorMessage);
    if (this.isFinished != null) {
      for (const aBarrier of this.isFinished) {
        aBarrier();
      }
    }
  }

  async getStoredDatadomeCookie() {
    try {
      const value = await AsyncStorage.getItem('datadome_cookie_key');
      if(value == null) {
        return ""
      }
      return value;
    } catch(e) {
      console.error(e)
      return "";
    }
  }

  static async getDataDomeCookie() {
    try {
      const value = await AsyncStorage.getItem('datadome_cookie_key');
      return value;
    } catch(e) {
      return null;
    }
  }

  async readAndStoreCookie(response) {
    if (this._lastDatadomeCookie == null || this._lastDatadomeCookie == "") {
      var storedCookie = await this.getStoredDatadomeCookie();
      this._lastDatadomeCookie = storedCookie;
    }

    var cookieString = response.headers.get("Set-Cookie");
    if (cookieString == null || cookieString == undefined || cookieString == "" || !cookieString.includes("datadome=")) {
      return this._lastDatadomeCookie;
    }

    this._lastDatadomeCookie = cookieString;
    await this.storeCookie(cookieString);

    return cookieString;
  }

  async handleDatadomeResponse(response) {

    var ddCookie = await this.readAndStoreCookie(response);

    if (!this.isDataDomeResponse(response)) {
      if (this.isFinished != null) {
        for (const aBarrier of this.isFinished) {
          aBarrier();
        }
      }
      return response;
    }

    const barrier = makeAsyncBarrier(2);
    var json = await response.json();

    var url = json.url;
    if (url == null || url === "") {
      this.finishWithError("DATADOME ERROR: Problem on parsing of DataDomeResponse (No url object)");
      return;
    }

    if (this.getContainerViewRef() == null) {
      this.finishWithError("DATADOME ERROR: Can't show captcha page (No container)");
      return;
    }

    if (this.getCaptchaVisible()) {
      //this.finishWithError("DATADOME ERROR: Can't show captcha page (One is already in progress)");
      return;
    } else {
      this._captchaVisible = true;
    }

    this.getContainerViewRef().openView(url, (newDDCookie) => {
      this._lastDatadomeCookie = newDDCookie;
      this.storeCookieAndRemoveBarrier(newDDCookie, barrier)
      this._captchaVisible = false;
      this.needRetry = true;

      // Captcha passed here
    }, (errorMessage) => {
      console.error('Error while resolving captcha ' + errorMessage)
      this._captchaVisible = false;
      this.needRetry = false;

      this.finishWithError(errorMessage);
      barrier();
    });

    await barrier();
    if (this.needRetry == null) {
      this.needRetry = false;
    }
  }
}
