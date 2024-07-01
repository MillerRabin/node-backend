import { messages, channel, connections } from "./main.mjs";

export async function handler(event) {
  try {        
    const eventType = event.requestContext.eventType;
    const connectionId = event.requestContext.connectionId; 
    const socket = event.requestContext.socket
    await connections.dispatch({eventType, connectionId, socket, event });    
    return channel.responseToIntegration({ data: { body: { message: 'connection status updated' }}});
  } catch (e) {
    console.error(e);
    const response = messages.createError(e);
    return channel.responseToIntegration(response);
  }  
}
  