'use strict';


import React, { Component } from 'react';
import { Platform } from 'react-native';
import DataDome from './datadome'
import EventTracker from './event-tracker'

const barriers = [];
const makeAsyncBarrier = require("async-barrier");

module.exports = async function(url, options) {
  var datadome = false;
  const barrier = makeAsyncBarrier(2);
  barriers.push(barrier);

  if (options && options.datadome != null) {
    datadome = options.datadome;
  }

  var cookieToReplace = await DataDome.getInstance().getStoredDatadomeCookie();
  if (Platform.OS === 'android' && cookieToReplace != null && cookieToReplace != "") {
    options.headers.Cookie = mergeCookies(cookieToReplace, options.headers.Cookie);
  }

  var _response = null;

  var result = await fetch(url, options)
  .then((response) => {
    _response = response.clone();
    if (datadome == null || datadome == false) {
      barrier();
      return _response;
    }
    DataDome.getInstance().isFinished = barriers;
    DataDome.getInstance().handleDatadomeResponse(response);
    EventTracker.logEvent(DataDome, url, options);
  });

  await barrier();

  if (DataDome.getInstance().error && DataDome.getInstance().error instanceof Error) {
    var errorToThrow = DataDome.getInstance().error;
    DataDome.getInstance().error = null;
    throw errorToThrow;
  }

  if (DataDome.getInstance().needRetry) {
    //DataDome.getInstance().needRetry = false;

    var storedCookie = await DataDome.getInstance().getStoredDatadomeCookie();
    var opt = options;
    if (Platform.OS === 'android' && storedCookie != null && storedCookie != "") {
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

  var attributes = existingCookie.split('; ')
  const datadomeValue = parseCookieValue(datadomeCookie, 'datadome')

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

  const datadomeAttributes = datadomeCookie.split('; ')
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
      attributes.push(attribute)
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
