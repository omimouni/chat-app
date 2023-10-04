import { io } from 'socket.io-client';
import Alpine from 'alpinejs';

Alpine.store('app', {
  user_id: null,
  users_list: [],
  room: null,
  unread: false,
  messages: [],
});

Alpine.start();

window.addEventListener('focus', e => {
  appRef.unread = false;
});
const appRef = Alpine.store('app');
const socket = io("https://ff-xxxd.onrender.com/", { transports: ['websocket'] });

socket.on('user_id', id => appRef.user_id = id);
socket.on('users_list', list => appRef.users_list = list);
socket.on('room_id', list => {
  if (list === null)
    appRef.messages = [];
  appRef.room = list;
});

socket.on('add_message', msg => {
  if (!document.hasFocus())
    appRef.unread = true;
  appRef.messages.push(msg);
  document.querySelector('textarea').value = '';
  document.querySelector('textarea').focus();
  setTimeout(() =>
    document.querySelector('.message-box').scrollTop = document.querySelector('.message-box').scrollHeight, 50);
});


document.addEventListener('keydown', e => {
  if (document.querySelector('textarea').value.trim() != '') {
    if (e.key == 'Enter') {
      socket.emit('send_message', {
        message: document.querySelector('textarea').value,
        from: appRef.user_id,
        room: appRef.room
      });
    }
  }
});

document.querySelector('.send').addEventListener('click', _ => {
  if (document.querySelector('textarea').value.trim() != '') {
    socket.emit('send_message', {
      message: document.querySelector('textarea').value,
      from: appRef.user_id,
      room: appRef.room
    });
  }
});