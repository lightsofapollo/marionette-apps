
(function() {
  var ObjectCache = window.wrappedJSObject.ObjectCache,
      Utils = window.wrappedJSObject.Utils;

  var req = navigator.mozApps.mgmt.getAll();
  req.onsuccess = function(evt) {
    var result = evt.target.result;
    var apps = evt.target.result.map(function(app) {
      var id = ObjectCache._inst.set(app);
      var obj = Utils.serialize(app);
      obj._id = id;
      return obj;
    });

    marionetteScriptFinished(JSON.stringify({
      callbackType: 'onsuccess',
      data: apps
    }));
  };
  req.onerror = function(evt) {
    marionetteScriptFinished(JSON.stringify({
      callbackType: 'onerror'
    }));
  };
})();
