import { WebSocketServer } from "ws";
import { port } from './config.mjs';
import { v4 as get_uuid } from 'uuid';
import dispatcher from './dispatcher.mjs';

const wss = new WebSocketServer({ port });
console.log(`Websocket was created at port ${port}`)

wss.on('connection', (ws, req) => {
  const key = get_uuid();
  console.log('connected ', key);
  ws.connectionId = key;
  dispatcher.dispatch({
    type: 'connect',
    data: JSON.stringify({
      ip: req.socket.remoteAddress
    }),
    connectionId: key,
    socket: ws
  });
  ws.on('error', (data) => {
    console.error(data);
  });
  ws.on('message', (data) => {
    dispatcher.dispatch({
      type: 'message',
      data,
      connectionId: ws.connectionId
    });
  });
  ws.on('close', (code, reason) => {
    console.log('closed ', ws.connectionId);
    dispatcher.dispatch({
      type: 'disconnect',
      data: JSON.stringify({ code, reason: reason.toString() }),
      connectionId: ws.connectionId
    });
  });
});

dispatcher.observe();
setInterval(() => {
  dispatcher.observe();
}, 20000)
