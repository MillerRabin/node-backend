import { getSourceIp, getEndpoint } from "../event.mjs";
import dbStorage from "../dbInterface/main.mjs";

export async function add({storage, connectionId, event}) {  
  const sourceIp = getSourceIp(event);    
  await storage.addStorage({ 
    id: connectionId, 
    sourceIp,
    handling: 'auto',
    endpoint: getEndpoint(event)
  });
}

export async function remove({storage, connectionId}) {  
  return await storage.deleteStorage(connectionId);
}

export async function get(connectionId) {
  const res = await dbStorage.getStorageLinks({ connectionId });
  if (res == 0) throw new Error(`There are no connection with id ${connectionId}`);
  return res.rows[0];
}

export default {
  add,
  get,
  remove
}
