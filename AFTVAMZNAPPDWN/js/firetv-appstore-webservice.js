'use strict';

var AppstoreWebService = function() { // jshint ignore:line
  var ERROR_TYPES = {
    'Unknown': 'Unknown error',
    'CustomerNotEntitledException': 'You do not own this app/game.',
    'DependentServiceException': 'Cannot download restricted/incompatible apps & games.'
  };
  var self = this;

  var getUrlPath = function(url) {
    var a = document.createElement('a');
    a.href = url;
    return a.pathname;
  };

  var withMethod = function(method) {
    self.method = method;
    return self;
  };

  var withUrl = function(url) {
    self.url = url;
    return self;
  };

  var withAdpToken = function(adpToken) {
    self.adpToken = adpToken;
    return self;
  };

  var withPrivateKey = function(privateKey) {
    self.privateKey = privateKey;
    return self;
  };

  var withContentType = function(contentType) {
    self.contentType = contentType;
    return self;
  };

  var withBody = function(body) {
    self.body = body;
    return self;
  };

  var onSuccess = function(callback) {
    self.onSuccessCallback = callback;
    return self;
  };

  var onError = function(callback) {
    self.onErrorCallback = callback;
    return self;
  };

  var useLegacyAuth = function(use) {
    self.legacyAuth = use;
    return self;
  };

  var getRequestDigest = function(callback) {
    var data = {
      method: self.method,
      path: getUrlPath(self.url),
      body: self.body,
      adpToken: self.adpToken,
      privateKey: self.privateKey,
      timestamp: +new Date()
    };

    if (window.location.href.indexOf('_generated_background_page.html') === -1) { // content scripts
      AppstoreUtils.bgSignRequest(data, self.legacyAuth, callback);
    } else {
      var requestDigest = AppstoreUtils.signRequest(data, self.legacyAuth);
      callback(requestDigest);
    }
  };

  var parseErrorType = function(header) {
    var tmp = header.split(':');
    return tmp[0];
  };

  var call = function() {
    getRequestDigest(function(requestDigest) {
      var xhr = new XMLHttpRequest();
      xhr.onload = function() {
        if (xhr.status !== 200) {
          var errorTypeHeader = xhr.getResponseHeader('x-amzn-ErrorType');
          var errorType;
          if (errorTypeHeader) {
            errorType = parseErrorType(errorTypeHeader);
          }
          if (!errorType) {
            errorType = 'Unknown';
          }

          var errorMessage = ERROR_TYPES[errorType];
          self.onErrorCallback && self.onErrorCallback(errorType, errorMessage);
        } else {
          self.onSuccessCallback.call(xhr);
        }
      };

      xhr.open(self.method, self.url, true);
      xhr.setRequestHeader('Content-Type', self.contentType);

      if (self.legacyAuth) {
        xhr.setRequestHeader('X-ADP-Request-Digest', requestDigest);
        xhr.setRequestHeader('X-ADP-Authentication-Token', self.adpToken);
      } else {
        xhr.setRequestHeader('x-adp-alg', 'SHA256WithRSA:1.0');
        xhr.setRequestHeader('x-adp-signature', requestDigest);
        xhr.setRequestHeader('x-adp-token', self.adpToken);
      }

      xhr.send(self.body);
    });
  };

  this.useLegacyAuth = useLegacyAuth;
  this.withMethod = withMethod;
  this.withContentType = withContentType;
  this.withBody = withBody;
  this.withUrl = withUrl;
  this.withAdpToken = withAdpToken;
  this.withPrivateKey = withPrivateKey;
  this.onSuccess = onSuccess;
  this.onError = onError;
  this.call = call;
};