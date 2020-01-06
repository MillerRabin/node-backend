const config = require('./config.js');
const { IntentionStorage } = require('intention-storage');
const intentionStorage = new IntentionStorage();

async function init() {
    const storageServer = await intentionStorage.createServer(config.settings);
    console.log(`Server listens on port ${storageServer.socketServer.port}`);
}

init();
