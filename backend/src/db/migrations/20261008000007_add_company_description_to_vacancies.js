export async function up(knex) {
  if (!(await knex.schema.hasColumn('vacancies', 'company_description'))) {
    await knex.schema.alterTable('vacancies', (table) => {
      table.text('company_description').nullable();
    });
  }
}

export async function down(knex) {
  if (await knex.schema.hasColumn('vacancies', 'company_description')) {
    await knex.schema.alterTable('vacancies', (table) => {
      table.dropColumn('company_description');
    });
  }
}