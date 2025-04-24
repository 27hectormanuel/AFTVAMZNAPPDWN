'use strict';

(function() {
  /**
   * Check if the current page belongs to FireTV apps instead of mobile apps.
   * Some FireTV apps have different purchase mechanisms, so adjust logic accordingly.
   */
  var isValidAppPage = function() {
    var isFireTVApp = document.querySelector('[data-category="fire-tv-apps"]');
    var hasBuyForm = document.getElementById('handleBuy');
    var priceValue = document.querySelector('#handleBuy input[name=priceValue]');

    // FireTV apps may lack traditional "Buy" buttons but still be free
    if (isFireTVApp || (hasBuyForm && priceValue && parseFloat(priceValue.value) === 0)) {
      return true;
    }

    return false;
  };

  /**
   * Retrieve the ASIN (Amazon Standard Identification Number) of the app.
   * FireTV apps use the same ASIN system as mobile apps.
   */
  var getASIN = function() {
    var ASIN = document.querySelector('#handleBuy input[name=ASIN]');
    return ASIN && ASIN.value ? ASIN.value : '';
  };

  /**
   * Retrieve the app version number from the page.
   */
  var getAppVersion = function() {
    var versionElement = document.querySelector('#app-version'); // Replace with actual selector
    return versionElement ? versionElement.textContent.trim() : '';
  };

  /**
   * Main logic for interacting with the FireTV app page.
   */
  var execute = function() {
    try {
      if (!isValidAppPage()) {
        console.error('Not a valid FireTV app page.');
        return;
      }

      var asin = getASIN();
      if (!asin) {
        console.error('ASIN not found.');
        return;
      }

      var version = getAppVersion();
      console.log('App Details:', { ASIN: asin, Version: version });

      // Additional logic can be added here based on app details
    } catch (error) {
      console.error('An error occurred while executing the script:', error);
    }
  };

  // Execute the script when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', execute);
})();
