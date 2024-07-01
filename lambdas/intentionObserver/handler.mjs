import modules, { messages, channel, storage } from "./main.mjs";

export async function handler() {  
  try {    
    const data = await storage.observe(modules); 
    const response = messages.createMessage(data);
    return await channel.responseToIntegration(response);
  } catch (e) {
    console.error(e);
    const response = messages.createError(e);
    return await channel.responseToIntegration(response);
  }  
}
  