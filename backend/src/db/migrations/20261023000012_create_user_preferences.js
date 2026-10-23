export async function up(knex) {
  await knex.schema.createTable('user_preferences', (table) => {
    table.integer('user_id').primary().references('id').inTable('users').onDelete('CASCADE');
    table.string('theme', 10).notNullable().defaultTo('system');
    table.boolean('large_text').notNullable().defaultTo(false);
    table.boolean('high_contrast').notNullable().defaultTo(false);
    table.boolean('reduce_motion').notNullable().defaultTo(false);
    table.timestamp('updated_at').notNullable().defaultTo(knex.raw("(strftime('%Y-%m-%dT%H:%M:%SZ','now'))"));
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('user_preferences');
}
