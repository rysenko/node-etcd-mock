const Errors = {
  KEY_NOT_FOUND: {errorCode: 100, message: 'Key not found'},
  NOT_A_FILE: {errorCode: 102, message: 'Not a file'},
  NOT_A_DIRECTORY: {errorCode: 104, message: 'Not a directory'},
  DIRECTORY_NOT_EMPTY: {errorCode: 108, message: 'Directory not empty'}
};

class Client {
  constructor() {
    this.index = 1;
    this.storage = {key: '', dir: true, nodes: []};
  }
  _error(error, cause, index) {
    const resultingError = JSON.parse(JSON.stringify(error))
    if (cause) {
      resultingError.cause = cause;
    }
    if (index) {
      resultingError.index = index;
    }
    return resultingError;
  }
  _findNode(node, keyParts, value) {
    if (keyParts.length === 0) {
      return node;
    }
    const keyPart = keyParts[0];
    const isLastKey = keyParts.length === 1;
    const childNode = node.nodes.find(node => node.key.endsWith('/' + keyPart));
    if (childNode && !childNode.dir && !isLastKey) {
      return this._error(Errors.NOT_A_DIRECTORY, childNode.key, childNode.modifiedIndex);
    }
    if (isLastKey && typeof value !== 'undefined') { // setting the value
      if (childNode && childNode.dir) {
        return this._error(Errors.NOT_A_FILE, childNode.key, childNode.modifiedIndex);
      } else if (childNode) {
        childNode.value = value;
        childNode.modifiedIndex = this.index;
      } else {
        node.nodes.push({key: node.key + '/' + keyPart, value, createdIndex: this.index, modifiedIndex: this.index});
        return node.nodes[node.nodes.length - 1];
      }
    }
    if (!childNode) {
      if (typeof value !== 'undefined') {
        node.nodes.push({key: node.key + '/' + keyPart, dir: true, nodes: [], createdIndex: this.index, modifiedIndex: this.index});
        return this._findNode(node.nodes[node.nodes.length - 1], keyParts.slice(1), value);
      }
      return this._error(Errors.KEY_NOT_FOUND, node.key);
    }
    return this._findNode(childNode, keyParts.slice(1), value);
  }
  get(options, callback) {
    const keyParts = options.path.split('/').filter(key => key).splice(2);
    let resultNode = this._findNode(this.storage, keyParts);
    if (resultNode.nodes && !options.qs.recursive) {
      resultNode = Object.create(resultNode, {nodes: {value: resultNode.nodes.map(node => {
        return Object.create(node, {nodes: {value: undefined}});
      })}});
    }
    setImmediate(() => callback(resultNode.errorCode && resultNode, !resultNode.errorCode && {action: 'get', node: resultNode}));
  }
  put(options, callback) {
    const keyParts = options.path.split('/').filter(key => key).splice(2);
    const targetNode = this._findNode(this.storage, keyParts, options.form.value + '');
    if (!targetNode.errorCode) {
      this.index++;
    }
    setImmediate(() => callback(targetNode.errorCode && targetNode, !targetNode.errorCode && {action: 'set', node: targetNode}));
  }
  delete(options, callback) {
    const keyParts = options.path.split('/').filter(key => key).splice(2);
    const keyPath = '/' + keyParts.join('/');
    const lastPart = keyParts.splice(-1, 1);
    const targetNode = this._findNode(this.storage, keyParts);
    const nodeToDelete = targetNode && targetNode.nodes && targetNode.nodes.find(node => node.key === keyPath);
    if (!nodeToDelete) {
      return setImmediate(() => callback(this._error(Errors.KEY_NOT_FOUND, keyPath)));
    }
    if (!options.qs.dir && nodeToDelete.dir) {
      return setImmediate(() => callback(this._error(Errors.NOT_A_FILE, keyPath)));
    }
    if (!options.qs.recursive && options.qs.dir && nodeToDelete.nodes && targetNode.nodes.length) {
      return setImmediate(() => callback(this._error(Errors.DIRECTORY_NOT_EMPTY, keyPath)));
    }
    targetNode.nodes = targetNode.nodes.filter(node => node !== nodeToDelete);
    targetNode.modifiedIndex = this.index;
    this.index++;
    setImmediate(() => callback(null, {action: 'delete', node: nodeToDelete}));
  }
}

export default Client;