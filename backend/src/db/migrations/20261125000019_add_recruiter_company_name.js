export async function up(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.string('company_name', 255).nullable();
  });
}

export async function down(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('company_name');
  });
}