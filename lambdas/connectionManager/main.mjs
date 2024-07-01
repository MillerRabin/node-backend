import configLink from './modules/config.mjs';
import connLink from './modules/connections/main.mjs';
import channelLink from './modules/channel/main.mjs';
import messagesLink from './modules/messages.mjs';
import storageLink from './modules/storage.mjs';

export const connections = connLink;
export const channel = channelLink;
export const config = configLink;
export const messages = messagesLink;
export const storage = storageLink;

export default {
  config,    
  connections,
  channel,
  messages,
  storage
}; 