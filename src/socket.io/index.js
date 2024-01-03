import { Server } from 'socket.io';

class SocketIoManager {
  constructor() {
    if (SocketIoManager.instance) return SocketIoManager.instance;

    SocketIoManager.instance = this;

    this.io = null;
  }

  init(server) {
    if (this.io) return this.io;

    this.io = new Server(server, { cors: { origin: '*' } });

    this.io.on('connection', (socket) => {
      console.log('A user connected');

      socket.on('chat message', (msg) => {
        console.log(`Received message: ${msg}`);
        this.emit('chat message', '服务端返回的客户端消息：' + msg);
      });

      socket.on('disconnect', () => {
        console.log('A user disconnected');
      });
    });
  }

  emit(event, data) {
    this.io?.emit(event, data);
  }
}

export default new SocketIoManager();
