import bcrypt from "bcryptjs";
import { getKnex } from "../../config/database.js";
import { createAuthTokens } from "../../utils/jwt.js";

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
      company_name: data.user_type === 'RECRUITER' ? data.company_name || null : null,
      avatar_url: null,
      active_notification: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    })
    .returning(["id", "email", "full_name", "user_type"]);

  const tokens = createAuthTokens(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      user_type: user.user_type,
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
      avatar_url: user.avatar_url,
      active_notification: user.active_notification,
    },
    ...tokens,
  };
}

export async function resetPassword(email, newPassword) {
  const knex = getKnex();
  const passwordHash = await bcrypt.hash(newPassword, 12);
  const updated = await knex('users')
    .where({ email })
    .whereNull('deleted_at')
    .update({
      password_hash: passwordHash,
      token_version: knex.raw('token_version + 1'),
      updated_at: new Date().toISOString(),
    });

  if (!updated) {
    const error = new Error('E-mail não cadastrado.');
    error.statusCode = 404;
    throw error;
  }

  return { message: 'Senha alterada com sucesso. Entre com sua nova senha.' };
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

export async function changePasswordWithSession(userId, newPassword, email, sessionVersion) {
  const knex = getKnex();
  const user = await knex('users')
    .where({ id: userId })
    .whereNull('deleted_at')
    .first('id', 'email', 'full_name', 'user_type', 'token_version');

  if (!user) {
    const error = new Error('Usuário não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  if (email && email !== user.email.toLowerCase()) {
    const error = new Error('O e-mail informado não corresponde à sessão atual.');
    error.statusCode = 403;
    throw error;
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  const tokenVersion = sessionVersion + 1;
  const updated = await knex('users')
    .where({ id: user.id, token_version: sessionVersion })
    .whereNull('deleted_at')
    .update({
      password_hash: passwordHash,
      token_version: tokenVersion,
      updated_at: new Date().toISOString(),
    });

  if (!updated) {
    const error = new Error('Sessão encerrada. Entre novamente.');
    error.statusCode = 401;
    throw error;
  }

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
