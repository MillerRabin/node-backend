import config from "./config.mjs";

async function getJSON (response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    throw { message: text }
  }
}

export async function createHash(voiceData) {
  const res = await fetch(`${config.voiceService}/api/createHash`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ voiceData })
  });
  const data = await getJSON(res);
  return data.embeddings;
}

export async function compareHashes(embeddings, voiceData, threshold) {
  const res = await fetch(`${config.voiceService}/api/compareHashes`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ embeddings, voiceData, threshold })
  });
  const data = await getJSON(res);
  return data.result;
}

export default {
  createHash,
  compareHashes
}
