class Client {
  constructor() {
    this.index = 1;
    this.storage = {key: '', dir: true, nodes: []};
  }
  _findNode(node, keyParts, value) {
    if (keyParts.length === 0) {
      return node;
    }
    const keyPart = keyParts[0];
    const isLastKey = keyParts.length === 1;
    const childNode = node.nodes.find(node => node.key.endsWith('/' + keyPart));
    if (childNode && !childNode.dir && !isLastKey) {
      return {errorCode: 104, message: 'Not a directory', cause: childNode.key, index: childNode.modifiedIndex};
    }
    if (isLastKey && typeof value !== 'undefined') { // setting the value
      if (childNode && childNode.dir) {
        return {errorCode: 102, message: 'Not a file', cause: childNode.key, index: childNode.modifiedIndex};
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
      return {errorCode: 100, message: 'Key not found', cause: node.key};
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
}

export default Client;