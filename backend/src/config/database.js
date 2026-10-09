import Knex from 'knex';
import knexConfig from '../../knexfile.js';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

// Ensure database directory exists
const dbPath = knexConfig.connection.filename;
mkdirSync(dirname(dbPath) || '.', { recursive: true });

let knexInstance = null;

export function getKnex() {
  if (!knexInstance) {
    knexInstance = Knex(knexConfig);
  }
  return knexInstance;
}

export async function ensureDatabaseReady() {
  const knex = getKnex();

  try {
    await knex.migrate.latest();
  } catch (error) {
    console.error('❌ Falha ao inicializar o banco de dados:', error);
    throw error;
  }
}

export function closeKnex() {
  if (knexInstance) {
    knexInstance.destroy();
    knexInstance = null;
  }
}

export default getKnex;