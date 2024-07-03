import { handler as connectionHandler } from '../lambdas/connectionManager/handler.mjs';
import { handler as intentionHandler } from "../lambdas/intentionHandler/handler.mjs"; 
import { handler as intentionObserver } from "../lambdas/intentionObserver/handler.mjs"; 

async function dispatchMessage(type, data, connectionId) {
  if (type == 'message')
    return await handleMessage(data, connectionId);
  throw new Error('Invalid handler');
}


async function dispatch({type, data, connectionId, socket}) {
  try {
    if (type == 'connect' || type == 'disconnect')
      return await handleConnection(type, connectionId, socket);
    return await dispatchMessage(type, data, connectionId);
  } catch (e) {
    console.error(e);
  }  
}

async function handleMessage(data, connection) {  
  return await intentionHandler({
    requestContext: {
      connectionId: connection,      
    },
    body: data
  });
}

async function handleConnection(type, connectionId, socket) {
  return await connectionHandler({
    requestContext: {
      eventType: type.toUpperCase(),
      connectionId,
      socket
    }
  });
}

async function observe() {
  await intentionObserver({});
}

export default {
  dispatch,
  observe
}