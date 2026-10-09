export async function up(knex) {
  await knex('interests')
    .whereIn('vacancy_id', knex('vacancies')
      .select('id')
      .where({
        company_name: 'TechCorp',
        job_title: 'Vaga de smoke para status',
      }))
    .update({ origin: 'DEMO' });
}

export async function down() {}