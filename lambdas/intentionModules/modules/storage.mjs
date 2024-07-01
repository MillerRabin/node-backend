import config from "./config.mjs";
import core from "@intention-network/core";
import dbStorage from "./dbInterface/main.mjs";

export default new core.IntentionStorage(config.storageId, dbStorage);