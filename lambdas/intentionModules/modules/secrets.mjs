import fs from 'fs';
import path from 'path';
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const secretPath = path.resolve(__dirname, '..', '.credentials');

export function loadSync(filename) {
  const filePath = path.join(secretPath, filename);
  const str = fs.readFileSync(filePath).toString('utf-8');
  return JSON.parse(str);
}

export function readJWTKeys() {
  const parseFile = (filename) => {
    const filePath = path.join(secretPath, filename);
    return fs.readFileSync(filePath).toString('utf-8');
  }
  try {
    return {
      privateKey: parseFile('private-jwt-key.pem'),
      publicKey: parseFile('public-jwt-key.pem')
    }
  } catch (err) {
    throw new Error(`Can't find private-jwt-key.pem or public-jwt-key.pem in you .credentials folder`)
  }
}

export default {
  loadSync,
  readJWTKeys
}