import config from "./config.mjs";
import core from "@intention-network/core";
import dbStorage from "./dbInterface/main.mjs";
import { init } from "./init.mjs";

await init();

export default new core.IntentionStorage(config.storage.id, dbStorage);