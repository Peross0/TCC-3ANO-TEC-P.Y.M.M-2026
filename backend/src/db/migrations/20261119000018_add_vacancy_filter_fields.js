export async function up(knex) {
  await knex.schema.alterTable("vacancies", (table) => {
    table.string("contract_type_override", 30).nullable();
    table.string("experience_level", 30).nullable();
    table.string("work_schedule", 30).nullable();
  });
}

export async function down(knex) {
  await knex.schema.alterTable("vacancies", (table) => {
    table.dropColumn("contract_type_override");
    table.dropColumn("experience_level");
    table.dropColumn("work_schedule");
  });
}
