
(function() {
  if (window.wrappedJSObject.Utils !== undefined) {
    // Don't redefine it!
    return;
  }

  var Utils = {
    /**
     * Take an app from a DOMRequest and serialize it to send back
     * to the client.
     * @return {Object} App representation.
     */
    serialize: function(app) {
      return {
        installOrigin: app.installOrigin,
        installTime: app.installTime,
        // TODO(gareth): This breaks things, probably too much data...
        // manifest: app.manifest,
        manifestURL: app.manifestURL,
        origin: app.origin,
        receipts: app.receipts
      };
    }
  };
  window.wrappedJSObject.Utils = Utils;
})();
