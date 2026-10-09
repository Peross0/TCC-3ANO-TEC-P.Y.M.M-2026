import assert from 'node:assert/strict';

const baseUrl = 'http://localhost:3000/api';

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'content-type': 'application/json',
      ...(options.token ? { authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return { status: response.status, data };
}

const login = await request('/auth/login', {
  method: 'POST',
  body: { email: 'recruiter@test.com', password: 'Senha123!' },
});

assert.equal(login.status, 200, 'login do recrutador falhou');
const token = login.data.token;

const activeEditAttempt = await request('/recruiters/vacancies/1', {
  method: 'PUT',
  token,
  body: { job_title: 'Titulo alterado indevidamente' },
});

assert.equal(
  activeEditAttempt.status,
  409,
  `esperado bloqueio de edição em vaga ativa, mas recebeu ${activeEditAttempt.status}: ${JSON.stringify(activeEditAttempt.data)}`,
);

const deactivate = await request('/recruiters/vacancies/1', {
  method: 'PUT',
  token,
  body: { status: 'CLOSED' },
});

assert.equal(deactivate.status, 200, `esperado desativar vaga com sucesso, mas recebeu ${deactivate.status}: ${JSON.stringify(deactivate.data)}`);

const inactiveEdit = await request('/recruiters/vacancies/1', {
  method: 'PUT',
  token,
  body: { job_title: 'Titulo alterado apos inativar' },
});

assert.equal(inactiveEdit.status, 200, `esperado editar vaga inativa com sucesso, mas recebeu ${inactiveEdit.status}: ${JSON.stringify(inactiveEdit.data)}`);

console.log('vacancy-status-regression OK');
