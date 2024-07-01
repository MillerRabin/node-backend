import users from '../users.mjs';
import network from '../network.mjs';
import wallets from '../wallets.mjs';
import report from '../report.mjs';

const callTable = {
  users,
  network,
  wallets,
  report,
}

function getPathFunction(dataPath) {
  const [ moduleName, funcName ] = dataPath.split('.');
  const md = callTable[moduleName];
  if (md == null) throw new Error(`module ${moduleName} is not defined`);
  const func = md[funcName];
  if (func == null) throw new Error(`function ${funcName} is not implemented in ${moduleName}`);
  return func;  
}

export default async function dispatch(status, intention, value) {
  const path = this.dataPath;
  if (path == null) throw new Error('dataPath is undefined');
  const func = getPathFunction(path);
  return await func.apply(this, [status, intention, value]);
}