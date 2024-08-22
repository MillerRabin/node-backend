import db from "./db.mjs";
import config from "./config.mjs";
import { intentions } from "./intentions.mjs";

async function createStorage() {
  const client = await db.writePool;
  const values = [
    config.storage.id,
    config.storage.sourceIp,
    config.storage.port,
    null,
    'manual',
    config.stage,
    `${config.storage.schema}://${config.storage.sourceIp}:${config.storage.port}`,
    config.storage.schema,
    config.storage.name
  ];

  const text = `
    insert into node.connections (id, source_ip, port, origin, handling, env, endpoint, schema, storage_name)
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    on conflict (id) do update set      
      source_ip = EXCLUDED.source_ip,
      port = EXCLUDED.port,
      origin = EXCLUDED.origin,
      handling = EXCLUDED.handling,
      env = EXCLUDED.env,
      endpoint = EXCLUDED.endpoint,
      schema = EXCLUDED.schema,      
      storage_name = EXCLUDED.storage_name
  `;

  const res = await client.query({
    text,
    values
  });
  return res;
}

async function addIntention(intention) {
  const client = await db.writePool;
  const values = [
    intention.id,
    config.storage.id,
    intention.input,
    intention.output,
    intention.title,
    intention.description,
    intention.onData,
    intention.interface
  ];

  const text = `
    insert into node.intentions(id, storage_id, input, output, title, description, ondata, interface) 
    values ($1, $2, $3, $4, $5, $6, $7, $8)
    on conflict (id) do update set      
      storage_id = EXCLUDED.storage_id,
      input = EXCLUDED.input,
      output = EXCLUDED.output,
      title = EXCLUDED.title,
      description = EXCLUDED.description, 
      ondata = EXCLUDED.ondata,
      interface = EXCLUDED.interface      
  `;
  const res = await client.query({
    text,
    values
  });
  return res;
}

async function createIntentions() {
  for (const intention of intentions) {
    await addIntention(intention);
  }
}


export async function init() {
  await createStorage();
  await createIntentions();
}