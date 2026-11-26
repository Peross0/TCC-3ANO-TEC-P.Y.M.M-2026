import { existsSync, unlinkSync } from 'node:fs';
import { stat, unlink } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { getKnex } from '../../config/database.js';
import { env } from '../../config/env.js';

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

function sanitizeDocumentName(name) {
  const normalized = basename(String(name || '').replace(/\\/g, '/'))
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .slice(0, 255);
  return normalized || 'documento';
}

function documentFilePath(storageFilename) {
  return join(env.DOCUMENT_UPLOAD_DIR, basename(storageFilename));
}

function mapDocument(row) {
  return {
    id: row.id,
    name: row.original_name,
    mime_type: row.mime_type,
    size: row.size,
    created_at: row.created_at,
  };
}

export async function getDocuments(userId) {
  const documents = await getKnex()('user_documents')
    .where({ user_id: userId })
    .orderBy('created_at', 'desc')
    .select('id', 'original_name', 'mime_type', 'size', 'created_at');
  return documents.map(mapDocument);
}

export async function saveDocument(userId, file) {
  if (file.size === 0) {
    await unlink(file.path);
    const err = new Error('Selecione um arquivo não vazio para anexar.');
    err.statusCode = 400;
    throw err;
  }

  const knex = getKnex();
  const user = await knex('users')
    .where({ id: userId })
    .whereNull('deleted_at')
    .first('id');
  if (!user) {
    await unlink(file.path);
    const err = new Error('Usuário não encontrado');
    err.statusCode = 404;
    throw err;
  }

  try {
    const [id] = await knex('user_documents').insert({
      user_id: userId,
      storage_filename: basename(file.filename),
      original_name: sanitizeDocumentName(file.originalname),
      mime_type: file.mimetype || 'application/octet-stream',
      size: file.size,
      created_at: new Date().toISOString(),
    });

    const document = await knex('user_documents')
      .where({ id, user_id: userId })
      .first('id', 'original_name', 'mime_type', 'size', 'created_at');
    return mapDocument(document);
  } catch (error) {
    await unlink(file.path).catch((cleanupError) => {
      console.error('[DOCUMENT_UPLOAD_CLEANUP_FAILED] Não foi possível remover um upload incompleto.', cleanupError);
    });
    throw error;
  }
}

export async function getDocumentFile(userId, documentId) {
  const document = await getKnex()('user_documents')
    .where({ id: documentId, user_id: userId })
    .first('id', 'storage_filename', 'original_name');

  if (!document) {
    const err = new Error('Documento não encontrado.');
    err.statusCode = 404;
    throw err;
  }

  try {
    await stat(documentFilePath(document.storage_filename));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const missingFile = new Error('O arquivo deste documento não está disponível.');
    missingFile.statusCode = 404;
    throw missingFile;
  }

  return {
    ...document,
    filePath: documentFilePath(document.storage_filename),
  };
}

export async function deleteDocument(userId, documentId) {
  const document = await getKnex()('user_documents')
    .where({ id: documentId, user_id: userId })
    .first('id', 'storage_filename');
  if (!document) {
    const err = new Error('Documento não encontrado.');
    err.statusCode = 404;
    throw err;
  }

  try {
    await unlink(documentFilePath(document.storage_filename));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  await getKnex()('user_documents')
    .where({ id: document.id, user_id: userId })
    .delete();
}

export async function getUsers() {
  const knex = getKnex();
  return await knex('users')
    .whereNull('deleted_at')
    .select(
      'id',
      'email',
      'full_name',
      'user_type',
      'document_type',
      'document_number',
      'phone',
      'avatar_url',
      'active_notification',
      'created_at',
      'updated_at',
    );
}

const DEFAULT_PREFERENCES = {
  theme: 'system',
  large_text: false,
  high_contrast: false,
  reduce_motion: false,
  color_vision_mode: 'none',
  preferred_sector: null,
  preferred_location: null,
  preferred_work_model: null,
  preferred_contract_type: null,
};

function normalizePreferences(row) {
  if (!row) return DEFAULT_PREFERENCES;
  return {
    theme: row.theme,
    large_text: Boolean(row.large_text),
    high_contrast: Boolean(row.high_contrast),
    reduce_motion: Boolean(row.reduce_motion),
    color_vision_mode: row.color_vision_mode || 'none',
    preferred_sector: row.preferred_sector || null,
    preferred_location: row.preferred_location || null,
    preferred_work_model: row.preferred_work_model || null,
    preferred_contract_type: row.preferred_contract_type || null,
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