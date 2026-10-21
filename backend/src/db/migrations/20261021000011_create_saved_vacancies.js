export async function up(knex) {
  await knex.schema.createTable('saved_vacancies', (table) => {
    table.increments('id').primary();
    table.integer('user_id').notNullable().references('id').inTable('users').onDelete('RESTRICT');
    table.integer('vacancy_id').notNullable().references('id').inTable('vacancies').onDelete('RESTRICT');
    table.timestamp('created_at').notNullable().defaultTo(knex.raw("(strftime('%Y-%m-%dT%H:%M:%SZ','now'))"));
    table.unique(['user_id', 'vacancy_id']);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('saved_vacancies');
}