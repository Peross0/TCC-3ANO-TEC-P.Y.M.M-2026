import bcrypt from "bcryptjs";
import { createHash } from 'node:crypto';
import { getKnex } from "../../config/database.js";
import {
    createAuthTokens,
    generatePasswordResetCode,
} from "../../utils/jwt.js";
import { sendPasswordResetEmail } from "../../utils/mailer.js";

const CODE_EXPIRY_MINUTES = 10;
const MAX_RESET_ATTEMPTS = 5;
const MAX_RESET_REQUESTS_PER_EMAIL = 3;
const MAX_RESET_REQUESTS_PER_IP = 12;
const RESET_EMAIL_WINDOW_MS = 60 * 60 * 1000;
const RESET_IP_WINDOW_MS = 15 * 60 * 1000;
const RESET_LOG_RETENTION_MS = 24 * 60 * 60 * 1000;
const RESET_RESPONSE_MESSAGE = 'Se o e-mail estiver cadastrado, as instruções de recuperação serão processadas.';

const sha256 = (value) => createHash('sha256').update(value).digest('hex');

async function isResetRateLimited(knex, emailHash, ipHash, now) {
  const [emailCount, ipCount] = await Promise.all([
    knex('password_reset_attempts')
      .where({ email_hash: emailHash })
      .where('created_at', '>', new Date(now.getTime() - RESET_EMAIL_WINDOW_MS).toISOString())
      .count({ total: '*' })
      .first(),
    knex('password_reset_attempts')
      .where({ ip_hash: ipHash })
      .where('created_at', '>', new Date(now.getTime() - RESET_IP_WINDOW_MS).toISOString())
      .count({ total: '*' })
      .first(),
  ]);

  await knex('password_reset_attempts').insert({
    email_hash: emailHash,
    ip_hash: ipHash,
    created_at: now.toISOString(),
  });

  return Number(emailCount.total) >= MAX_RESET_REQUESTS_PER_EMAIL
    || Number(ipCount.total) >= MAX_RESET_REQUESTS_PER_IP;
}

export async function registerUser(data) {
  const knex = getKnex();

  // Check if email already exists
  const existingEmail = await knex("users")
    .where({ email: data.email })
    .first();
  if (existingEmail) {
    const err = new Error("E-mail já cadastrado");
    err.code = "SQLITE_CONSTRAINT_UNIQUE";
    throw err;
  }

  // Check if document already exists
  const existingDoc = await knex("users")
    .where({ document_number: data.document_number })
    .first();
  if (existingDoc) {
    const err = new Error("Documento já cadastrado");
    err.code = "SQLITE_CONSTRAINT_UNIQUE";
    throw err;
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const [user] = await knex("users")
    .insert({
      email: data.email,
      password_hash: passwordHash,
      full_name: data.full_name,
      user_type: data.user_type,
      document_type: data.document_type,
      document_number: data.document_number,
      phone: data.phone || null,
      course: data.course || null,
      avatar_url: null,
      verified_email: true,
      code_email_verification: null,
      code_expires_at: null,
      active_notification: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    })
    .returning(["id", "email", "full_name", "user_type", "verified_email"]);

  const tokens = createAuthTokens(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      user_type: user.user_type,
      verified_email: user.verified_email,
    },
    ...tokens,
    message: "Cadastro realizado com sucesso.",
  };
}

export async function loginUser(email, password) {
  const knex = getKnex();

  const user = await knex("users")
    .where({ email })
    .whereNull("deleted_at")
    .first();

  if (!user) {
    const err = new Error("Credenciais inválidas");
    err.statusCode = 401;
    throw err;
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    const err = new Error("Credenciais inválidas");
    err.statusCode = 401;
    throw err;
  }

  const tokens = createAuthTokens(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      user_type: user.user_type,
      verified_email: user.verified_email,
      avatar_url: user.avatar_url,
      active_notification: user.active_notification,
    },
    ...tokens,
  };
}

export async function forgotPassword(email, clientIp = '') {
  const knex = getKnex();
  const now = new Date();
  const normalizedEmail = email.trim().toLowerCase();
  const emailHash = sha256(normalizedEmail);
  const ipHash = sha256(clientIp || 'unknown');

  await knex('password_reset_attempts')
    .where('created_at', '<', new Date(now.getTime() - RESET_LOG_RETENTION_MS).toISOString())
    .delete();

  const rateLimited = await isResetRateLimited(knex, emailHash, ipHash, now);
  if (rateLimited) return { message: RESET_RESPONSE_MESSAGE };

  const user = await knex("users")
    .where({ email: normalizedEmail })
    .whereNull("deleted_at")
    .first();

  if (!user) return { message: RESET_RESPONSE_MESSAGE };

  const code = generatePasswordResetCode();
  const requestedAt = now.toISOString();
  const codeExpiresAt = new Date(now.getTime() + CODE_EXPIRY_MINUTES * 60 * 1000).toISOString();

  await knex('password_reset_requests')
    .where({ user_id: user.id })
    .whereNull('consumed_at')
    .update({ consumed_at: requestedAt });

  const [requestId] = await knex('password_reset_requests').insert({
    user_id: user.id,
    code_hash: await bcrypt.hash(code, 12),
    requested_at: requestedAt,
    expires_at: codeExpiresAt,
    failed_attempts: 0,
  });

  try {
    await sendPasswordResetEmail(normalizedEmail, code, CODE_EXPIRY_MINUTES);
  } catch (error) {
    await knex('password_reset_requests').where({ id: requestId }).update({ consumed_at: new Date().toISOString() });
    console.error('[PASSWORD_RESET_EMAIL_FAILED] Não foi possível enviar o e-mail de recuperação.', error.code || 'SMTP_ERROR');
  }

  return { message: RESET_RESPONSE_MESSAGE };
}

export async function resetPassword(email, code, password) {
  const knex = getKnex();

  const normalizedEmail = email.trim().toLowerCase();
  const now = new Date().toISOString();
  let invalidCode = false;

  await knex.transaction(async (trx) => {
    const user = await trx('users')
      .where({ email: normalizedEmail })
      .whereNull('deleted_at')
      .first('id', 'token_version');
    if (!user) {
      invalidCode = true;
      return;
    }

    const request = await trx('password_reset_requests')
      .where({ user_id: user.id })
      .whereNull('consumed_at')
      .where('expires_at', '>', now)
      .orderBy('requested_at', 'desc')
      .first();
    if (!request || request.failed_attempts >= MAX_RESET_ATTEMPTS) {
      invalidCode = true;
      return;
    }

    const matches = await bcrypt.compare(code, request.code_hash);
    if (!matches) {
      await trx('password_reset_requests')
        .where({ id: request.id })
        .increment('failed_attempts', 1);
      invalidCode = true;
      return;
    }

    const consumed = await trx('password_reset_requests')
      .where({ id: request.id })
      .whereNull('consumed_at')
      .where('expires_at', '>', now)
      .where('failed_attempts', '<', MAX_RESET_ATTEMPTS)
      .update({ consumed_at: now });
    if (!consumed) {
      invalidCode = true;
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await trx('users').where({ id: user.id }).update({
      password_hash: passwordHash,
      code_email_verification: null,
      code_expires_at: null,
      token_version: Number(user.token_version || 0) + 1,
      updated_at: now,
    });
  });

  if (invalidCode) {
    const error = new Error('Código inválido ou expirado. Solicite um novo código.');
    error.statusCode = 400;
    throw error;
  }

  return {
    message: "Senha redefinida com sucesso. Agora você pode fazer login.",
  };
}

export async function changePassword(userId, currentPassword, newPassword) {
  const knex = getKnex();
  const user = await knex('users')
    .where({ id: userId })
    .whereNull('deleted_at')
    .first('id', 'email', 'full_name', 'user_type', 'password_hash', 'token_version');

  if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
    const error = new Error('A senha atual está incorreta.');
    error.statusCode = 401;
    throw error;
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  const tokenVersion = Number(user.token_version || 0) + 1;
  await knex('users').where({ id: user.id }).update({
    password_hash: passwordHash,
    token_version: tokenVersion,
    updated_at: new Date().toISOString(),
  });

  return {
    token: createAuthTokens({ ...user, token_version: tokenVersion }).token,
    message: 'Senha alterada com sucesso.',
  };
}

export async function getMe(userId) {
  const knex = getKnex();

  const user = await knex("users")
    .where({ id: userId })
    .whereNull("deleted_at")
    .first(
      "id",
      "email",
      "full_name",
      "user_type",
      "verified_email",
      "avatar_url",
      "active_notification",
      "phone",
      "course",
      "document_type",
      "document_number",
      "created_at",
    );

  if (!user) {
    const err = new Error("Usuário não encontrado");
    err.statusCode = 404;
    throw err;
  }

  return { user };
}
