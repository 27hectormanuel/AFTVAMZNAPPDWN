"use strict";

var AppstoreAPI = {
  // API Endpoints
  API_OAUTH2_SIGNIN: "https://www.amazon.com/ap/signin",
  API_AUTH_REGISTER: "https://api.amazon.com/auth/register",
  API_REGISTER_DEVICE: "https://firs-ta-g7g.amazon.com/FirsProxy/registerDevice",
  API_REGISTER_ASSOCIATED_DEVICE: "https://firs-ta-g7g.amazon.com/FirsProxy/registerAssociatedDevice",
  API_GET_DOWNLOAD_URL: "https://mas-ext.amazon.com/getDownloadUrl",
  API_APPSTORE_ONLY_REGISTER_DEVICE: "https://mas-ext.amazon.com/appstoreOnlyRegisterDevice",

  // Handle user registration
  register: function (user, callback, onError) {
    if (!user || !user.access_token) {
      console.error("Access token is missing!");
      onError && onError("Access token is required.");
      return;
    }

    var json = {
      requested_extensions: ["device_info", "customer_info"],
      auth_data: {
        access_token: user.access_token,
        use_global_authentication: "true",
      },
      registration_data: {
        device_model: "AFTMM", // Fire TV model
        device_type: AppstoreUtils.DEVICE_TYPE_ASSOCIATED, // Fire TV type
        os_version: "Fire OS 7.0.3", // Fire OS version
      },
      requested_token_type: ["bearer", "mac_dms"],
    };

    var requestBody = JSON.stringify(json);

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      if (xhr.status !== 200) {
        console.error("Registration failed:", xhr.responseText);
        onError && onError(xhr.responseText);
      } else {
        var response = JSON.parse(xhr.responseText);
        console.log("User registration successful:", response);
        callback && callback(user, response.response || null);
      }
    };

    xhr.open("POST", AppstoreAPI.API_AUTH_REGISTER, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(requestBody);
  },

  // Handle device registration
  registerDevice: function (accessToken, deviceInfo, callback, onError) {
    if (!accessToken) {
      console.error("Access token is missing for device registration!");
      onError && onError("Access token is required.");
      return;
    }

    var xml = '<?xml version="1.0" encoding="UTF-8"?>' +
      "<request>" +
      "<parameters>" +
      "<deviceType>" + AppstoreUtils.DEVICE_TYPE_MAIN + "</deviceType>" +
      "<deviceSerialNumber>" + deviceInfo.device_serial + "</deviceSerialNumber>" +
      "<pid>" + AppstoreUtils.getPid(deviceInfo.device_serial) + "</pid>" +
      "<authToken>" + accessToken + "</authToken>" +
      "<authTokenType>AccessToken</authTokenType>" +
      "<softwareVersion>" + AppstoreUtils.OS_VERSION + "</softwareVersion>" +
      "</parameters>" +
      "</request>";

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      if (xhr.status !== 200) {
        console.error("Device registration failed:", xhr.responseText);
        onError && onError(xhr.responseText);
      } else {
        var resXml = xhr.responseXML;

        var deviceName = resXml.querySelector("user_device_name").textContent;
        var adpToken = resXml.querySelector("adp_token").textContent;
        var devicePrivateKey = resXml.querySelector("device_private_key").textContent;

        console.log("Device registered successfully:", {
          device_name: deviceName,
          adp_token: adpToken,
          device_private_key: devicePrivateKey,
        });

        callback && callback({
          device_name: deviceName,
          adp_token: adpToken,
          device_private_key: devicePrivateKey,
        });
      }
    };

    xhr.open("POST", AppstoreAPI.API_REGISTER_DEVICE, true);
    xhr.setRequestHeader("Content-Type", "text/xml");
    xhr.send(xml);
  },

  // Handle associated device registration
  registerAssociatedDevice: function (user, callback, onError) {
    if (!user || !user.device || !user.device.main_adp_token || !user.device.main_device_private_key) {
      console.error("Associated device registration requires valid user and device information!");
      onError && onError("Invalid user or device data.");
      return;
    }

    var requestBody = '<?xml version="1.0" encoding="UTF-8"?>' +
      "<request>" +
      "<parameters>" +
      "<deviceType>" + AppstoreUtils.DEVICE_TYPE_ASSOCIATED + "</deviceType>" +
      "<deviceSerialNumber>" + user.device.device_serial + "</deviceSerialNumber>" +
      "<pid>" + AppstoreUtils.getPid(user.device.device_serial) + "</pid>" +
      "<deregisterExisting>true</deregisterExisting>" +
      "<softwareVersion>" + AppstoreUtils.APP_VERSION + "</softwareVersion>" +
      "<softwareComponentId>" + AppstoreUtils.APP_NAME + "</softwareComponentId>" +
      "</parameters>" +
      "</request>";

    var ws = new AppstoreWebService();
    ws.withUrl(AppstoreAPI.API_REGISTER_ASSOCIATED_DEVICE)
      .withMethod("POST")
      .withContentType("text/xml")
      .withAdpToken(user.device.main_adp_token)
      .withPrivateKey(user.device.main_device_private_key)
      .withBody(requestBody)
      .useLegacyAuth(false)
      .onSuccess(function (response) {
        var resXml = this.responseXML;

        var adpToken = resXml.querySelector("adp_token").textContent;
        var devicePrivateKey = resXml.querySelector("device_private_key").textContent;

        console.log("Associated device registered successfully:", {
          adp_token: adpToken,
          device_private_key: devicePrivateKey,
        });

        callback && callback(user, {
          adp_token: adpToken,
          device_private_key: devicePrivateKey,
        });
      })
      .onError(function (error) {
        console.error("Associated device registration failed:", error);
        onError && onError(error);
      })
      .call();
  },

  // Download URL Retrieval
  getDownloadUrl: function (requestBody, adpToken, privateKey, callback, onError) {
    var ws = new AppstoreWebService();
    ws.withUrl(AppstoreAPI.API_GET_DOWNLOAD_URL)
      .withMethod("POST")
      .withContentType("text/plain; charset=UTF-8")
      .withAdpToken(adpToken)
      .withPrivateKey(privateKey)
      .withBody(requestBody)
      .useLegacyAuth(true)
      .onSuccess(function (response) {
        var json = JSON.parse(this.responseText);
        console.log("Download URL retrieved successfully:", json);
        callback && callback(json);
      })
      .onError(function (error) {
        console.error("Failed to retrieve download URL:", error);
        onError && onError(error);
      })
      .call();
  },
};
