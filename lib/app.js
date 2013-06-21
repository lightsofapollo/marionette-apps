
var DOMRequest = require(__dirname + '/domrequest'),
    GeckoObject = require(__dirname + '/geckoobject');


/**
 * @constructor
 * @param {Apps} apps A reference to the Apps api.
 */
function App(apps) {
  GeckoObject.apply(this, arguments);
  this._apps = apps;
}
module.exports = App;


App.prototype = {
  __proto__: GeckoObject.prototype,


  /**
   * @type {Apps}
   * @private
   */
  _apps: undefined,


  /**
   * The origin of the site that triggered the installation of the app.
   * @type {=string}
   */
  installOrigin: undefined,


  /**
   * The time that the app was installed.
   * This is generated using Date().getTime(),
   * represented as the number of milliseconds
   * since midnight of January 1st, 1970.
   * @type {=number}
   */
  installTime: undefined,


  /**
   * The currently stored instance of the manifest of the app.
   * @type {Object}
   */
  manifest: undefined,


  /**
   * Where the manifest was found.
   * @type {=string}
   */
  manifestURL: undefined,


  /**
   * The origin of the app (protocol, host, and optional port number).
   * For example: http://example.com.
   * @type {=string}
   */
  origin: undefined,


  /**
   * An object containing an array of one or more receipts.
   * Each receipt is a string. If there are no receipts, this is null.
   * @type {Object}
   */
  receipts: undefined,


  /**
   * Check to see if the app has been updated. Returns a DOMRequest object.
   * For packaged apps:
   *     check for updates and mark it as downloadavailable if needed.
   * For hosted apps:
   *     check for updates on app manifest and application cache
   *     and update it if needed.
   * @return {DOMRequest} Request that supports onsuccess, onerror callbacks.
   */
  checkForUpdate: function() {
    var req = new DOMRequest();

    this._apps._client.executeAsyncScript(function(id) {
      var ObjectCache = window.wrappedJSObject.ObjectCache,
          Utils = window.wrappedJSObject.Utils;

      var app = ObjectCache._inst.get(id);
      var req = app.checkForUpdate();
      req.onsuccess = function(evt) {
        marionetteScriptFinished(JSON.stringify({
          callbackType: 'onsuccess',
          data: Utils.serialize(app)
        }));
      };
      req.onerror = function(evt) {
        dump(evt.target.result);
        marionetteScriptFinished(JSON.stringify({
          callbackType: 'onerror'
        }));
      };
    }, [this._id], function(err, result) {
      if (err) {
        throw err;
      }

      result = JSON.parse(result);
      switch (result.callbackType) {
        case DOMRequest.CallbackType.ON_SUCCESS:
          for (var key in result.data) {
            this[key] = data[key];
          }

          req.onsuccess && req.onsuccess({ target: { result: this } });
          break;
        case DOMRequest.CallbackType.ON_ERROR:
          req.onerror && req.onerror();
          break;
      }
    });

    return req;
  },


  /**
   * Launches the application. Does not return any value.
   */
  launch: function() {
    this._apps._client.executeAsyncScript(function(id) {
      var ObjectCache = window.wrappedJSObject.ObjectCache;
      var app = ObjectCache._inst.get(id);
      app.launch();
      marionetteScriptFinished();
    }, [this._id], function(err) {
      if (err) {
        throw err;
      }
    });
  }
};
