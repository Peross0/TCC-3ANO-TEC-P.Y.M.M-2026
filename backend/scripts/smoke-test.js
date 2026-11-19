import bcrypt from "bcryptjs";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";

const baseUrl = process.env.API_URL || "http://localhost:3000";
const databasePath = process.env.DATABASE_PATH || "./data/conectafacil.db";

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      ...(options.body ? { "content-type": "application/json" } : {}),
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
  assert.equal(
    result.status,
    expected,
    `${label}: expected ${expected}, got ${result.status}: ${JSON.stringify(result.data)}`,
  );
}

const health = await request("/health");
expectStatus(health, 200, "health");

const adminLogin = await request("/api/auth/login", {
  method: "POST",
  body: { email: "admin@admin.com", password: "Senha123!" },
});
expectStatus(adminLogin, 200, "admin login");

const invalidLogin = await request("/api/auth/login", {
  method: "POST",
  body: { email: "candidate@test.com", password: "senha-incorreta" },
});
expectStatus(invalidLogin, 401, "invalid login credentials");
assert.equal(invalidLogin.data.message, "Credenciais inválidas");

const recruiterLogin = await request("/api/auth/login", {
  method: "POST",
  body: { email: "recruiter@test.com", password: "Senha123!" },
});
expectStatus(recruiterLogin, 200, "recruiter login");

const candidateLogin = await request("/api/auth/login", {
  method: "POST",
  body: { email: "candidate@test.com", password: "Senha123!" },
});
expectStatus(candidateLogin, 200, "candidate login");

let candidateToken = candidateLogin.data.token;
const recruiterToken = recruiterLogin.data.token;
const adminToken = adminLogin.data.token;
const candidateId = candidateLogin.data.user.id;

const registeredEmail = `candidate-${Date.now()}@smoke.test`;
const registered = await request("/api/auth/register", {
  method: "POST",
  body: {
    email: registeredEmail,
    password: "Senha123!",
    full_name: "Cadastro Smoke",
    user_type: "CANDIDATE",
    document_type: "CPF",
    document_number: "16899535009",
  },
});
expectStatus(registered, 201, "registration without code verification");
expectStatus(
  await request("/api/auth/me", { token: registered.data.token }),
  200,
  "registration returns active session",
);
const registeredLogin = await request("/api/auth/login", {
  method: "POST",
  body: { email: registeredEmail, password: "Senha123!" },
});
expectStatus(registeredLogin, 200, "login after registration");
const registeredCandidateCompanies = await request(
  "/api/candidates/companies",
  {
    token: registeredLogin.data.token,
  },
);
expectStatus(registeredCandidateCompanies, 200, "new candidate company list");
assert.equal(
  registeredCandidateCompanies.data.companies.length,
  0,
  "candidate cannot see companies from another candidate's interests",
);

const initialCandidateMessages = await request("/api/messages", {
  token: candidateToken,
});
expectStatus(
  initialCandidateMessages,
  200,
  "candidate messages before applying",
);
assert.ok(
  !initialCandidateMessages.data.conversations.some(
    (item) =>
      item.job_title === "Desenvolvedor Frontend" &&
      item.company_name === "StartupXYZ",
  ),
);
assert.ok(
  !initialCandidateMessages.data.conversations.some(
    (item) => item.job_title === "Vaga de smoke para status",
  ),
);

const candidateMe = await request("/api/auth/me", { token: candidateToken });
expectStatus(candidateMe, 200, "candidate session validation");
assert.equal(candidateMe.data.user.id, candidateId);

const defaultPreferences = await request("/api/users/me/preferences", {
  token: candidateToken,
});
expectStatus(defaultPreferences, 200, "candidate preferences");
const updatedPreferences = await request("/api/users/me/preferences", {
  method: "PUT",
  token: candidateToken,
  body: {
    theme: "dark",
    preferred_sector: "Tecnologia",
    preferred_location: "São Paulo",
    preferred_work_model: "REMOTE",
    preferred_contract_type: "INTERNSHIP",
    color_vision_mode: "protanopia",
  },
});
expectStatus(updatedPreferences, 200, "candidate job preferences update");
assert.equal(updatedPreferences.data.preferences.theme, "dark");
assert.equal(
  updatedPreferences.data.preferences.preferred_sector,
  "Tecnologia",
);
assert.equal(
  updatedPreferences.data.preferences.preferred_location,
  "São Paulo",
);
assert.equal(
  updatedPreferences.data.preferences.preferred_work_model,
  "REMOTE",
);
assert.equal(
  updatedPreferences.data.preferences.preferred_contract_type,
  "INTERNSHIP",
);
assert.equal(
  updatedPreferences.data.preferences.color_vision_mode,
  "protanopia",
);
for (const mode of ["protanopia", "deuteranopia", "tritanopia", "none"]) {
  const colorVisionPreference = await request("/api/users/me/preferences", {
    method: "PUT",
    token: candidateToken,
    body: { color_vision_mode: mode },
  });
  expectStatus(colorVisionPreference, 200, `${mode} color vision preference`);
  assert.equal(colorVisionPreference.data.preferences.color_vision_mode, mode);
}
const preferenceReset = await request("/api/users/me/preferences", {
  method: "PUT",
  token: candidateToken,
  body: {
    theme: "system",
    preferred_sector: null,
    preferred_location: null,
    preferred_work_model: null,
    preferred_contract_type: null,
    color_vision_mode: "none",
  },
});
expectStatus(preferenceReset, 200, "candidate preferences cleanup");

const setupDb = new DatabaseSync(databasePath);
setupDb
  .prepare("DELETE FROM users WHERE email = ?")
  .run("second-recruiter@smoke.test");
const secondPasswordHash = await bcrypt.hash("Senha123!", 12);
setupDb
  .prepare(
    `
  INSERT INTO users (
    email, password_hash, full_name, user_type, document_type, document_number,
    active_notification, created_at, updated_at
  ) VALUES (?, ?, ?, 'RECRUITER', 'CNPJ', ?, 1, ?, ?)
`,
  )
  .run(
    "second-recruiter@smoke.test",
    secondPasswordHash,
    "Segundo Recrutador Smoke",
    "99887766000100",
    new Date().toISOString(),
    new Date().toISOString(),
  );
setupDb.close();

const secondRecruiterLogin = await request("/api/auth/login", {
  method: "POST",
  body: { email: "second-recruiter@smoke.test", password: "Senha123!" },
});
expectStatus(secondRecruiterLogin, 200, "second recruiter login");
const secondRecruiterToken = secondRecruiterLogin.data.token;

const testVacancy = await request("/api/recruiters/vacancies", {
  method: "POST",
  token: recruiterToken,
  body: {
    job_title: "Vaga de smoke para status",
    company_name: "TechCorp",
    company_description: "Empresa de tecnologia de teste do sistema.",
    company_sector: "Tecnologia",
    job_description:
      "Vaga temporária para validar o ciclo de status no smoke test.",
    location: "São Paulo - SP",
    work_model: "HYBRID",
    contract_type: "CLT",
    salary_min: 5000,
    salary_max: 7000,
  },
});
expectStatus(testVacancy, 201, "test vacancy creation");
const vacancyId = testVacancy.data.vacancy.id;

const combinedVacancyFilters = await request(
  "/api/candidates/vacancies?q=smoke&company_sector=Tecnologia&location=S%C3%A3o%20Paulo&work_model=HYBRID&contract_type=CLT",
  { token: candidateToken },
);
expectStatus(combinedVacancyFilters, 200, "combined vacancy filters");
assert.ok(
  combinedVacancyFilters.data.vacancies.some(
    (vacancy) => vacancy.id === vacancyId,
  ),
);
const conflictingVacancyFilters = await request(
  "/api/candidates/vacancies?q=smoke&company_sector=Tecnologia&location=S%C3%A3o%20Paulo&work_model=REMOTE&contract_type=CLT",
  { token: candidateToken },
);
expectStatus(
  conflictingVacancyFilters,
  200,
  "combined vacancy filters with no match",
);
assert.ok(
  !conflictingVacancyFilters.data.vacancies.some(
    (vacancy) => vacancy.id === vacancyId,
  ),
);

const advancedVacancy = await request("/api/recruiters/vacancies", {
  method: "POST",
  token: recruiterToken,
  body: {
    job_title: "Vaga avançada smoke",
    company_name: "TechCorp",
    company_description: "Empresa de tecnologia de teste do sistema.",
    company_sector: "Dados",
    job_description:
      "Oportunidade de teste para validar todos os filtros avançados.",
    requirements: "Conhecimento inicial em análise de dados.",
    location: "Campinas - SP",
    work_model: "REMOTE",
    contract_type: "TEMPORARY",
    experience_level: "FIRST_JOB",
    work_schedule: "PART_TIME",
    salary_min: 5000,
    salary_max: 6500,
  },
});
expectStatus(advancedVacancy, 201, "advanced vacancy creation");
const advancedVacancyId = advancedVacancy.data.vacancy.id;
assert.equal(advancedVacancy.data.vacancy.contract_type, "TEMPORARY");

const applyToAdvancedVacancy = await request(
  `/api/candidates/vacancies/${advancedVacancyId}/apply`,
  { method: "POST", token: candidateToken, body: {} },
);
expectStatus(
  applyToAdvancedVacancy,
  201,
  "candidate applies to advanced vacancy",
);
assert.ok(applyToAdvancedVacancy.data.application.id);

const allAdvancedFilters = await request(
  "/api/candidates/vacancies?work_models=HYBRID,REMOTE&contract_types=APPRENTICE,TEMPORARY&experience_levels=FIRST_JOB,NO_EXPERIENCE&work_schedules=PART_TIME,FULL_TIME&salary_min=4500&salary_max=7000&city=Campinas&state=SP&company_sector=Dados",
  { token: candidateToken },
);
expectStatus(allAdvancedFilters, 200, "all advanced vacancy filters");
assert.ok(
  allAdvancedFilters.data.vacancies.some(
    (vacancy) => vacancy.id === advancedVacancyId,
  ),
);
const advancedFiltersWithoutLocationMatch = await request(
  "/api/candidates/vacancies?contract_types=TEMPORARY&state=RJ",
  { token: candidateToken },
);
expectStatus(
  advancedFiltersWithoutLocationMatch,
  200,
  "advanced filters with no location match",
);
assert.ok(
  !advancedFiltersWithoutLocationMatch.data.vacancies.some(
    (vacancy) => vacancy.id === advancedVacancyId,
  ),
);

const savedVacancy = await request(
  `/api/candidates/vacancies/${vacancyId}/favorite`,
  {
    method: "PUT",
    token: candidateToken,
    body: {},
  },
);
expectStatus(savedVacancy, 201, "candidate saves vacancy");
const duplicateSavedVacancy = await request(
  `/api/candidates/vacancies/${vacancyId}/favorite`,
  {
    method: "PUT",
    token: candidateToken,
    body: {},
  },
);
expectStatus(
  duplicateSavedVacancy,
  201,
  "duplicate favorite remains idempotent",
);
const recruiterFavorites = await request("/api/candidates/favorites", {
  token: recruiterToken,
});
expectStatus(
  recruiterFavorites,
  403,
  "recruiter cannot list candidate favorites",
);
const candidateRelogin = await request("/api/auth/login", {
  method: "POST",
  body: { email: "candidate@test.com", password: "Senha123!" },
});
expectStatus(
  candidateRelogin,
  200,
  "candidate relogin before favorite persistence check",
);
candidateToken = candidateRelogin.data.token;
const persistedFavorites = await request("/api/candidates/favorites", {
  token: candidateToken,
});
expectStatus(
  persistedFavorites,
  200,
  "candidate favorites persist across sessions",
);
assert.equal(
  persistedFavorites.data.favorites.filter(
    (vacancy) => vacancy.id === vacancyId,
  ).length,
  1,
);
const removedFavorite = await request(
  `/api/candidates/vacancies/${vacancyId}/favorite`,
  {
    method: "DELETE",
    token: candidateToken,
  },
);
expectStatus(removedFavorite, 200, "candidate removes saved vacancy");
const favoritesAfterRemoval = await request("/api/candidates/favorites", {
  token: candidateToken,
});
assert.ok(
  !favoritesAfterRemoval.data.favorites.some(
    (vacancy) => vacancy.id === vacancyId,
  ),
);

const activeVacancyEdit = await request(
  `/api/recruiters/vacancies/${vacancyId}`,
  {
    method: "PUT",
    token: recruiterToken,
    body: { benefits: "Vale refeicao atualizado antes da inativacao" },
  },
);
expectStatus(activeVacancyEdit, 409, "active vacancy edit blocked");

const firstApplication = await request(
  `/api/candidates/vacancies/${vacancyId}/apply`,
  {
    method: "POST",
    token: candidateToken,
    body: {},
  },
);
expectStatus(firstApplication, 201, "candidate applies to test vacancy");

const interestedCompanies = await request("/api/candidates/companies", {
  token: candidateToken,
});
expectStatus(interestedCompanies, 200, "candidate lists interested companies");
const techCorpInterest = interestedCompanies.data.companies.find(
  (company) => company.company_name === "TechCorp",
);
assert.ok(
  techCorpInterest,
  "company appears after the candidate expresses interest",
);
assert.equal(
  interestedCompanies.data.companies.filter(
    (company) => company.company_name.toLocaleLowerCase("pt-BR") === "techcorp",
  ).length,
  1,
  "same company should be listed once",
);
assert.ok(
  techCorpInterest.applications.some(
    (application) => application.vacancy_id === vacancyId,
  ),
  "company history includes the original vacancy",
);
assert.ok(
  techCorpInterest.applications.some(
    (application) => application.vacancy_id === advancedVacancyId,
  ),
  "company history includes the second vacancy",
);
assert.ok(
  techCorpInterest.applications.every(
    (application) =>
      application.interested_at && application.status === "PENDING",
  ),
  "company history includes application date and status",
);

const duplicateApplication = await request(
  `/api/candidates/vacancies/${vacancyId}/apply`,
  {
    method: "POST",
    token: candidateToken,
    body: {},
  },
);
expectStatus(duplicateApplication, 409, "duplicate application");
assert.equal(
  duplicateApplication.data.message,
  "Você já se candidatou a esta vaga",
  "duplicate application has a user-friendly message",
);

const wrongRole = await request("/api/recruiters/profile", {
  token: candidateToken,
});
expectStatus(wrongRole, 403, "wrong role");

const candidateCreatesVacancy = await request("/api/recruiters/vacancies", {
  method: "POST",
  token: candidateToken,
  body: {},
});
expectStatus(candidateCreatesVacancy, 403, "candidate creates vacancy");

const recruiterApplies = await request("/api/candidates/vacancies/1/apply", {
  method: "POST",
  token: recruiterToken,
  body: {},
});
expectStatus(recruiterApplies, 403, "recruiter applies to vacancy");

const otherRecruiterUpdate = await request(
  `/api/recruiters/vacancies/${vacancyId}`,
  {
    method: "PUT",
    token: secondRecruiterToken,
    body: { benefits: "Tentativa indevida" },
  },
);
expectStatus(otherRecruiterUpdate, 403, "other recruiter vacancy update");

const invalidAvatarBody = new FormData();
invalidAvatarBody.append(
  "avatar",
  new Blob(["not an image"], { type: "text/plain" }),
  "avatar.txt",
);
const invalidAvatar = await fetch(`${baseUrl}/api/users/me/avatar`, {
  method: "POST",
  headers: { authorization: `Bearer ${candidateToken}` },
  body: invalidAvatarBody,
});
assert.equal(
  invalidAvatar.status,
  400,
  `invalid avatar: expected 400, got ${invalidAvatar.status}`,
);

const oversizedAvatarBody = new FormData();
oversizedAvatarBody.append(
  "avatar",
  new Blob([new Uint8Array(3 * 1024 * 1024)], { type: "image/png" }),
  "large.png",
);
const oversizedAvatar = await fetch(`${baseUrl}/api/users/me/avatar`, {
  method: "POST",
  headers: { authorization: `Bearer ${candidateToken}` },
  body: oversizedAvatarBody,
});
assert.equal(
  oversizedAvatar.status,
  400,
  `oversized avatar: expected 400, got ${oversizedAvatar.status}`,
);

const invalidJwt = await request("/api/auth/me", {
  token: "invalid.jwt.token",
});
expectStatus(invalidJwt, 401, "invalid JWT");

const invalidStatus = await request(
  `/api/recruiters/vacancies/${vacancyId}/candidates/${candidateId}/status`,
  {
    method: "PATCH",
    token: recruiterToken,
    body: { status: "INVALID" },
  },
);
expectStatus(invalidStatus, 400, "invalid application status");

const deactivateVacancy = await request(
  `/api/recruiters/vacancies/${vacancyId}`,
  {
    method: "PUT",
    token: recruiterToken,
    body: { status: "CLOSED" },
  },
);
expectStatus(deactivateVacancy, 200, "vacancy deactivation");

const vacancyUpdate = await request(`/api/recruiters/vacancies/${vacancyId}`, {
  method: "PUT",
  token: recruiterToken,
  body: { benefits: "Vale refeicao atualizado após inativar" },
});
expectStatus(vacancyUpdate, 200, "vacancy update after deactivation");

const vacancies = await request("/api/candidates/vacancies", {
  token: candidateToken,
});
expectStatus(vacancies, 200, "candidate vacancy list");
assert.ok(
  !vacancies.data.vacancies.some((vacancy) => vacancy.id === vacancyId),
  "inactive vacancy should not be visible to candidates",
);

const companies = await request("/api/candidates/companies", {
  token: candidateToken,
});
expectStatus(companies, 200, "candidate company list");
const smokeCompany = companies.data.companies.find(
  (company) => company.company_name === "TechCorp",
);
assert.equal(
  smokeCompany?.company_name,
  "TechCorp",
  "interested company remains listed after its vacancy closes",
);
assert.equal(
  smokeCompany?.company_description,
  "Empresa de tecnologia de teste do sistema.",
);
assert.ok(
  smokeCompany?.applications.some(
    (application) => application.vacancy_id === vacancyId,
  ),
  "company history preserves the candidate's inactive vacancy interest",
);
assert.ok(
  !("email" in smokeCompany) && !("phone" in smokeCompany),
  "company list should not expose recruiter contact details",
);

const invalidCpf = await request("/api/auth/register", {
  method: "POST",
  body: {
    email: `invalid-cpf-${Date.now()}@test.com`,
    password: "Senha123!",
    full_name: "Cadastro Invalido",
    user_type: "CANDIDATE",
    document_type: "CPF",
    document_number: "11111111111",
  },
});
expectStatus(invalidCpf, 400, "invalid CPF");

const recruiterCandidates = await request(
  `/api/recruiters/vacancies/${vacancyId}/candidates`,
  {
    token: recruiterToken,
  },
);
expectStatus(recruiterCandidates, 200, "recruiter candidate list");
assert.ok(
  recruiterCandidates.data.candidates.some(
    (candidate) => candidate.candidate_id === candidateId,
  ),
);

const applications = await request("/api/candidates/applications", {
  token: candidateToken,
});
expectStatus(applications, 200, "candidate applications");
assert.ok(
  applications.data.applications.some(
    (application) => application.vacancy_id === vacancyId,
  ),
);

const application = applications.data.applications.find(
  (item) => item.vacancy_id === vacancyId,
);
const candidateMessage = await request("/api/messages", {
  method: "POST",
  token: candidateToken,
  body: {
    application_id: application.id,
    body: "Olá, tenho interesse nesta oportunidade.",
  },
});
expectStatus(candidateMessage, 201, "candidate sends message");

const recruiterMessages = await request("/api/messages", {
  token: recruiterToken,
});
expectStatus(recruiterMessages, 200, "recruiter reads messages");
assert.ok(
  recruiterMessages.data.messages.some(
    (message) => message.id === candidateMessage.data.message.id,
  ),
);
const recruiterConversation = recruiterMessages.data.conversations.find(
  (item) => item.application_id === application.id,
);
assert.ok(recruiterConversation);
assert.equal(
  recruiterConversation.company_name,
  "TechCorp",
  "conversation should include the business name for mobile",
);

const unrelatedRecruiterMessage = await request("/api/messages", {
  method: "POST",
  token: secondRecruiterToken,
  body: { application_id: application.id, body: "Mensagem não autorizada" },
});
expectStatus(
  unrelatedRecruiterMessage,
  403,
  "unrelated recruiter cannot message",
);

const cleanupMessages = new DatabaseSync(databasePath);
cleanupMessages
  .prepare("DELETE FROM messages WHERE id = ?")
  .run(candidateMessage.data.message.id);
cleanupMessages.close();

for (const removedRoute of [
  "forgot-password",
  "verify-email",
  "confirm-email",
  "send-code",
  "resend-code",
  "confirm-code",
  "validate-code",
]) {
  const result = await request(`/api/auth/${removedRoute}`, {
    method: "POST",
    body: {},
  });
  expectStatus(result, 404, `removed auth route ${removedRoute}`);
}

const changedPassword = await request("/api/auth/change-password", {
  method: "POST",
  token: candidateToken,
  body: { current_password: "Senha123!", new_password: "SenhaNova456!" },
});
expectStatus(changedPassword, 200, "authenticated password change");
expectStatus(
  await request("/api/auth/me", { token: candidateToken }),
  401,
  "password change revokes old session",
);
expectStatus(
  await request("/api/auth/me", { token: changedPassword.data.token }),
  200,
  "password change returns rotated session",
);

const unauthenticatedSessionPasswordChange = await request(
  "/api/auth/change-password-with-session",
  {
    method: "POST",
    body: { new_password: "SenhaNova789!", confirm_password: "SenhaNova789!" },
  },
);
expectStatus(
  unauthenticatedSessionPasswordChange,
  401,
  "session password change requires authentication",
);

const mismatchedSessionPasswordChange = await request(
  "/api/auth/change-password-with-session",
  {
    method: "POST",
    token: changedPassword.data.token,
    body: {
      new_password: "SenhaNova789!",
      confirm_password: "SenhaDiferente789!",
    },
  },
);
expectStatus(
  mismatchedSessionPasswordChange,
  400,
  "session password confirmation must match",
);

for (const email of ["recruiter@test.com", "unknown@smoke.test"]) {
  const otherAccountPasswordChange = await request(
    "/api/auth/change-password-with-session",
    {
      method: "POST",
      token: changedPassword.data.token,
      body: {
        email,
        new_password: "SenhaNova789!",
        confirm_password: "SenhaNova789!",
      },
    },
  );
  expectStatus(
    otherAccountPasswordChange,
    403,
    "session cannot change password for another email",
  );
}
expectStatus(
  await request("/api/auth/me", { token: changedPassword.data.token }),
  200,
  "rejected change preserves session",
);
const weakSessionPasswordChange = await request(
  "/api/auth/change-password-with-session",
  {
    method: "POST",
    token: changedPassword.data.token,
    body: {
      email: "candidate@test.com",
      new_password: "short",
      confirm_password: "short",
    },
  },
);
expectStatus(
  weakSessionPasswordChange,
  400,
  "session password must meet length requirement",
);

const sessionPasswordChange = await request(
  "/api/auth/change-password-with-session",
  {
    method: "POST",
    token: changedPassword.data.token,
    body: {
      email: " CANDIDATE@TEST.COM ",
      new_password: "SenhaNova789!",
      confirm_password: "SenhaNova789!",
    },
  },
);
expectStatus(sessionPasswordChange, 200, "session password change");
expectStatus(
  await request("/api/auth/me", { token: changedPassword.data.token }),
  401,
  "session password change revokes previous session",
);
expectStatus(
  await request("/api/auth/me", { token: sessionPasswordChange.data.token }),
  200,
  "session password change returns rotated session",
);
expectStatus(
  await request("/api/auth/change-password-with-session", {
    method: "POST",
    token: changedPassword.data.token,
    body: {
      email: "candidate@test.com",
      new_password: "SenhaNova000!",
      confirm_password: "SenhaNova000!",
    },
  }),
  401,
  "old session cannot change password again",
);
expectStatus(
  await request("/api/auth/login", {
    method: "POST",
    body: { email: "candidate@test.com", password: "SenhaNova456!" },
  }),
  401,
  "old password is rejected",
);
expectStatus(
  await request("/api/auth/login", {
    method: "POST",
    body: { email: "candidate@test.com", password: "SenhaNova789!" },
  }),
  200,
  "new password works",
);
expectStatus(
  await request("/api/auth/login", {
    method: "POST",
    body: { email: "recruiter@test.com", password: "Senha123!" },
  }),
  200,
  "another account password is unchanged",
);

const recoveryPayload = {
  email: " CANDIDATE@TEST.COM ",
  new_password: "Recuperada123!",
  confirm_password: "Recuperada123!",
};
expectStatus(
  await request("/api/auth/reset-password", {
    method: "POST",
    body: { ...recoveryPayload, email: "unknown@smoke.test" },
  }),
  404,
  "unknown recovery email",
);
expectStatus(
  await request("/api/auth/reset-password", {
    method: "POST",
    body: { ...recoveryPayload, confirm_password: "OutraSenha123!" },
  }),
  400,
  "recovery confirmation must match",
);
expectStatus(
  await request("/api/auth/reset-password", {
    method: "POST",
    body: {
      ...recoveryPayload,
      new_password: "short",
      confirm_password: "short",
    },
  }),
  400,
  "recovery password must meet length requirement",
);
expectStatus(
  await request("/api/auth/reset-password", {
    method: "POST",
    body: recoveryPayload,
  }),
  200,
  "development password recovery without session",
);
expectStatus(
  await request("/api/auth/me", { token: sessionPasswordChange.data.token }),
  401,
  "recovery revokes existing sessions",
);
expectStatus(
  await request("/api/auth/login", {
    method: "POST",
    body: { email: "candidate@test.com", password: "SenhaNova789!" },
  }),
  401,
  "recovery rejects old password",
);
expectStatus(
  await request("/api/auth/login", {
    method: "POST",
    body: { email: "candidate@test.com", password: "Recuperada123!" },
  }),
  200,
  "recovery accepts new password",
);

const resetCleanup = new DatabaseSync(databasePath);
resetCleanup
  .prepare("UPDATE users SET password_hash = ?, token_version = 0 WHERE id = ?")
  .run(await bcrypt.hash("Senha123!", 12), candidateId);
resetCleanup.close();

const linkedDb = new DatabaseSync(databasePath);
const linkedUser = linkedDb
  .prepare("SELECT user_id FROM vacancies LIMIT 1")
  .get();
linkedDb.close();

const linkedUserDelete = await request(
  `/api/admin/users/${linkedUser.user_id}`,
  {
    method: "DELETE",
    token: adminToken,
  },
);
expectStatus(linkedUserDelete, 409, "linked user delete");

const cleanupDb = new DatabaseSync(databasePath);
cleanupDb
  .prepare(
    "DELETE FROM messages WHERE application_id IN (SELECT id FROM interests WHERE vacancy_id = ?)",
  )
  .run(vacancyId);
cleanupDb
  .prepare("DELETE FROM saved_vacancies WHERE vacancy_id = ?")
  .run(vacancyId);
cleanupDb.prepare("DELETE FROM interests WHERE vacancy_id = ?").run(vacancyId);
cleanupDb.prepare("DELETE FROM vacancies WHERE id = ?").run(vacancyId);
cleanupDb
  .prepare("DELETE FROM users WHERE email = ?")
  .run("second-recruiter@smoke.test");
cleanupDb.prepare("DELETE FROM users WHERE email = ?").run(registeredEmail);
cleanupDb.close();

console.log("Smoke tests passed.");
