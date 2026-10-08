import { getKnex } from '../../config/database.js';

export async function listMessages(userId) {
  const knex = getKnex();

  const conversations = await knex('interests')
    .join('vacancies', 'interests.vacancy_id', 'vacancies.id')
    .join('users as candidates', 'interests.user_id', 'candidates.id')
    .join('users as recruiters', 'vacancies.user_id', 'recruiters.id')
    .whereNull('vacancies.deleted_at')
    .where('interests.origin', 'MOBILE')
    .where((query) => query
      .where('interests.user_id', userId)
      .orWhere('vacancies.user_id', userId))
    .select(
      'interests.id as application_id',
      'interests.user_id as candidate_id',
      'candidates.full_name as candidate_name',
      'vacancies.user_id as recruiter_id',
      'recruiters.full_name as recruiter_name',
      'vacancies.company_name',
      'recruiters.company_logo_url as company_logo_url',
      'vacancies.job_title'
    )
    .orderBy('interests.created_at', 'desc');

  const messages = await knex('messages')
    .join('interests', 'messages.application_id', 'interests.id')
    .join('vacancies', 'interests.vacancy_id', 'vacancies.id')
    .join('users as candidates', 'interests.user_id', 'candidates.id')
    .join('users as recruiters', 'vacancies.user_id', 'recruiters.id')
    .whereNull('vacancies.deleted_at')
    .where('interests.origin', 'MOBILE')
    .where((query) => query
      .where('interests.user_id', userId)
      .orWhere('vacancies.user_id', userId))
    .select(
      'messages.id',
      'messages.application_id',
      'messages.sender_id',
      'messages.body',
      'messages.created_at',
      'interests.user_id as candidate_id',
      'candidates.full_name as candidate_name',
      'vacancies.user_id as recruiter_id',
      'recruiters.full_name as recruiter_name',
      'vacancies.job_title'
    )
    .orderBy('messages.created_at', 'asc')
    .orderBy('messages.id', 'asc');

  return { conversations, messages };
}

export async function createMessage(userId, data) {
  const knex = getKnex();
  const application = await knex('interests')
    .join('vacancies', 'interests.vacancy_id', 'vacancies.id')
    .where('interests.id', data.application_id)
    .whereNull('vacancies.deleted_at')
    .select(
      'interests.id',
      'interests.user_id as candidate_id',
      'vacancies.user_id as recruiter_id'
    )
    .first();

  if (!application) {
    const err = new Error('Candidatura não encontrada');
    err.statusCode = 404;
    throw err;
  }

  if (userId !== application.candidate_id && userId !== application.recruiter_id) {
    const err = new Error('Você não participa desta conversa');
    err.statusCode = 403;
    throw err;
  }

  const [id] = await knex('messages').insert({
    application_id: application.id,
    sender_id: userId,
    body: data.body,
  });

  const message = await knex('messages')
    .where({ id })
    .first('id', 'application_id', 'sender_id', 'body', 'created_at');

  return { message };
}
