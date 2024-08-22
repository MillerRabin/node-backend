import secrets from './secrets.mjs';
import version from './version.mjs';

const stage = version.getStage() ?? 'dev';
const db = secrets.loadSync(`${stage}/postgres.json`);
export const storage = secrets.loadSync(`${stage}/storage.json`);
export const telegram = secrets.loadSync('./telegram.json');

const readPool = {
  host: db.read.host,
  user: db.read.user,
  database: db.read.database,
  password: db.read.password,
  port: 5432,
  max: 1,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 20000,
  ssl: {
    rejectUnauthorized: false
  }
};

const writePool = {
  host: db.write.host,
  user: db.write.user,
  database: db.write.database,
  password: db.write.password,
  port: 5432,
  max: 1,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 20000,
  ssl: {
    rejectUnauthorized: false
  }
};

export const  voiceRecognitionThreshold = 0.65;
export const  distanceLimit = 0.7;

export default {
  readPool,
  writePool,
  stage,
  storage,
  voiceService: 'https://auth.speakease.co',
  telegram,
  voiceRecognitionThreshold,
  distanceLimit
}