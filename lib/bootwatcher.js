
/**
 * @fileoverview Simple tool to notify listeners when a Firefox OS instance
 *     finishes booting.
 */


var ContextManager = require(__dirname + '/contextmanager'),
    EventEmitter = require('events').EventEmitter;


/**
 * @constructor
 * @param {Marionette.Client} client Marionette client to use.
 */
function BootWatcher(client) {
  EventEmitter.call(this, arguments);
  this._client = client;
  this._contextManager = new ContextManager(client);
}
module.exports = BootWatcher;


/**
 * Initialize the BootWatcher plugin!
 * @param {Marionette.Client} client Marionette client to use.
 * @param {Object} options Optional map of attributes for MarionetteApps.
 * @param {Function} cb Optional callback function to call after setup.
 */
BootWatcher.setup = function(client, options, cb) {
  var bootwatcher = new BootWatcher(client);
  if (arguments.length === 2 && typeof(options) === 'function') {
    cb = options;
    options = undefined;
  }

  cb && cb(null, bootwatcher);
};


/**
 * Maximum number of times we'll try to wait for boot.
 * @const {number}
 */
BootWatcher.RETRIES = 5;


/**
 * The maximum amount of time we'll wait for startup.
 * @const {number}
 */
BootWatcher.WAIT_TIME = 50000;


BootWatcher.prototype = {
  __proto__: EventEmitter.prototype,


  /**
   * @type {Marionette.Client}
   * @private
   */
  _client: undefined,


  /**
   * Start watching for when we're booted.
   */
  start: function() {
    this._contextManager.saveContext();
    this._contextManager.setContext('content');
    this._client.setScriptTimeout(BootWatcher.WAIT_TIME);
    this._tryToWaitForBoot(BootWatcher.RETRIES);
  },


  /**
   * Initially we were watching the window for the 'applicationready'
   * event. However, some javascript exceptions in the system app may
   * keep 'applicationready' from being fired, so poll instead. Also,
   * an error may be thrown while we're executing. In that case, retry.
   * @param {number} retries Maximum number of times we'll try to wait.
   * @private
   */
  _tryToWaitForBoot: function(retries) {
    this._client.executeAsyncScript(function waitForBoot(timeout) {
      function callback() {
        marionetteScriptFinished();
      }

      function isBooted() {
        var sessionStorage = window.wrappedJSObject.sessionStorage;
        var item = sessionStorage.getItem('webapps-registry-ready');
        return item === 'yes';
      }

      waitFor(callback, isBooted, timeout);
    }, [BootWatcher.WAIT_TIME], (function(err) {
      if (err) {
        if (retries === 0) {
          throw err;
        }

        return this._tryToWaitForBoot(retries - 1);
      }

      this._contextManager.restoreContext();
      this.emit(BootWatcher.EventType.BOOT);
    }).bind(this));
  }
};


/**
 * @enum {string}
 */
BootWatcher.EventType = {
  BOOT: 'boot'
};
