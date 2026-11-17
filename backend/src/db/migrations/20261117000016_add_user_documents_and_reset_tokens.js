export async function up(knex) {
  await knex.schema.alterTable('password_reset_requests', (table) => {
    table.string('code_hash', 60).nullable().alter();
    table.string('token_hash', 64).nullable();
    table.index(['token_hash'], 'idx_password_reset_token_hash');
  });

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
  await knex('password_reset_requests')
    .whereNull('code_hash')
    .update({ code_hash: 'disabled' });
  await knex.schema.alterTable('password_reset_requests', (table) => {
    table.dropIndex(['token_hash'], 'idx_password_reset_token_hash');
    table.dropColumn('token_hash');
    table.string('code_hash', 60).notNullable().alter();
  });
}
