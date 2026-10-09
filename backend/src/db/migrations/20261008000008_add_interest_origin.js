export async function up(knex) {
  if (!(await knex.schema.hasColumn('interests', 'origin'))) {
    await knex.schema.alterTable('interests', (table) => {
      table.string('origin', 20).notNullable().defaultTo('MOBILE');
    });
  }

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
}

export async function down(knex) {
  if (await knex.schema.hasColumn('interests', 'origin')) {
    await knex.schema.alterTable('interests', (table) => {
      table.dropColumn('origin');
    });
  }
}