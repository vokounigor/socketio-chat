import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const DB_NAME = 'chat.db';

export class ChatDB {
  /** @type {import('sqlite3').Database} */ #db;

  constructor() {
    if (!this.#db) {
      open({
        filename: DB_NAME,
        driver: sqlite3.Database,
      })
        .then((chat) => {
          chat.exec(this.#initializeDb());
          this.#db = chat;
        })
        .catch((err) => {
          console.error('Error trying to open a DB connection\n', err);
        });
    }
  }

  #initializeDb() {
    return `
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_offset TEXT UNIQUE,
      content TEXT
    );
    `;
  }

  /**
   * @throws {Error}
   * @param {string} message
   * @param {string} clientOffset
   * @returns {number}
   */
  insertMessage(message, clientOffset) {
    const result = this.#db.run(
      'INSERT INTO messages (content, client_offset) VALUES (?, ?)',
      message,
      clientOffset
    );

    return result.lastID;
  }

  /**
   * @throws {Error}
   * @param {number} offset
   * @param {(err: any, row: { content: string, id: string }) => void} callback
   */
  forEachWithOffset(offset, callback) {
    this.#db.each(
      'SELECT id, content FROM messages WHERE id > ?',
      [offset],
      callback
    );
  }
}
