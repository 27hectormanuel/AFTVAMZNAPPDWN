'use strict';

(function() {
  var location = window.location;

  // Ensure we are on the correct Amazon authentication page
  if (location.pathname !== '/gp/yourstore/home' || location.search === '') {
    return;
  }

  var query = window.location.search.substring(1);

  // Check for OAuth2 access token and FireTV-specific login state
  if (query.indexOf('openid.oa2.access_token=') > -1) {
    console.log("[OAuth] Access token detected, sending authentication callback.");

    BrowserMessage.sendMessage({
      cmd: 'oauth2Callback',
      data: {
        query: query,
        deviceType: 'AFTMM',  // FireTV device ID for authentication
        osVersion: 'Fire OS 7.0.3'
      }
    });
  } else {
    console.log("[OAuth] No access token found. Ensure user is logged in.");
  }
})();