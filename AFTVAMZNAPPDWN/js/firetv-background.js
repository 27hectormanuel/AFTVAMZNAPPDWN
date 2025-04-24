'use strict';

// Chrome Runtime Message Listener
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    const cmd = request.cmd;
    const messageData = request.data;

    switch (cmd) {
        case 'download':
            handleDownloadRequest(messageData, sendResponse);
            return true;

        case 'signRequest':
            handleSignRequest(messageData, sendResponse);
            break;

        case 'oauth2Callback':
            handleOAuthCallback(sender, messageData);
            break;

        case 'openPage':
            openPage(request.page);
            break;

        case 'trackEvent':
            ZAnalytics.trackEvent(messageData);
            break;

        default:
            console.error(`Unknown command: ${cmd}`);
    }
});

// Handle "download" request
function handleDownloadRequest(messageData, sendResponse) {
    BrowserStorage.get('user', function(data) {
        const user = (!data || !data.user) ? {} : data.user;

        if (!AppstoreUtils.isValidUser(user)) {
            sendResponse({
                error: { type: 'NotLoggedIn', message: '' }
            });
            return;
        }

        const device = user.device;
        const privateKey = device.associated_device_private_key;
        const adpToken = device.associated_adp_token;

        const appVersion = messageData.appVersion || 1;
        const requestData = {
            asin: messageData.asin,
            hasExpiry: true,
            version: `${appVersion}`,
            deviceType: 'AFTMM' // Fire TV compatibility
        };

        const requestBody = JSON.stringify(requestData);

        AppstoreAPI.getDownloadUrl(requestBody, adpToken, privateKey, function(data) {
            // Primary APK Download
            const apkName = `appstore-apk-downloader/${data.packageName}-${appVersion}.apk`;
            BrowserDownloads.download(data.downloadUrl, apkName);

            // Handle Additional Files
            if (data.additionalFiles) {
                data.additionalFiles.forEach(file => {
                    BrowserDownloads.download(file.url, file.name);
                });
            }

            sendResponse({ success: true });

            ZAnalytics.trackEvent(['download', 'app', `${data.packageName}|${messageData.asin}`]);
        }, function(errorType, errorMessage) {
            sendResponse({
                error: { type: errorType, message: errorMessage }
            });
        });
    });
}

// Handle "signRequest" command
function handleSignRequest(messageData, sendResponse) {
    const requestDigest = AppstoreUtils.signRequest(messageData, messageData.useLegacyAuth);
    sendResponse(requestDigest);
}

// Handle OAuth2 Callback
function handleOAuthCallback(sender, messageData) {
    chrome.tabs.remove(sender.tab.id, function() {
        chrome.tabs.create({
            url: `${chrome.runtime.getURL('oauth2-callback.html')}#${messageData.query}`
        });
    });
}

// Open Page in Browser
function openPage(page) {
    chrome.tabs.create({
        url: `${chrome.runtime.getURL(`${page}.html`)}`
    });
}

// On Extension Installation
chrome.runtime.onInstalled.addListener(function(details) {
    ZAnalytics.trackEvent(['install', details.reason, chrome.app.getDetails().version]);
});

// Check for Updates
function checkForUpdate() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://appstore-apk-downloader.com/version.json', true);
    xhr.responseType = 'json';

    xhr.onload = function() {
        if (xhr.status === 200) {
            const data = xhr.response;
            if (data.version !== chrome.app.getDetails().version) {
                chrome.tabs.create({
                    url: 'http://appstore-apk-downloader.com/new-version.html',
                    active: false
                });
            }
        }
    };

    xhr.send();
}

checkForUpdate();