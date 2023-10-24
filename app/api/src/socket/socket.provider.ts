import { createServer} from 'http';
import { Server as SocketIOServer } from 'socket.io';

let ioInstance: SocketIOServer;

export const getSocketIOInstance = (): SocketIOServer => {
  if (!ioInstance) {
    const httpServer = createServer();
    ioInstance = new SocketIOServer(httpServer);
  }
  return ioInstance;
};