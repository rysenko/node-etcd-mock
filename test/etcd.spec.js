import assert from 'assert';
import Etcd from '../lib/etcd';

describe('Etcd mock', function() {
  before(function() {
    this.client = new Etcd();
  });
  it('should set', function(done) {
    this.client.set('/root', 'value', done);
  });
  it('should get', function(done) {
    this.client.get('/root', (err, result) => {
      assert.ifError(err);
      assert.equal(result.node.value, 'value');
      done();
    });
  });
});