'use strict';

var _gaq = _gaq || [];
var ZAnalytics = new function() {
  var TRACKING_CODE = 'UA-28996035-19';

  var init = function() {
    _gaq.push(['_setAccount', TRACKING_CODE]);
    _gaq.push(['_trackPageview']);

    (function() {
      var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
      ga.src = 'https://ssl.google-analytics.com/ga.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();
  };

  var trackEvent = function(evt) {
    _gaq.push(['_trackEvent'].concat(evt));
  };
  this.trackEvent = trackEvent;
  this.init = init;
};

ZAnalytics.init();