import Alpine from "alpinejs";
import { io } from 'socket.io-client';


Alpine.store('app', {
  current_page: true,
  user_id: null,
  room: null,
  users: [],
  messages: [],
  is_typing: false,
});
Alpine.start();
const appRef = Alpine.store('app');

const socket = io("http://localhost:3000", {transports: ['websocket', 'polling', 'flashsocket']});

// 
const sendbtn = document.querySelector("#send");
const textbox = document.querySelector("#textbox");

window.addEventListener('focus', _ => {
  textbox.focus();
});

socket.on('user_id', id => appRef.user_id = id);
socket.on('users_list', list => appRef.users = list);
socket.on('room_id', id => {
  appRef.room = id;
  appRef.messages = [];
});

textbox.addEventListener('keydown', Alpine.debounce(e =>  socket.emit('typing_event', {from: appRef.user_id, room: appRef.room, payload: true}), 300));
textbox.addEventListener('keyup', Alpine.debounce(e =>  socket.emit('typing_event', {from: appRef.user_id, room: appRef.room, payload: false}), 1000));

socket.on('typing_update', payload => {
  console.log('payload', payload);
  appRef.is_typing = payload;
});

document.addEventListener('keydown', e => {
  if (e.key == 'Enter')
  {
    let msg = textbox.value.trim();
    if (msg.value != '')
    {
      socket.emit('message_send', {
        from: appRef.user_id,
        room: appRef.room,
        msg: msg
      });
    }
    textbox.value = '';

  }
});

socket.on('message_add', e => {
  appRef.messages.push(e);
});
socket.on('message_notif', _ => {
  document.querySelector('#notif').play();
});