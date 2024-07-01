import { writePool, readPool } from "../db.mjs";
import intentionDispatcher from "./intentionDispatcher.mjs";


export async function getBroadcastReady(storageId) {
  if (storageId == null) throw new Error("storage id can't be null");
  const values = [];
  const text = `select * from node.broadcast_ready where (storage_name = $${values.push(storageId)})`;
  const res = await readPool.query({ text, values });
  return res.rows
}

export async function getIntentionById(id) {
  if (id == null) throw new Error('Id is expected');
  const values = [];
  const text = `
    select id, storage_id, input, output, title, description, ondata,
		       case when storage_id is null then 'Intention' else 'NetworkIntention' end as type,
		       create_time, interface, accepting.intentions as accepting, accepted.intentions as accepted
    from node.intentions i
    left join (
      select owner_id, array_agg(intention_id) as intentions from node.accepting
      group by owner_id 
    ) accepting on (accepting.owner_id = i.id)
    left join (
      select owner_id, array_agg(intention_id) as intentions from node.accepted
      group by owner_id
    ) accepted on (accepted.owner_id = i.id)
    where id = $${values.push(id)}
  `;

  const res = await readPool.query({ text, values });
  const mres = res.rows.map(r => {
    return {
      id: r.id,
      storageId: r.storage_id,
      input: r.input,
      output: r.output,
      title: r.title,
      description: r.description,
      onData: intentionDispatcher,
      interfaceObject: r.interface,
      dataPath: r.ondata,
      type: r.type,
      createTime: r.create_time,
      accepted: {
        accepted: r.accepting,
        accepting: r.accepted
      }
    }
  });

  return mres[0] ?? null;
}

export async function addLinkedStorage(linkedStorage) {  
  const values = [];
  const text = `
    insert into node.connections ( id, origin, port, schema, handling, storage_id, source_ip, endpoint)
    values (
      $${values.push(linkedStorage.id)},
      $${values.push(linkedStorage.origin)},
      $${values.push(linkedStorage.port)},
      $${values.push(linkedStorage.schema)},
      $${values.push(linkedStorage.handling)},
      $${values.push(linkedStorage.storage.id)},
      $${values.push(linkedStorage.sourceIp)},
      $${values.push(linkedStorage.endpoint)}
    )
    on conflict (id) do update
      set 
        origin = excluded.origin,
        port = excluded.port,
        schema = excluded.schema,        
        storage_id = excluded.storage_id        
    returning id, origin, port, schema, handling, storage_id, source_ip, endpoint
  `;
  const res = await writePool.query({ text, values });
  return res.rows
}

export async function addIntention(intention) {
  await saveIntention(intention);
}

async function saveIntention(intention) {
  const values = [];  
  const text = `
      insert into node.intentions ( id, storage_id, input, output, title, description, ondata, create_time)
      values (
        $${values.push(intention.id)},
        $${values.push(intention.storage.id)},
        $${values.push(intention.input)},
        $${values.push(intention.output)},
        $${values.push(intention.title)},
        $${values.push(intention.description ?? '{}')},
        $${values.push(intention.dataPath)},
        $${values.push(intention.createTime)}  
      )      
      on conflict (id) do update
      set                 
        storage_id = excluded.storage_id,
        input = excluded.input,
        output = excluded.output,
        title = excluded.title,
        description = excluded.description,
        create_time = excluded.create_time
  `;  
  const res = await writePool.query({ text, values });
  return res.rows;  
}

export async function deleteIntention(id) {
  const values = [];
  const text = `
    delete from node.intentions where id = $${values.push(id)}
  `;
  return await writePool.query({ text, values });
}

export async function getStorageLinks({ storageId, id }) {
  if (storageId == null) throw new Error('storageId expected');
  const values = [];
  const where = [];
  where.push(`storage_id = $${values.push(storageId)}`);
  if (id != null)
    where.push(`id = $${values.push(id)}`);

  const text = `
    select * from node.connections
    ${where.length > 0 ? `where ${where.join(' and ')}` : ''}
  `;
  const res = await readPool.query({ text, values });
  return res.rows;
}

export async function removeLinkedStorage({ storageId, id }) {
  if (id == null) throw new Error('id expected');  
  if (storageId == null) throw new Error('storageId expected');
  const ids = Array.isArray(id) ? id : [id];
  const values = [];
  const where = [];
  where.push(`storage_id = $${values.push(storageId)}`);
  where.push(`id = any($${values.push(ids)})`);

  const text = `
    delete from node.connections 
    where ${where.join(' and ')}
  `;
  const res = await writePool.query({ text, values });
  return res;
}

export async function addAccepted(intentionId, intention) {
  const values = [];  
  const text = `
    insert into node.accepted (owner_id, intention_id)
    values (
      $${values.push(intentionId)},
      $${values.push(intention.id)}
    )
    on conflict do nothing
  `;    
  return await writePool.query({ text, values });    
}

export async function addAccepting(intentionId, intention) {
  const values = [];  
  const text = `
    insert into node.accepting (owner_id, intention_id)
    values (
      $${values.push(intentionId)},
      $${values.push(intention.id)}
    )
    on conflict do nothing
  `;    
  return await writePool.query({ text, values });    
}

export async function deleteAccepting(intentionId, intention) {
  if (intentionId == null) throw new Error('intentionId is expected');
  const values = [intentionId, intention.id];
  const text = `
    delete from node.accepting where owner_id = $1 and intention_id = $2
  `;    
  const res = await writePool.query({ text, values });
  if (res.rowCount == 0)
    throw new Error(`deleteAccepting: There are no intention with id = ${intention.id}`)
}

export async function deleteAccepted(intentionId, intention) {
  if (intentionId == null) throw new Error('intentionId is expected');
  const values = [intentionId, intention.id];
  const text = `
    delete from node.accepted where owner_id = $1 and intention_id = $2
  `;    
  const res = await writePool.query({ text, values });
  if (res.rowCount == 0)
    throw new Error(`deleteAccepted: There are no intention with id = ${intention.id}`)
}

export default {
  getBroadcastReady,
  addAccepted,
  getIntentionById,
  addLinkedStorage,
  removeLinkedStorage,
  getStorageLinks,
  addIntention,  
  addAccepting,
  addAccepted,  
  deleteAccepting,
  deleteAccepted,
  intentionDispatcher
}