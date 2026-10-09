export async function up(knex) {
  await knex.raw(`
    UPDATE interests
    SET origin = 'DEMO'
    WHERE user_id = (SELECT id FROM users WHERE email = 'candidate@test.com')
      AND vacancy_id IN (
        SELECT id
        FROM vacancies
        WHERE company_name = 'StartupXYZ'
          AND job_title = 'Desenvolvedor Frontend'
      )
      AND NOT EXISTS (
        SELECT 1
        FROM messages
        WHERE messages.application_id = interests.id
      )
  `);

  await knex.raw(`
    UPDATE interests
    SET origin = 'DEMO'
    WHERE vacancy_id IN (
      SELECT id
      FROM vacancies
      WHERE company_name = 'TechCorp'
        AND job_title = 'Vaga de smoke para status'
    )
      AND NOT EXISTS (
        SELECT 1
        FROM messages
        WHERE messages.application_id = interests.id
      )
  `);
}

export async function down() {}