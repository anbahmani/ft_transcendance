import { Provider } from '@nestjs/common';
import { Server } from 'socket.io';
import { createServer } from 'http';

export const socketIoProvider: Provider = {
  provide: 'SOCKET_IO',
  useFactory: () => {
    const httpServer = createServer();
    return new Server(httpServer);
  },
};
