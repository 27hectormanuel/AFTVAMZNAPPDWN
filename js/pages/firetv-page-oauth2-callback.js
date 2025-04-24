'use strict';

(function() {
    // Highlight the current registration step
    var setCurrentStep = function(step) {
        document.querySelector('.steps li:nth-child(' + step + ')').classList.add('color');
    };

    // Persistent error display
    var displayError = function(message) {
        document.querySelector('.invalid').style.display = 'block';
        document.querySelector('.invalid').textContent = message;
        console.error(message);
    };

    // Retry logic for login
    var retryLogin = function(message) {
        displayError(message + " Retrying login in 5 seconds...");
        setTimeout(function() {
            window.location.href = AppstoreAPI.API_OAUTH2_SIGNIN;
        }, 5000); // Retry after 5 seconds
    };

    // Device registration logic
    var registerDevice = function(accessToken, deviceInfo) {
        setCurrentStep(1);

        var user = {
            access_token: accessToken,
            device: {
                device_serial: deviceInfo.device_serial,
                device_model: deviceInfo.device_model,
                os_version: deviceInfo.os_version,
            },
        };

        // Start the registration process
        AppstoreAPI.register(user, function(response) {
            registerCallback(user, response);
        }, function() {
            retryLogin("Access token timeout. Please try logging in again.");
        });
    };

    // Handle registration callback for main device
    var registerCallback = function(user, response) {
        setCurrentStep(2);

        if (!response || response.error) {
            displayError("Device registration failed. Please try again.");
            return;
        }

        var successData = response.success;
        var tokens = successData.tokens;
        var extensions = successData.extensions;

        user.name = extensions.customer_info.name;
        user.device.main_device_private_key = tokens.mac_dms.device_private_key;
        user.device.main_adp_token = tokens.mac_dms.adp_token;
        user.device.device_name = extensions.device_info.device_name;

        AppstoreAPI.registerAssociatedDevice(user, registerAssociatedDeviceCallback, function() {
            retryLogin("Failed to register associated device. Retrying...");
        });
    };

    // Handle associated device registration callback
    var registerAssociatedDeviceCallback = function(user, data) {
        setCurrentStep(3);

        user.device.associated_device_private_key = data.device_private_key;
        user.device.associated_adp_token = data.adp_token;

        BrowserStorage.set({ user: user }, function() {
            var device = user.device;

            // Register appstore-only device
            Devices.get(0, function(deviceSpecs) {
                if (deviceSpecs) {
                    AppstoreAPI.appstoreOnlyRegisterDevice(
                        deviceSpecs.specs,
                        device.associated_adp_token,
                        device.associated_device_private_key,
                        appstoreOnlyRegisterDeviceCallback
                    );
                }
            });
        });
    };

    // Handle final callback for Appstore-only registration
    var appstoreOnlyRegisterDeviceCallback = function() {
        setCurrentStep(4);

        // Stay on the page but clear the URL hash
        window.location.hash = '';
        displayError("Registration completed! You can now close this page.");
    };

    // Extract parameters from query string
    var getParamsFromQuery = function(query) {
        var match,
            pl = /\+/g, // Replace '+' with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function(s) { return decodeURIComponent(s.replace(pl, ' ')); };

        var urlParams = {};
        while ((match = search.exec(query)) !== null) {
            urlParams[decode(match[1])] = decode(match[2]);
        }

        return urlParams;
    };

    // Process the OAuth2 callback URL
    var hash = window.location.hash;
    if (!hash) {
        displayError("Invalid callback: Missing hash parameters.");
        return;
    }

    var params = getParamsFromQuery(hash.substring(1));
    if (params['openid.oa2.access_token'] &&
        params['openid.oa2.scope'] === 'device_auth_access' &&
        params['openid.oa2.token_type'] === 'bearer') {
        document.querySelector('.valid').style.display = 'block';

        var accessToken = params['openid.oa2.access_token'];
        AppstoreUtils.getDeviceSerial(function(deviceSerial) {
            var deviceInfo = {
                device_serial: deviceSerial,
                device_model: AppstoreUtils.DEVICE_MODEL,
                os_version: AppstoreUtils.OS_VERSION,
            };

            registerDevice(accessToken, deviceInfo);
        });
    } else {
        displayError("Invalid or expired access token. Please try logging in again.");
        retryLogin("Invalid or expired access token detected.");
    }
})();
