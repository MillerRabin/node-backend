import pg from 'pg';
import config from './config.mjs';

export const readPool = new pg.Pool(config.readPool);
export const writePool = new pg.Pool(config.writePool);

export default {
  readPool,
  writePool
}