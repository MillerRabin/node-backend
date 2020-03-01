const config = require('./config.js');
const loader = require('./pluginsLoader.js');
const path = require('path');
const { IntentionStorage } = require('intention-storage');

const nodeModules = path.join(__dirname, 'node_modules');

const intentionStorage = new IntentionStorage();
loader.watchPlugins(intentionStorage, nodeModules);

async function init() {
    const storageServer = await intentionStorage.createServer(config.settings);
    console.log(`Server listens on port ${storageServer.socketServer.port}`);
}

init();
