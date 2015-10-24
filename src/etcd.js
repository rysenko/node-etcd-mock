import Etcd from 'node-etcd/lib';
import Client from './client';

const substituteClient = new Client();

class EtcdMock extends Etcd {
  constructor(host, port, sslopts) {
    super(host, port, sslopts, substituteClient);
  }
}

export default EtcdMock;
