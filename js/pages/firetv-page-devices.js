'use strict';

(function() {
  var frmDevices = document.getElementById('frm-devices'),
    txtName = document.getElementById('txt-name'),
    txtSpecs = document.getElementById('txt-specs');

  var isValidSpecs = function(specs) {
    try {
      var o = JSON.parse(specs);
      if (typeof o === 'object') {
        return true;
      }
    } catch (e) {
    }
    return false;
  };

  var isValidName = function(name) {
    return true;
  };

  frmDevices.addEventListener('submit', function(e) {
    e.preventDefault();

    var name = txtName.value.trim();
    var specs = txtSpecs.value.trim();
    if (!isValidName(name)) {
      alert('Invalid device name.');
      return;
    }

    if (!isValidSpecs(specs)) {
      alert('Invalid device specs. (must be JSON format)');
      return;
    }

    Devices.add({
      name: name,
      specs: specs
    }, function() {
      alert('Added');
      window.location.reload();
    });
  });
})();