import path from 'path';
import url from "url";
import version from "./version.mjs";
import secrets from './secrets.mjs';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

function isLambda() {    
  return __dirname == '/opt/nodejs/modules';
}

//Use NODE_PATH env to add
//NODE_PATH: '/opt/nodejs/node18/node_modules:/opt/nodejs/node_modules:/var/runtime/node_modules:/var/runtime:/var/task'
//NODE_EXTRA_CA_CERTS: '/var/runtime/ca-cert.pem' try to use as certificate for postgres

const isLambdaDetected = isLambda();
const stage = version.getStage() ?? 'dev';
const storageId = version.getStorageId() ?? `local-${process.env.USER}`; //Change it for your environment

const db = secrets.loadSync(`${stage}/postgres.json`);
//const { default: db } = await import(pgPath, { assert: { type: 'json'}});

if (!isLambdaDetected) {
  const awsPath = path.join(__dirname, `../.credentials/aws.json`);
  const { default: aws } = await import(awsPath, { assert: { type: 'json'}});
  process.env["AWS_ACCESS_KEY_ID"] =  aws.accessKeyId;
  process.env["AWS_SECRET_ACCESS_KEY"] = aws.secretAccessKey;
}

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
  isLambda: isLambdaDetected,
  region: 'us-east-1',
  storageId,
  voiceService: 'https://auth.speakease.co',
  telegram,
  voiceRecognitionThreshold,
  distanceLimit
}