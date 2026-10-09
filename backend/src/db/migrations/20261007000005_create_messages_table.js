export async function up(knex) {
  await knex.schema.createTable('messages', (table) => {
    table.increments('id').primary();
    table.integer('application_id').notNullable().references('id').inTable('interests').onDelete('RESTRICT');
    table.integer('sender_id').notNullable().references('id').inTable('users').onDelete('RESTRICT');
    table.text('body').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.raw("(strftime('%Y-%m-%dT%H:%M:%SZ','now'))"));
  });

  await knex.schema.raw('CREATE INDEX idx_messages_application_created ON messages(application_id, created_at)');
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('messages');
}
