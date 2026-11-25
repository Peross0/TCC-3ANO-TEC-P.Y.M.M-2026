import assert from 'node:assert/strict';

process.env.NODE_ENV = 'production';
const { default: config } = await import('../knexfile.js');
config.connection.filename = ':memory:';
const { getKnex, closeKnex } = await import('../src/config/database.js');
const { createApp } = await import('../src/app.js');
const db = getKnex();
await db.migrate.latest();
const server = createApp().listen(0, '127.0.0.1');
await new Promise((resolve) => server.once('listening', resolve));
const baseUrl = `http://127.0.0.1:${server.address().port}/api`;

async function request(path, { body, token, method = 'GET' } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, data: await response.json() };
}

try {
  const recruiter = {
    email: 'recruiter@example.com', password: 'senha123', full_name: 'Responsável',
    user_type: 'RECRUITER', document_type: 'CNPJ', document_number: '11222333000181',
    company_name: 'Empresa Exemplo', phone: '11999999999',
  };
  const registered = await request('/auth/register', { method: 'POST', body: recruiter });
  assert.equal(registered.status, 201);
  assert.equal(registered.data.user.user_type, 'RECRUITER');
  const profile = await request('/recruiters/profile', { token: registered.data.token });
  assert.equal(profile.status, 200);
  assert.equal(profile.data.recruiter.company_name, recruiter.company_name);
  assert.equal(profile.data.recruiter.phone, recruiter.phone);
  const login = await request('/auth/login', { method: 'POST', body: { email: recruiter.email, password: recruiter.password } });
  assert.equal(login.status, 200);
  assert.equal(login.data.user.user_type, 'RECRUITER');
  assert.equal((await request('/auth/login', { method: 'POST', body: { email: recruiter.email, password: 'incorreta' } })).status, 401);
  assert.equal((await request('/recruiters/profile')).status, 401);
  const invalidCnpj = await request('/auth/register', { method: 'POST', body: {
    ...recruiter, email: 'invalid@example.com', document_number: '11222333000180',
  } });
  assert.equal(invalidCnpj.status, 400);
  const alphanumericCnpj = await request('/auth/register', { method: 'POST', body: {
    ...recruiter, email: 'alphanumeric@example.com', document_number: '12ABC34501DE35',
  } });
  assert.equal(alphanumericCnpj.status, 201);
  const candidate = await request('/auth/register', { method: 'POST', body: {
    email: 'candidate@example.com', password: 'senha123', full_name: 'Pessoa Teste',
    user_type: 'CANDIDATE', document_type: 'CPF', document_number: '16899535009',
  } });
  assert.equal(candidate.status, 201);
  assert.equal((await request('/recruiters/profile', { token: candidate.data.token })).status, 403);
  const legacyRecruiter = await request('/auth/register', { method: 'POST', body: {
    ...recruiter, email: 'legacy@example.com', document_number: '12345678000195', company_name: undefined,
  } });
  assert.equal(legacyRecruiter.status, 201);
  assert.equal((await request('/auth/reset-password', { method: 'POST', body: {
    email: recruiter.email, new_password: 'novasenha', confirm_password: 'novasenha',
  } })).status, 404);
  console.log('Cadastro, login, permissões e compatibilidade: OK');
} finally {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await closeKnex();
}