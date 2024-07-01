import storage from '../storage.mjs';
import config from '../config.mjs';
import dbConnections from "./dbConnections.mjs";
import localConnections from "./localConnections.mjs";

const connections =  config.isLambda ? dbConnections : localConnections;

async function connect({storage, connectionId, socket, event}) {
  return await connections.add({storage, connectionId, socket, event});
}

async function disconnect({storage, connectionId}) {
  return await connections.remove({storage, connectionId});
}

function ErrorUnsupportedHandler(eventType) {
  throw new Error(`Unsupported handler ${eventType}`)
}

export async function dispatch({eventType, connectionId, socket, event}) {
  const func = eventType == 'CONNECT' ? connect :
    eventType == 'DISCONNECT' ? disconnect :
    ErrorUnsupportedHandler(eventType);
  return await func({storage, connectionId, socket, event});
}

export default {
  dispatch,
  ...connections
}