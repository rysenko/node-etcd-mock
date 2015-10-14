class Client {
  constructor() {
    this.storage = {};
  }
  _getNode(keyParts) {
    return keyParts.reduce((storageNode, keyPart) => {
      if (!storageNode[keyPart]) {
        storageNode[keyPart] = {};
      }
      return storageNode[keyPart];
    }, this.storage);
  }
  get(options, callback) {
    const keyParts = options.path.split('/').filter(key => key);
    const lastPart = keyParts.splice(keyParts.length - 1, 1)[0];
    const targetNode = this._getNode(keyParts);
    const result = {action: 'get', node: {key: options.path, value: targetNode[lastPart]}};
    setImmediate(() => callback(null, result));
  }
  put(options, callback) {
    const keyParts = options.path.split('/').filter(key => key);
    const lastPart = keyParts.splice(keyParts.length - 1, 1)[0];
    const targetNode = this._getNode(keyParts);
    targetNode[lastPart] = String(options.form.value);
    setImmediate(() => callback(null));
  }
}

export default Client;