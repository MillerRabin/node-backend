import  { PostToConnectionCommand, ApiGatewayManagementApiClient, ApiGatewayManagementApi } from "@aws-sdk/client-apigatewaymanagementapi";
import { getConnectionId, getEndpoint } from "../event.mjs";

let gGateway = null;
function getGateway(endpoint) {
  if (gGateway != null) return gGateway;
  gGateway = new ApiGatewayManagementApiClient({ apiVersion: "2018-11-29", endpoint });
  return gGateway;
}

export default class Channel {  
  #connectionId;
  #onmessage;  
  #gateway;
  #id;
  #endpoint;
  
  get onmessage() { return this.#onmessage;}
  set onmessage(value) { this.#onmessage = value; }

  constructor(event, connectionId) {
    this.#endpoint = getEndpoint(event);
    this.#gateway = getGateway(this.#endpoint);
    this.#connectionId = connectionId ?? getConnectionId(event);
    this.#id = this.#connectionId;
  }

  get id() { return this.#id }
  get endpoint() { return this.#endpoint };

  static async getConnection(connectionId, endpoint) {    
    const gateway = new ApiGatewayManagementApi({ apiVersion: "2018-11-29", endpoint });    
    return await gateway.getConnection({ ConnectionId: connectionId });
  }
  
  async send(data) {
    try {                  
      const res = await this.#gateway.send(
        new PostToConnectionCommand({    
          Data: data,
          ConnectionId: this.#connectionId
        })
      );       
      return res;
    } catch (e) {
      console.log('apigateway send error');
      console.log('connectionId', this.#connectionId);
      console.error(e);
      console.log(data);
      throw e;
    }  
  }
}