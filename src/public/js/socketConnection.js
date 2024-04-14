'use strict';

let counter = 0;

// This will come from socket.io itself which is loaded prior to this script
// eslint-disable-next-line no-undef
/** @type {import('socket.io').Socket} */ const socket = io({
  auth: {
    serverOffset: 0,
    username: '',
  },
  retries: 3,
  ackTimeout: 10000,
});

/** @type {HTMLFormElement} */
const form = document.getElementById('form');
/** @type {HTMLInputElement} */
const input = document.getElementById('input');
/** @type {HTMLUListElement} */
const messages = document.getElementById('messages');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (input.value) {
    const clientOffset = `${socket.id}-${counter++}`;
    socket.emit('chat message', input.value, clientOffset);
    input.value = '';
  }
});

socket.on(
  'chat message',
  (/** @type {string} */ message, /** @type {number} */ serverOffset) => {
    appendMessage(message);
    socket.auth.serverOffset = serverOffset;
  }
);

socket.on('user connected', (/** @type {string} */ message) => {
  appendMessage(`***${message}***`);
});

socket.on('user disconnected', (/** @type {string} */ message) => {
  appendMessage(`***${message}***`);
});

socket.on('assign-username', (/** @type {string} */ username) => {
  console.log('received username', username);
  socket.auth.username = username;
});

/**
 * @param {string} message
 */
function appendMessage(message) {
  const item = document.createElement('li');
  item.textContent = message;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
}
