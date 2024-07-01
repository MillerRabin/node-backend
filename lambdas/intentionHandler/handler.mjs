import modules, { messages, channel, storage }  from "./main.mjs";
export async function handler(event) {   
  try {    
    const data = await storage.dispatch(modules, event);
    const response = messages.createMessage(data);
    return await channel.responseToIntegration(response);
  } catch (e) {
    console.error(e);
    const response = messages.createError(e);
    return await channel.responseToIntegration(response);
  }  
}
  