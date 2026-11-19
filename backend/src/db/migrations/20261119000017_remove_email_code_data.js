export async function up(knex) {
  await knex.schema.dropTableIfExists('password_reset_attempts');
  await knex.schema.dropTableIfExists('password_reset_requests');

  for (const column of ['code_email_verification', 'code_expires_at', 'verified_email']) {
    if (await knex.schema.hasColumn('users', column)) {
      await knex.raw(`ALTER TABLE users DROP COLUMN "${column}"`);
    }
  }
}

export async function down() {
  throw new Error('A remoção de dados de verificação é irreversível.');
}
