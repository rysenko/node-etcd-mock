import Etcd from 'node-etcd';
import Client from './client';

class EtcdMock extends Etcd {
  constructor(host, port, sslopts) {
    super(host, port, sslopts, new Client());
  }
}

export default EtcdMock;
