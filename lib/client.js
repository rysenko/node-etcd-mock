class Client {
  constructor() {
    this.storage = {};
  }
  _traverseNode(keyParts) {
    return keyParts.reduce((storageNode, keyPart) => {
      if (!storageNode[keyPart]) {
        storageNode[keyPart] = {};
      }
      return storageNode[keyPart];
    }, this.storage);
  }
  _transformNode(path, node, levels = 1) {
    if (typeof node === 'string') {
      return {key: path, value: node};
    }
    const result = {key: path, dir: true};
    if (levels > 0) {
      result.nodes = [];
      for (let key of Object.keys(node)) {
        result.nodes.push(this._transformNode(path + '/' + key, node[key], levels - 1));
      }
    }
    return result;
  }
  get(options, callback) {
    const keyParts = options.path.split('/').filter(key => key).splice(2);
    const keyPath = '/' + keyParts.join('/');
    const lastPart = keyParts.splice(keyParts.length - 1, 1)[0];
    const targetNode = this._traverseNode(keyParts);
    const resultNode = this._transformNode(keyPath, targetNode[lastPart], options.qs.recursive ? Number.MAX_VALUE : 1);
    setImmediate(() => callback(null, {actions: 'get', node: resultNode}));
  }
  put(options, callback) {
    const keyParts = options.path.split('/').filter(key => key).splice(2);
    const lastPart = keyParts.splice(keyParts.length - 1, 1)[0];
    const targetNode = this._traverseNode(keyParts);
    targetNode[lastPart] = String(options.form.value);
    setImmediate(() => callback(null));
  }
}

export default Client;