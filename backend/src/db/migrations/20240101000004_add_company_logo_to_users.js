export async function up(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.string('company_logo_url', 500).nullable();
  });
}

export async function down(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('company_logo_url');
  });
}
