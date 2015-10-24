'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Client = (function () {
  function Client() {
    _classCallCheck(this, Client);

    this.storage = {};
  }

  _createClass(Client, [{
    key: '_traverseNode',
    value: function _traverseNode(keyParts) {
      return keyParts.reduce(function (storageNode, keyPart) {
        if (!storageNode[keyPart]) {
          storageNode[keyPart] = {};
        }
        return storageNode[keyPart];
      }, this.storage);
    }
  }, {
    key: '_transformNode',
    value: function _transformNode(path, node) {
      var levels = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

      if (typeof node === 'string') {
        return { key: path, value: node };
      }
      var result = { key: path, dir: true };
      if (levels > 0) {
        result.nodes = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = Object.keys(node)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var key = _step.value;

            result.nodes.push(this._transformNode(path + '/' + key, node[key], levels - 1));
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator['return']) {
              _iterator['return']();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
      return result;
    }
  }, {
    key: 'get',
    value: function get(options, callback) {
      var keyParts = options.path.split('/').filter(function (key) {
        return key;
      }).splice(2);
      var keyPath = '/' + keyParts.join('/');
      var lastPart = keyParts.splice(keyParts.length - 1, 1)[0];
      var targetNode = this._traverseNode(keyParts);
      var resultNode = this._transformNode(keyPath, targetNode[lastPart], options.qs.recursive ? Number.MAX_VALUE : 1);
      setImmediate(function () {
        return callback(null, { actions: 'get', node: resultNode });
      });
    }
  }, {
    key: 'put',
    value: function put(options, callback) {
      var keyParts = options.path.split('/').filter(function (key) {
        return key;
      }).splice(2);
      var lastPart = keyParts.splice(keyParts.length - 1, 1)[0];
      var targetNode = this._traverseNode(keyParts);
      targetNode[lastPart] = String(options.form.value);
      setImmediate(function () {
        return callback(null);
      });
    }
  }]);

  return Client;
})();

exports['default'] = Client;
module.exports = exports['default'];