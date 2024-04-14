import { ChatDB } from '../repositories/chat.js';
import { generateRandomUsername } from '../utils/username.js';

export class SocketListener {
  /** @type {ChatDB} */ #chatDb;
  /** @type {import('socket.io').Server} */ #io;

  /**
   * @param {import('socket.io').Server} io
   */
  constructor(io) {
    this.#chatDb = new ChatDB();
    this.#io = io;
  }

  listen() {
    this.#io.on('connection', (socket) => {
      const username = generateRandomUsername('-');
      socket.emit('assign-username', username);
      socket.broadcast.emit('user connected', `${username} connected!`);

      // Remember to bind methods to 'this' instance, not the socket's instance
      socket.on('chat message', this.#onChatMessage.bind(this));

      if (!socket.recovered) {
        this.#recoverState(socket);
      }

      socket.on('disconnect', () => {
        this.#io.emit(
          'user disconnected',
          `${socket.handshake.auth.username} disconnected!`
        );
      });
    });
  }

  /**
   * @param {string} message
   * @param {string} clientOffset
   * @param {() => void} callback
   */
  #onChatMessage(message, clientOffset, callback) {
    /** @type {number | undefined} */
    let insertId;
    try {
      insertId = this.#chatDb.insertMessage(message, clientOffset);
    } catch (e) {
      // SQLITE_CONSTRAINT
      if (e.errno === 19) {
        // The message was already inserted, so we notify the client
        callback();
      } else {
        // nothing, let the client retry
      }
      console.error(e);
      return;
    }

    this.#io.emit('chat message', message, insertId);
    // Acknowledge the event
    callback();
  }

  /**
   * @param {import('socket.io').Socket} socket
   */
  #recoverState(socket) {
    try {
      this.#chatDb.forEachWithOffset(
        socket.handshake.auth.serverOffset || 0,
        (_, row) => {
          socket.emit('chat message', row.content, row.id);
        }
      );
    } catch (e) {
      console.error(e);
    }
  }
}
