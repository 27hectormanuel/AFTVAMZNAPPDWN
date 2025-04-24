"use strict";

var AppstoreUtils = {
  APP_NAME: "com.amazon.venezia",
  APP_VERSION: "110037310",
  OS_VERSION: "8.0", // Updated for Fire OS compatibility
  DEVICE_MODEL: "AFTMM", // Updated for Fire TV model

  DEVICE_TYPE_MAIN: "NS6268", // Fire TV device type
  DEVICE_TYPE_ASSOCIATED: "A3GFS040JDOGQR", // Associated device type

  // Sign API requests with device credentials
  signRequest: function(data, useLegacyAuth) {
    var utcTime = (new Date(data.timestamp)).toISOString().replace(/\.[0-9]+Z/, "Z");

    var content = [
      data.method,
      data.path,
      utcTime,
      data.body,
      data.adpToken
    ];

    return RequestSigner.sign(data.privateKey, content.join("\n"), useLegacyAuth) + ":" + utcTime;
  },

  bgSignRequest: function(data, useLegacyAuth, callback) {
    BrowserMessage.sendMessage(
      {
        cmd: "signRequest",
        data: data,
        useLegacyAuth: useLegacyAuth
      },
      callback
    );
  },

  getPid: function(deviceSerial) {
    var shaObj = new jsSHA(deviceSerial, "TEXT"); // jshint ignore:line
    return shaObj.getHash("SHA-256", "HEX").substring(23, 31).toUpperCase();
  },

  getDeviceSerial: function(callback, force) {
    BrowserStorage.get("global_device_serial", function(data) {
      if (force || !data || !data.global_device_serial) {
        var deviceSerial = AppstoreUtils.generateDeviceSerial();
        BrowserStorage.set(
          {
            global_device_serial: deviceSerial
          },
          function() {
            callback && callback(deviceSerial);
          }
        );
      } else {
        callback && callback(data.global_device_serial);
      }
    });
  },

  generateDeviceSerial: function() {
    // Ensure the serial format aligns with Fire TV requirements
    var uuid = window.uuid.v4();
    return uuid.replace(/\-/g, "").toUpperCase();
  },

  stringToHex: function(str) {
    var hex = "";
    for (var i = 0, length = str.length; i < length; i++) {
      hex += "" + str.charCodeAt(i).toString(16);
    }
    return hex;
  },

  getOa2ClientId: function(deviceSerial, deviceType) {
    // Generate a valid OAuth2 client ID
    return "device:" + AppstoreUtils.stringToHex(deviceSerial + "#" + deviceType);
  },

  isValidUser: function(user) {
    return (
      AppstoreUtils.containKeys(user, ["access_token", "device"]) &&
      AppstoreUtils.containKeys(user.device, [
        "associated_adp_token",
        "associated_device_private_key",
        "device_model",
        "device_serial",
        "main_adp_token",
        "main_device_private_key"
      ])
    );
  },

  containKeys: function(obj, compared) {
    var keys = Object.keys(obj);
    for (var i = 0, size = compared.length; i < size; i++) {
      var k = compared[i];
      if (keys.indexOf(k) === -1) {
        console.log("containValues: missing " + k);
        return false;
      }
    }
    return true;
  }
};
