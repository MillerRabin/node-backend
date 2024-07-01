import { getConnectionId } from "../event.mjs";
import core from "@intention-network/core"; 
import connections from "../connections/localConnections.mjs";

export default class Channel {
  #client;
  #onmessage;
  #id;
  #endpoint = 'localhost';
  
  get onmessage() { return this.#onmessage; }
  get endpoint() { return this.#endpoint; }
  set onmessage(value) { this.#onmessage = value; }
 
  constructor(event, connectionId, storage) {    
    const conn = connectionId ?? getConnectionId(event);    
    this.#client = connections.get(storage, conn);
    this.#id = conn;
  }

  get id() { return this.#id };

  static async getConnection(connectionId, event) {
    return connections.getConnection(connectionId, event);
  }

  async send(data) {
    return core.send({ channel: this.#client, message: data });
  }

}