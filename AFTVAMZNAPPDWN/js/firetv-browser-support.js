'use strict';

/**
 * Handles runtime operations for FireTV Appstore APK Downloader.
 */
var BrowserRuntime = (function() { // jshint ignore:line
  function getURL(file) {
    return chrome.runtime.getURL(file);
  }

  return {
    getURL: getURL
  };
})();

/**
 * Messaging system to handle communication between components.
 */
var BrowserMessage = (function() { // jshint ignore:line
  function sendMessage(message, callback) {
    chrome.runtime.sendMessage(message, callback);
  }

  function addMessageListener(fn) {
    chrome.runtime.onMessage.addListener(fn);
  }

  return {
    sendMessage: sendMessage,
    addMessageListener: addMessageListener
  };
})();

/**
 * Storage handler for managing extension-specific settings and data.
 */
var BrowserStorage = (function() { // jshint ignore:line
  var STORAGE = chrome.storage.local;

  function get(field, callback) {
    STORAGE.get(field, function(result) {
      console.log(`[BrowserStorage] Retrieved: ${field}`, result);
      callback(result);
    });
  }

  function set(data, callback) {
    console.log(`[BrowserStorage] Saving:`, data);
    STORAGE.set(data, callback);
  }

  function remove(key, callback) {
    console.log(`[BrowserStorage] Removing:`, key);
    STORAGE.remove(key, callback);
  }

  return {
    get: get,
    set: set,
    remove: remove
  };
})();

/**
 * Manages file downloads via the Chrome Downloads API.
 */
var BrowserDownloads = (function() { // jshint ignore:line
  function download(url, filename) {
    console.log(`[BrowserDownloads] Downloading: ${filename} from ${url}`);
    chrome.downloads.download({
      url: url,
      filename: filename
    });
  }

  return {
    download: download
  };
})();

/**
 * Handles operations related to browser tabs.
 */
var BrowserTabs = (function() { // jshint ignore:line
  function create(options) {
    console.log(`[BrowserTabs] Creating tab with options:`, options);
    chrome.tabs.create(options);
  }

  function sendMessage(tabId, message, callback) {
    console.log(`[BrowserTabs] Sending message to tab ${tabId}:`, message);
    chrome.tabs.sendMessage(tabId, message, callback);
  }

  return {
    create: create,
    sendMessage: sendMessage
  };
})();
