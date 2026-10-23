import { getKnex } from '../../config/database.js';
import { env } from '../../config/env.js';
import { unlinkSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

export async function updateAvatar(userId, avatarFilename) {
  const knex = getKnex();

  // Get current avatar to delete old file
  const user = await knex('users')
    .where({ id: userId })
    .whereNull('deleted_at')
    .first('avatar_url');

  if (!user) {
    const err = new Error('Usuário não encontrado');
    err.statusCode = 404;
    throw err;
  }

  // Delete old avatar file if exists
  if (user.avatar_url) {
    const oldPath = resolve(process.cwd(), env.UPLOAD_DIR, user.avatar_url);
    if (existsSync(oldPath)) {
      unlinkSync(oldPath);
    }
  }

  const avatarUrl = `/uploads/${avatarFilename}`;

  await knex('users')
    .where({ id: userId })
    .update({
      avatar_url: avatarFilename,
      updated_at: new Date().toISOString(),
    });

  return {
    user: {
      id: userId,
      avatar_url: avatarUrl,
    },
    message: 'Avatar atualizado com sucesso',
  };
}

export async function getUsers() {
  const knex = getKnex();
  return await knex('users').whereNull('deleted_at')
}

const DEFAULT_PREFERENCES = {
  theme: 'system',
  large_text: false,
  high_contrast: false,
  reduce_motion: false,
};

function normalizePreferences(row) {
  if (!row) return DEFAULT_PREFERENCES;
  return {
    theme: row.theme,
    large_text: Boolean(row.large_text),
    high_contrast: Boolean(row.high_contrast),
    reduce_motion: Boolean(row.reduce_motion),
  };
}

export async function getPreferences(userId) {
  const row = await getKnex()('user_preferences').where({ user_id: userId }).first();
  return normalizePreferences(row);
}

export async function updatePreferences(userId, updates) {
  const knex = getKnex();
  const current = await knex('user_preferences').where({ user_id: userId }).first();
  const updatedAt = new Date().toISOString();
  const values = {
    ...DEFAULT_PREFERENCES,
    ...normalizePreferences(current),
    ...updates,
    updated_at: updatedAt,
  };

  if (current) {
    await knex('user_preferences').where({ user_id: userId }).update(values);
  } else {
    await knex('user_preferences').insert({ user_id: userId, ...values });
  }

  return normalizePreferences(values);
}