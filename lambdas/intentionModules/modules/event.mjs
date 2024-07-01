import config from './config.mjs';

export function getConnectionId(event) {
  return event.requestContext.connectionId;  
}

export function getSourceIp(event) {
  return event?.requestContext?.identity?.sourceIp ?? null;
}

export function getEndpoint(event) {
  const context = event.requestContext;
  const endpoint = event.requestContext.endpoint;
  if (endpoint == null) {
    if (context.apiId == null) return 'localhost';
    return `https://${context.apiId}.execute-api.${config.region}.amazonaws.com/${context.stage}`;
  }
    
  return endpoint;
}


export default {
  getConnectionId,
  getEndpoint,
  getSourceIp
}