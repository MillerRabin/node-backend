import config from './config.js';
import loader from './pluginsLoader.js';
import IS from 'intention-storage';
const IntentionStorage = IS.IntentionStorage;
const nodeModules = './node_modules';

const intentionStorage = new IntentionStorage();
loader.watchPlugins(intentionStorage, nodeModules);

async function init() {
  const storageServer = await intentionStorage.createServer(config.settings);
  console.log(`Server listens on port ${storageServer.socketServer.port}`);
}

init();
