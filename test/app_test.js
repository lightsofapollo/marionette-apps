
var Apps = require(__dirname + '/../index');


suite('App', function() {
  var apps, b2g, client, subject;

  setup(function(done) {
    Helper.spawn(function(marionetteClient, childProcess) {
      client = marionetteClient;
      b2g = childProcess;

      Apps.setup(client, function(err, result) {
        if (err) {
          throw err;
        }

        apps = result;
        done();
      });
    });
  });

  teardown(function(done) {
    client.deleteSession(function() {
      b2g.kill();
      done();
    });
  });

  suite('#launch', function() {
    setup(function(done) {
      apps.mgmt.getAll().onsuccess = function(evt) {
        subject = evt.target.result[0];
        subject.launch();
        done();
      };
    });

    test('should launch the appropriate app', function(done) {
      // TODO(gareth): Check that the app is launched and that we've
      // switched context appropriately.
      done();
    });
  });

  suite('#checkForUpdate', function() {
    setup(function(done) {
      apps.mgmt.getAll().onsuccess = function(evt) {
        subject = evt.target.result[0];
        var req = subject.checkForUpdate();
        req.onsuccess = function(evt) {
          done();
        };
      };
    });

    test.skip('should set downloadavailable if update', function() {
      // TODO(gareth)
    });

    test.skip('should not set downloadavailable if not update', function() {
      // TODO(gareth)
    });
  });
});
