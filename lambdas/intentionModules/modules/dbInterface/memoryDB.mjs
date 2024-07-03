const gConnections = {};

function getConnections() {
  return [...gConnections];
}

function getKey(storageId, connectionId) {
  return `${storageId} - ${connectionId}`;
}

function addConnection(storageId, connectionId, endpoint) {
  const key = getKey(storageId, connectionId);
  gConnections[key] = {
    storageId,
    connectionId,
    endpoint
  };
}

function removeConnection(storageId, connectionId) {
  const key = getKey(storageId, connectionId);
  delete gConnections[key];
}

export default {
  getConnections,
  addConnection,
  removeConnection
}