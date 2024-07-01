import dbConnections from "./dbConnections.mjs";

const gClients = new Map();

export async function add({ storage, connectionId, socket, event }) {
  if (socket == null) throw new Error('socket is not set');
  gClients.set(connectionId, socket);
  await dbConnections.add({ storage, connectionId, event })
}

export async function remove({storage, connectionId}) {
  try {
    if (!gClients.has(connectionId)) throw new Error(`DISCONNECT: No socket with connectionId ${connectionId}`);
    gClients.delete(connectionId);    
  } finally {
    await dbConnections.remove({ storage, connectionId });
  }  
}

export function get(storage, connectionId) {
 try {
  return getConnection(connectionId);
 } catch (e) {
  dbConnections.remove({ storage, connectionId });
  throw e;
 }   
}

export function getConnection(connectionId) {  
   const client = gClients.get(connectionId);
   if (client == null)
    throw new Error(`GET: No socket with connectionId ${connectionId}`);
   return client;
 }


export default {
  get,
  remove,
  add,
  getConnection
}