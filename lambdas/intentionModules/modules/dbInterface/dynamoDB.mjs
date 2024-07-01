import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

import config from "../config.mjs";


const marshallOptions = {
  convertEmptyValues: true,
  removeUndefinedValues: true,
  convertClassInstanceToMap: false
};

const unmarshallOptions = {
  wrapNumbers: false
};

const translateConfig = { marshallOptions, unmarshallOptions };

const client = new DynamoDBClient({ region: config.region });
const dClient = DynamoDBDocumentClient.from(client, translateConfig);

export async function addConnection(storageId, connectionId, endpoint) {
  return await dClient.send(new PutCommand({
    TableName: "node.connections",
    Item: {
      storage_id: `${storageId}`,
      connection_id: `${connectionId}`,
      endpoint: `${endpoint}`
    }
  }));
}

export async function removeConnection(storageId, connectionId) {
  return await dClient.send(new DeleteCommand({
    TableName: "node.connections",
    Key: {
      storage_id: `${storageId}`,
      connection_id: `${connectionId}`
    }
  }));
}

async function getConnections(storageId) {
  const conns = await dClient.send(new QueryCommand({
    TableName: "node.connections",
    ExpressionAttributeValues: {
      ":storage": {S:`${storageId}`}
    },
    KeyConditionExpression: "storage_id = :storage"
  }));
  return conns.Items.map(c => {
    return {
      storageId: c.storage_id.S,
      connectionId: c.connection_id.S,
      endpoint: c.endpoint.S
    }
  });
}

export default {
  addConnection, 
  removeConnection,
  getConnections
}