export async function up(knex) {
  await knex.schema.createTable('user_documents', (table) => {
    table.increments('id').primary();
    table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('storage_filename', 36).notNullable().unique();
    table.string('original_name', 255).notNullable();
    table.string('mime_type', 255).notNullable();
    table.integer('size').notNullable();
    table.timestamp('created_at').notNullable();
    table.index(['user_id', 'created_at'], 'idx_user_documents_owner_created');
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('user_documents');
}
