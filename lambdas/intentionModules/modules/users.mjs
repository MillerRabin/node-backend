import { readPool, writePool } from "./db.mjs";
import token from "./token.mjs";
import voiceAuth from "./voiceAuth.mjs";
import { voiceRecognitionThreshold, distanceLimit } from './config.mjs';
import { loginResultLog } from "./logger/logger.mjs";

const callTable = {
  register: async function (params) { 
    return await registerUser(params);
  },
  login: async function (params) {
    return await loginUser(params);
  },
  update: async (params) => updateUser(params),
}

async function callInterface(interfaceObject, value) {
  const command = value.command;
  if (command == null) throw new Error('command field expected');  
  const func = callTable[command];
  if (func == null) throw new Error(`function ${command} is not implemented`);
  return await func(value.data);
}

export async function addUser({ deviceId, userName, voiceHash, email = null }) {
  const values = [deviceId, userName, voiceHash, email];
  const text = `
    insert into node.users (device_id, user_name, voice_hash, email) 
    values ($1, $2, $3, $4)
    on conflict (device_id, user_name) do update
    set voice_hash = excluded.voice_hash, updated_at = now()
    returning id, user_name, email
  `;
  const res = await writePool.query({ text, values });
  const row = res.rows[0];
  if (row == null) throw new Error(`Can't obtain created user`);
  return {    
    id: row.id,
    userName: row.user_name    
  }
}

const getUser = async ({ deviceId }) => {
  const values = [deviceId];
  const { rows: [ user ] } = await readPool.query({
    text: `
      select id, user_name, voice_hash, email from node.users where device_id = $1
      order by updated_at desc nulls last
      limit 1
    `,
    values,
  });
  return user;
}

const allowedFields = ['id', 'voice_hash', 'device_id', 'user_name', 'email'];

const updateUserData = async (id, fields) => {
  const uFields = {};
  for (let field in fields) {
    if (!allowedFields.includes(field)) continue;
    uFields[field] = fields[field];
  }
  if (!Object.keys(uFields).length) return;
  const values = [];
  const sql = `UPDATE node.users SET ${
    Object.entries(uFields).map( ([f, v]) => `${f} = $${values.push(v)}`).join(', ')
  } WHERE id = $${values.push(id)};`
  return await readPool.query(sql, values);
}

async function getFile(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error downloading file ${url}, statusCode: ${res.status}`);
  const buf  = Buffer.from(await res.arrayBuffer());
  await deleteFile(url);
  return buf.toString('base64');
}

async function deleteFile(url) {
  const res = await fetch(url, {
    method: "DELETE"
  });
  return res;
}

export async function registerUser({ deviceId, userName, voiceUrl, email }) {
  const voiceData = await getFile(voiceUrl);
  const voiceHash = await voiceAuth.createHash(voiceData);
  const tUser = await addUser({ deviceId, userName, voiceHash, email });
  return token.create(tUser);
}

const loginUser = async ({ deviceId, voiceUrl, distance = distanceLimit, meanLowLimit = voiceRecognitionThreshold }) => {
  const voiceData = await getFile(voiceUrl);
  const tUser = await getUser({ deviceId });
  if (tUser) {
    const { id, user_name, voice_hash, email } = tUser;
    const result = await voiceAuth.compareHashes(voice_hash, voiceData, distance);
    meanLowLimit = meanLowLimit < voiceRecognitionThreshold ? voiceRecognitionThreshold : meanLowLimit;
    const check = result != null && result >= meanLowLimit;
    loginResultLog({
      user_id: id,
      system_id: deviceId,
      result,
      threshold: meanLowLimit,
      success_login: check,
    });
    if (check)
      return token.create({id, userName: user_name, voiceResult: result, email });
    return { voiceResult: result };
  }
  return null;
}

const updateUser = async ({ id, ...fields }) => {
  if (!id) throw new Error("User id required");
  await updateUserData(id, fields);
  return true;
}

export async function auth(status, intention, value) {
  if (status == 'accepting') {
    return this.interface;
  }

  if (status == 'data') {
    return await callInterface(this.interface, value)  
  }

  return { message: 'success'};
}

export default {
  auth
}