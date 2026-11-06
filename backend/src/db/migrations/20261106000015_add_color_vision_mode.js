export async function up(knex) {
  await knex.schema.alterTable('user_preferences', (table) => {
    table.string('color_vision_mode', 20).notNullable().defaultTo('none');
  });
}

export async function down(knex) {
  await knex.schema.alterTable('user_preferences', (table) => {
    table.dropColumn('color_vision_mode');
  });
}
