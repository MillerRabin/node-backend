import config from "../config.mjs";
import apiGateway from "./apiGateway.mjs";
import localServer from "./localServer.mjs";

const modulePath =  config.isLambda ? './apiGateway.mjs' : './localServer.mjs';
const Channel =  config.isLambda ? apiGateway : localServer;

export function responseToIntegration(response) {
  const statusCode = response.data.statusCode ?? 200;
  const body = JSON.stringify(response.data.body);    
  return { statusCode, body }
}

export default {
  responseToIntegration,
  Channel
}