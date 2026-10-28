export async function up(knex) {
  await knex.schema.alterTable('user_preferences', (table) => {
    table.string('preferred_sector', 100).nullable();
    table.string('preferred_location', 255).nullable();
    table.enu('preferred_work_model', ['REMOTE', 'HYBRID', 'ONSITE']).nullable();
    table.enu('preferred_contract_type', ['CLT', 'PJ', 'INTERNSHIP', 'FREELANCE']).nullable();
  });
}

export async function down(knex) {
  await knex.schema.alterTable('user_preferences', (table) => {
    table.dropColumn('preferred_contract_type');
    table.dropColumn('preferred_work_model');
    table.dropColumn('preferred_location');
    table.dropColumn('preferred_sector');
  });
}