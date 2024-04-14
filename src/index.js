import { Server } from 'socket.io';
import { SocketListener } from './listeners/socketListener.js';
import { server } from './server.js';

const PORT = 8000;

const io = new Server(server, {
  connectionStateRecovery: {},
});
const socketListener = new SocketListener(io);

socketListener.listen();

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

process.on('uncaughtException', (err) => {
  console.error(err);
  process.exit(1);
});
