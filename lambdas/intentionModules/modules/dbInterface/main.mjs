
import postgres from "./postgres.mjs";
import dynamoDB from "./dynamoDB.mjs";
import intentionDispatcher from "./intentionDispatcher.mjs";


async function getBroadcastReady(modules, storageId) {
  const res = await hasActiveConnections(modules, storageId);
  if (!res) return [];
  return await postgres.getBroadcastReady(storageId);
}

async function addLinkedStorage(linkedStorage) {
  await dynamoDB.addConnection(linkedStorage.storage.id, linkedStorage.id, linkedStorage.endpoint);
  return await postgres.addLinkedStorage(linkedStorage);
}

async function removeLinkedStorage(params) {
  const tId = Array.isArray(params.id) ? params.id : [params.id];
  const dConns = tId.map(i => dynamoDB.removeConnection(params.storageId, i));
  await Promise.allSettled(dConns);
  return await postgres.removeLinkedStorage(params);
}


export async function hasActiveConnections(modules, storageId) {
  const { channel } = modules;
  const conns = await dynamoDB.getConnections(storageId);
  const aConns = await Promise.allSettled(conns.map(c => channel.Channel.getConnection(c.connectionId,  c.endpoint)
    .catch(e => Promise.reject({ connection: c, cause: e })
  )));
  const rConns = aConns.filter(c => c.status == 'rejected');
  if (rConns.length > 0) {
    const rConObj = rConns.reduce((a, c) => {
      a.ids.push(c.reason.connection.connectionId);
      return a; 
    }, { storageId: rConns[0].reason.connection.storageId, ids: [] });
    await removeLinkedStorage({ storageId: rConObj.storageId, id: rConObj.ids });
  }
  const sLength = aConns.length - rConns.length;
  return sLength > 0;
}


export default {
  getBroadcastReady,
  getIntentionById: postgres.getIntentionById,
  addLinkedStorage,
  removeLinkedStorage: removeLinkedStorage,
  getStorageLinks: postgres.getStorageLinks,
  addIntention: postgres.addIntention,
  addAccepting: postgres.addAccepting,
  addAccepted: postgres.addAccepted,
  deleteAccepting: postgres.deleteAccepting,
  deleteAccepted: postgres.deleteAccepted,
  intentionDispatcher: intentionDispatcher
}