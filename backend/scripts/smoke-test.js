import bcrypt from 'bcryptjs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

const baseUrl = process.env.API_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(options.token ? { authorization: `Bearer ${options.token}` } : {}),
      ...options.headers,
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : options.body,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = await response.text();
  }

  return { status: response.status, data };
}

function expectStatus(result, expected, label) {
  assert.equal(result.status, expected, `${label}: expected ${expected}, got ${result.status}: ${JSON.stringify(result.data)}`);
}

const health = await request('/health');
expectStatus(health, 200, 'health');

const adminLogin = await request('/api/auth/login', {
  method: 'POST',
  body: { email: 'admin@admin.com', password: 'Senha123!' },
});
expectStatus(adminLogin, 200, 'admin login');

const invalidLogin = await request('/api/auth/login', {
  method: 'POST',
  body: { email: 'candidate@test.com', password: 'senha-incorreta' },
});
expectStatus(invalidLogin, 401, 'invalid login credentials');
assert.equal(invalidLogin.data.message, 'Credenciais inválidas');

const recruiterLogin = await request('/api/auth/login', {
  method: 'POST',
  body: { email: 'recruiter@test.com', password: 'Senha123!' },
});
expectStatus(recruiterLogin, 200, 'recruiter login');

const candidateLogin = await request('/api/auth/login', {
  method: 'POST',
  body: { email: 'candidate@test.com', password: 'Senha123!' },
});
expectStatus(candidateLogin, 200, 'candidate login');

let candidateToken = candidateLogin.data.token;
const recruiterToken = recruiterLogin.data.token;
const adminToken = adminLogin.data.token;
const candidateId = candidateLogin.data.user.id;

const initialCandidateMessages = await request('/api/messages', { token: candidateToken });
expectStatus(initialCandidateMessages, 200, 'candidate messages before applying');
assert.ok(!initialCandidateMessages.data.conversations.some((item) => item.job_title === 'Desenvolvedor Frontend' && item.company_name === 'StartupXYZ'));
assert.ok(!initialCandidateMessages.data.conversations.some((item) => item.job_title === 'Vaga de smoke para status'));

const candidateMe = await request('/api/auth/me', { token: candidateToken });
expectStatus(candidateMe, 200, 'candidate session validation');
assert.equal(candidateMe.data.user.id, candidateId);

const defaultPreferences = await request('/api/users/me/preferences', { token: candidateToken });
expectStatus(defaultPreferences, 200, 'candidate preferences');
const updatedPreferences = await request('/api/users/me/preferences', {
  method: 'PUT',
  token: candidateToken,
  body: {
    theme: 'dark',
    preferred_sector: 'Tecnologia',
    preferred_location: 'São Paulo',
    preferred_work_model: 'REMOTE',
    preferred_contract_type: 'INTERNSHIP',
  },
});
expectStatus(updatedPreferences, 200, 'candidate job preferences update');
assert.equal(updatedPreferences.data.preferences.theme, 'dark');
assert.equal(updatedPreferences.data.preferences.preferred_sector, 'Tecnologia');
assert.equal(updatedPreferences.data.preferences.preferred_location, 'São Paulo');
assert.equal(updatedPreferences.data.preferences.preferred_work_model, 'REMOTE');
assert.equal(updatedPreferences.data.preferences.preferred_contract_type, 'INTERNSHIP');
const preferenceReset = await request('/api/users/me/preferences', {
  method: 'PUT',
  token: candidateToken,
  body: {
    theme: 'system',
    preferred_sector: null,
    preferred_location: null,
    preferred_work_model: null,
    preferred_contract_type: null,
  },
});
expectStatus(preferenceReset, 200, 'candidate preferences cleanup');

const setupDb = new DatabaseSync('./data/conectafacil.db');
setupDb.prepare('DELETE FROM users WHERE email = ?').run('second-recruiter@smoke.test');
const secondPasswordHash = await bcrypt.hash('Senha123!', 12);
setupDb.prepare(`
  INSERT INTO users (
    email, password_hash, full_name, user_type, document_type, document_number,
    verified_email, active_notification, created_at, updated_at
  ) VALUES (?, ?, ?, 'RECRUITER', 'CNPJ', ?, 1, 1, ?, ?)
`).run(
  'second-recruiter@smoke.test',
  secondPasswordHash,
  'Segundo Recrutador Smoke',
  '99887766000100',
  new Date().toISOString(),
  new Date().toISOString(),
);
setupDb.close();

const secondRecruiterLogin = await request('/api/auth/login', {
  method: 'POST',
  body: { email: 'second-recruiter@smoke.test', password: 'Senha123!' },
});
expectStatus(secondRecruiterLogin, 200, 'second recruiter login');
const secondRecruiterToken = secondRecruiterLogin.data.token;

const testVacancy = await request('/api/recruiters/vacancies', {
  method: 'POST',
  token: recruiterToken,
  body: {
    job_title: 'Vaga de smoke para status',
    company_name: 'TechCorp',
    company_description: 'Empresa de tecnologia de teste do sistema.',
    company_sector: 'Tecnologia',
    job_description: 'Vaga temporária para validar o ciclo de status no smoke test.',
    location: 'São Paulo - SP',
    work_model: 'HYBRID',
    contract_type: 'CLT',
    salary_min: 5000,
    salary_max: 7000,
  },
});
expectStatus(testVacancy, 201, 'test vacancy creation');
const vacancyId = testVacancy.data.vacancy.id;

const combinedVacancyFilters = await request(
  '/api/candidates/vacancies?q=smoke&company_sector=Tecnologia&location=S%C3%A3o%20Paulo&work_model=HYBRID&contract_type=CLT',
  { token: candidateToken },
);
expectStatus(combinedVacancyFilters, 200, 'combined vacancy filters');
assert.ok(combinedVacancyFilters.data.vacancies.some((vacancy) => vacancy.id === vacancyId));
const conflictingVacancyFilters = await request(
  '/api/candidates/vacancies?q=smoke&company_sector=Tecnologia&location=S%C3%A3o%20Paulo&work_model=REMOTE&contract_type=CLT',
  { token: candidateToken },
);
expectStatus(conflictingVacancyFilters, 200, 'combined vacancy filters with no match');
assert.ok(!conflictingVacancyFilters.data.vacancies.some((vacancy) => vacancy.id === vacancyId));

const savedVacancy = await request(`/api/candidates/vacancies/${vacancyId}/favorite`, {
  method: 'PUT',
  token: candidateToken,
  body: {},
});
expectStatus(savedVacancy, 201, 'candidate saves vacancy');
const duplicateSavedVacancy = await request(`/api/candidates/vacancies/${vacancyId}/favorite`, {
  method: 'PUT',
  token: candidateToken,
  body: {},
});
expectStatus(duplicateSavedVacancy, 201, 'duplicate favorite remains idempotent');
const recruiterFavorites = await request('/api/candidates/favorites', { token: recruiterToken });
expectStatus(recruiterFavorites, 403, 'recruiter cannot list candidate favorites');
const candidateRelogin = await request('/api/auth/login', {
  method: 'POST',
  body: { email: 'candidate@test.com', password: 'Senha123!' },
});
expectStatus(candidateRelogin, 200, 'candidate relogin before favorite persistence check');
candidateToken = candidateRelogin.data.token;
const persistedFavorites = await request('/api/candidates/favorites', { token: candidateToken });
expectStatus(persistedFavorites, 200, 'candidate favorites persist across sessions');
assert.equal(persistedFavorites.data.favorites.filter((vacancy) => vacancy.id === vacancyId).length, 1);
const removedFavorite = await request(`/api/candidates/vacancies/${vacancyId}/favorite`, {
  method: 'DELETE',
  token: candidateToken,
});
expectStatus(removedFavorite, 200, 'candidate removes saved vacancy');
const favoritesAfterRemoval = await request('/api/candidates/favorites', { token: candidateToken });
assert.ok(!favoritesAfterRemoval.data.favorites.some((vacancy) => vacancy.id === vacancyId));

const activeVacancyEdit = await request(`/api/recruiters/vacancies/${vacancyId}`, {
  method: 'PUT',
  token: recruiterToken,
  body: { benefits: 'Vale refeicao atualizado antes da inativacao' },
});
expectStatus(activeVacancyEdit, 409, 'active vacancy edit blocked');

const firstApplication = await request(`/api/candidates/vacancies/${vacancyId}/apply`, {
  method: 'POST',
  token: candidateToken,
  body: {},
});
expectStatus(firstApplication, 201, 'candidate applies to test vacancy');

const duplicateApplication = await request(`/api/candidates/vacancies/${vacancyId}/apply`, {
  method: 'POST',
  token: candidateToken,
  body: {},
});
expectStatus(duplicateApplication, 409, 'duplicate application');

const wrongRole = await request('/api/recruiters/profile', { token: candidateToken });
expectStatus(wrongRole, 403, 'wrong role');

const candidateCreatesVacancy = await request('/api/recruiters/vacancies', {
  method: 'POST',
  token: candidateToken,
  body: {},
});
expectStatus(candidateCreatesVacancy, 403, 'candidate creates vacancy');

const recruiterApplies = await request('/api/candidates/vacancies/1/apply', {
  method: 'POST',
  token: recruiterToken,
  body: {},
});
expectStatus(recruiterApplies, 403, 'recruiter applies to vacancy');

const otherRecruiterUpdate = await request(`/api/recruiters/vacancies/${vacancyId}`, {
  method: 'PUT',
  token: secondRecruiterToken,
  body: { benefits: 'Tentativa indevida' },
});
expectStatus(otherRecruiterUpdate, 403, 'other recruiter vacancy update');

const invalidAvatarBody = new FormData();
invalidAvatarBody.append('avatar', new Blob(['not an image'], { type: 'text/plain' }), 'avatar.txt');
const invalidAvatar = await fetch(`${baseUrl}/api/users/me/avatar`, {
  method: 'POST',
  headers: { authorization: `Bearer ${candidateToken}` },
  body: invalidAvatarBody,
});
assert.equal(invalidAvatar.status, 400, `invalid avatar: expected 400, got ${invalidAvatar.status}`);

const oversizedAvatarBody = new FormData();
oversizedAvatarBody.append('avatar', new Blob([new Uint8Array(3 * 1024 * 1024)], { type: 'image/png' }), 'large.png');
const oversizedAvatar = await fetch(`${baseUrl}/api/users/me/avatar`, {
  method: 'POST',
  headers: { authorization: `Bearer ${candidateToken}` },
  body: oversizedAvatarBody,
});
assert.equal(oversizedAvatar.status, 400, `oversized avatar: expected 400, got ${oversizedAvatar.status}`);

const invalidJwt = await request('/api/auth/me', { token: 'invalid.jwt.token' });
expectStatus(invalidJwt, 401, 'invalid JWT');

const invalidStatus = await request(`/api/recruiters/vacancies/${vacancyId}/candidates/${candidateId}/status`, {
  method: 'PATCH',
  token: recruiterToken,
  body: { status: 'INVALID' },
});
expectStatus(invalidStatus, 400, 'invalid application status');

const deactivateVacancy = await request(`/api/recruiters/vacancies/${vacancyId}`, {
  method: 'PUT',
  token: recruiterToken,
  body: { status: 'CLOSED' },
});
expectStatus(deactivateVacancy, 200, 'vacancy deactivation');

const vacancyUpdate = await request(`/api/recruiters/vacancies/${vacancyId}`, {
  method: 'PUT',
  token: recruiterToken,
  body: { benefits: 'Vale refeicao atualizado após inativar' },
});
expectStatus(vacancyUpdate, 200, 'vacancy update after deactivation');

const vacancies = await request('/api/candidates/vacancies', { token: candidateToken });
expectStatus(vacancies, 200, 'candidate vacancy list');
assert.ok(!vacancies.data.vacancies.some((vacancy) => vacancy.id === vacancyId), 'inactive vacancy should not be visible to candidates');

const companies = await request('/api/candidates/companies', { token: candidateToken });
expectStatus(companies, 200, 'candidate company list');
const smokeCompany = companies.data.companies.find((company) => company.id === testVacancy.data.vacancy.user_id);
assert.equal(smokeCompany?.company_name, 'TechCorp', 'company list should include companies with inactive vacancies');
assert.equal(smokeCompany?.company_description, 'Empresa de tecnologia de teste do sistema.');
assert.ok(!('email' in smokeCompany) && !('phone' in smokeCompany), 'company list should not expose recruiter contact details');

const invalidCpf = await request('/api/auth/register', {
  method: 'POST',
  body: {
    email: `invalid-cpf-${Date.now()}@test.com`,
    password: 'Senha123!',
    full_name: 'Cadastro Invalido',
    user_type: 'CANDIDATE',
    document_type: 'CPF',
    document_number: '11111111111',
  },
});
expectStatus(invalidCpf, 400, 'invalid CPF');

const recruiterCandidates = await request(`/api/recruiters/vacancies/${vacancyId}/candidates`, {
  token: recruiterToken,
});
expectStatus(recruiterCandidates, 200, 'recruiter candidate list');
assert.ok(recruiterCandidates.data.candidates.some((candidate) => candidate.candidate_id === candidateId));

const applications = await request('/api/candidates/applications', { token: candidateToken });
expectStatus(applications, 200, 'candidate applications');
assert.ok(applications.data.applications.some((application) => application.vacancy_id === vacancyId));

const application = applications.data.applications.find((item) => item.vacancy_id === vacancyId);
const candidateMessage = await request('/api/messages', {
  method: 'POST',
  token: candidateToken,
  body: { application_id: application.id, body: 'Olá, tenho interesse nesta oportunidade.' },
});
expectStatus(candidateMessage, 201, 'candidate sends message');

const recruiterMessages = await request('/api/messages', { token: recruiterToken });
expectStatus(recruiterMessages, 200, 'recruiter reads messages');
assert.ok(recruiterMessages.data.messages.some((message) => message.id === candidateMessage.data.message.id));
const recruiterConversation = recruiterMessages.data.conversations.find((item) => item.application_id === application.id);
assert.ok(recruiterConversation);
assert.equal(recruiterConversation.company_name, 'TechCorp', 'conversation should include the business name for mobile');

const unrelatedRecruiterMessage = await request('/api/messages', {
  method: 'POST',
  token: secondRecruiterToken,
  body: { application_id: application.id, body: 'Mensagem não autorizada' },
});
expectStatus(unrelatedRecruiterMessage, 403, 'unrelated recruiter cannot message');

const cleanupMessages = new DatabaseSync('./data/conectafacil.db');
cleanupMessages.prepare('DELETE FROM messages WHERE id = ?').run(candidateMessage.data.message.id);
cleanupMessages.close();

const forgot = await request('/api/auth/forgot-password', {
  method: 'POST',
  body: { email: 'candidate@test.com' },
});
expectStatus(forgot, 200, 'forgot password');
const forgotUnknown = await request('/api/auth/forgot-password', {
  method: 'POST',
  body: { email: 'unknown-reset@test.com' },
});
expectStatus(forgotUnknown, 200, 'forgot password for unknown address');
assert.equal(forgot.data.message, forgotUnknown.data.message, 'reset request response must not disclose account existence');

const db = new DatabaseSync('./data/conectafacil.db');
const resetRequest = db.prepare('SELECT id, code_hash FROM password_reset_requests WHERE user_id = ? ORDER BY requested_at DESC LIMIT 1').get(candidateId);
assert.ok(resetRequest, 'password reset token should be persisted');
assert.ok(resetRequest.code_hash.startsWith('$2'), 'only the bcrypt code hash should be persisted');
db.prepare('UPDATE password_reset_requests SET code_hash = ? WHERE id = ?')
  .run(await bcrypt.hash('742981', 12), resetRequest.id);
db.close();

const invalidReset = await request('/api/auth/reset-password', {
  method: 'POST',
  body: { email: 'candidate@test.com', code: '000000', password: 'SenhaNova123!' },
});
expectStatus(invalidReset, 400, 'invalid password reset code');

const reset = await request('/api/auth/reset-password', {
  method: 'POST',
  body: { email: 'candidate@test.com', code: '742981', password: 'SenhaNova123!' },
});
expectStatus(reset, 200, 'reset password');

const resetReuse = await request('/api/auth/reset-password', {
  method: 'POST',
  body: { email: 'candidate@test.com', code: '742981', password: 'SenhaNova123!' },
});
expectStatus(resetReuse, 400, 'password reset code cannot be reused');
expectStatus(await request('/api/auth/me', { token: candidateToken }), 401, 'password reset revokes old session');

const resetLogin = await request('/api/auth/login', {
  method: 'POST',
  body: { email: 'candidate@test.com', password: 'SenhaNova123!' },
});
expectStatus(resetLogin, 200, 'login with reset password');
candidateToken = resetLogin.data.token;

const changedPassword = await request('/api/auth/change-password', {
  method: 'POST',
  token: candidateToken,
  body: { current_password: 'SenhaNova123!', new_password: 'SenhaNova456!' },
});
expectStatus(changedPassword, 200, 'authenticated password change');
expectStatus(await request('/api/auth/me', { token: candidateToken }), 401, 'password change revokes old session');
expectStatus(await request('/api/auth/me', { token: changedPassword.data.token }), 200, 'password change returns rotated session');

const resetCleanup = new DatabaseSync('./data/conectafacil.db');
resetCleanup.prepare('DELETE FROM password_reset_requests WHERE user_id = ?').run(candidateId);
resetCleanup.prepare('DELETE FROM password_reset_attempts WHERE email_hash = ?')
  .run(createHash('sha256').update('candidate@test.com').digest('hex'));
resetCleanup.prepare('UPDATE users SET password_hash = ?, token_version = 0 WHERE id = ?')
  .run(await bcrypt.hash('Senha123!', 12), candidateId);
resetCleanup.close();

const linkedDb = new DatabaseSync('./data/conectafacil.db');
const linkedUser = linkedDb.prepare('SELECT user_id FROM vacancies LIMIT 1').get();
linkedDb.close();

const linkedUserDelete = await request(`/api/admin/users/${linkedUser.user_id}`, {
  method: 'DELETE',
  token: adminToken,
});
expectStatus(linkedUserDelete, 409, 'linked user delete');

const cleanupDb = new DatabaseSync('./data/conectafacil.db');
cleanupDb.prepare('DELETE FROM messages WHERE application_id IN (SELECT id FROM interests WHERE vacancy_id = ?)').run(vacancyId);
  cleanupDb.prepare('DELETE FROM saved_vacancies WHERE vacancy_id = ?').run(vacancyId);
cleanupDb.prepare('DELETE FROM interests WHERE vacancy_id = ?').run(vacancyId);
cleanupDb.prepare('DELETE FROM vacancies WHERE id = ?').run(vacancyId);
cleanupDb.prepare('DELETE FROM users WHERE email = ?').run('second-recruiter@smoke.test');
cleanupDb.close();

console.log('Smoke tests passed.');