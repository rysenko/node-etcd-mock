import assert from 'assert';
import Etcd from '../src/etcd';

describe('Etcd mock', function() {
  before(function() {
    this.client = new Etcd();
  });
  it('should set sub', function(done) {
    this.client.set('/root/child/sub', 'value', done);
  });
  it('should get child', function(done) {
    this.client.get('/root/child/sub', (err, result) => {
      assert.ifError(err);
      assert.equal(result.node.value, 'value');
      done();
    });
  });
  it('should get root', function(done) {
    this.client.get('/root', (err, result) => {
      assert.ifError(err);
      assert.equal(result.node.nodes.length, 1);
      assert.equal(result.node.nodes[0].key, '/root/child');
      assert(!result.node.nodes[0].nodes);
      done();
    });
  });
  it('should get root recursive', function(done) {
    this.client.get('/root', {recursive: true}, (err, result) => {
      assert.ifError(err);
      assert.equal(result.node.nodes.length, 1);
      assert.equal(result.node.nodes[0].key, '/root/child');
      assert.equal(result.node.nodes[0].nodes[0].key, '/root/child/sub');
      done();
    });
  });
  it('should not get non-existing', function(done) {
    this.client.get('/root/some', (err) => {
      assert(err);
      assert.equal(err.errorCode, 100);
      done();
    });
  });
});