import { promises as fs } from 'fs'
import path from 'path';

const gPluginsHash = {};

async function dispatchPackage(intentionStorage, pluginsPath) {
  try {
    const packagePath = path.join(pluginsPath, 'package.json');
    const pkg = await loadPackageJson(packagePath);
    loadIntentions(intentionStorage, pkg, pluginsPath);
  } catch (e) {
    unloadIntentions(intentionStorage, pluginsPath)
  }
}

function getFromPluginsList(filepath) {
  return gPluginsHash[filepath];
}

function setToPluginsList(filepath, plugin) {
  gPluginsHash[filepath] = plugin;
}

function removeFromPluginsList(filepath) {
  delete gPluginsHash[filepath];
}

async function requestFromPluginsList(filepath, pkg) {
  const mainFile = path.join(filepath, pkg.intentionsMain);
  const sp = getFromPluginsList(filepath);
  if (sp != null) return sp;
  const plugin = await import(mainFile);
  setToPluginsList(filepath, plugin);
  return plugin;
}

function loadIntentions(intentionStorage, pkg, filepath) {
  if (pkg.intentionsMain == null) return;
  const plugin = requestFromPluginsList(filepath, pkg);
  plugin.unload(intentionStorage);
  plugin.load(intentionStorage);
}

function unloadIntentions(intentionStorage, filepath) {
  const plugin = getFromPluginsList(filepath);
  if (plugin == null) return;
  plugin.unload(intentionStorage);
  removeFromPluginsList(filepath);
}

async function loadPackageJson(filepath) {
  const buffer = await fs.readFile(filepath);
  return JSON.parse(buffer.toString());
}

function watchPlugins(intentionStorage, pluginsPath) {
  fs.watch(pluginsPath, onModuleChange);

  function onModuleChange(eventType, filepath) {
    if (eventType != 'rename') return;
    const pp = path.join(pluginsPath, filepath);
    dispatchPackage(intentionStorage, pp);
  }
};

export default {
  watchPlugins
}

