import { writePool } from "./db.mjs";
import telegram from "./telegram.mjs";

const formatTgMessage = ({ message, systemInfo }) => {
  const { androidSystemInfo, origin, screen } = systemInfo; 
  let header = androidSystemInfo ? `Android: ${androidSystemInfo.androidVersion}
Phone model: ${androidSystemInfo.manufacturer} ${androidSystemInfo.model}
SDK Version: ${androidSystemInfo.targetSdkVersion}
Screen resolution: ${androidSystemInfo.width}x${androidSystemInfo.height}
` : '';
  header += `${origin ? `Origin: ${origin}
` : ''}`;
  header += `App screen resolution: ${screen.width}x${screen.height}, pixelRatio: ${screen.pixelRatio}
  `;
  const { error, userComment } = message;
  const msg = error ? `Error: ${error.message}
Task: ${error.taskName}` : `Message: ${userComment}`;
  return header ? `${header}
${msg}` : msg;
}

const callTable = {
  send: async function ({ message, system_info }) {
    const { error, userComment } = JSON.parse(message);
    const fType = error ? 'error' : 'feedback';
    const { deviceId, ...systemInfo } = JSON.parse(system_info);
    const tg_message = formatTgMessage({ message: { error, userComment}, systemInfo});
    const values = [];
    let text;
    if (fType == 'feedback') {
      text = `INSERT into node.feedbacks ("user_comment", "system_info", "type", "device_id")
        VALUES ($${values.push(userComment)}, $${values.push(system_info)},
        $${values.push(fType)}, $${values.push(deviceId)});`
    } else {
      text = `INSERT into node.feedbacks
      ("user_comment", "system_info", "type", "stacktrace", "message", "task_name", "device_id")
        VALUES ($${values.push(userComment)}, $${values.push(system_info)},
        $${values.push(fType)}, $${values.push(error.stackTrace)},
        $${values.push(error.message)}, $${values.push(error.taskName)}, $${values.push(deviceId)});`
    }
    await Promise.allSettled([
      telegram.sendMessage(tg_message)
        .then( result => console.log(result))
        .catch(err => console.log(err)),
      writePool.query({ text, values })
    ]);        
    return true;
  },
}

async function callInterface(interfaceObject, value) {
  const command = value.command;  
  if (command == null) throw new Error('command field expected');  
  const func = callTable[command];
  if (func == null) throw new Error(`function ${command} is not implemented`);
  return await func(value.data);
}


export async function send(status, intention, value) {
  if (status == 'accepting') {
    return this.interface;
  }

  if (status == 'data') {
    return await callInterface(this.interface, value)  
  }

  return { message: 'success'};
}

export default {
  send
}