export async function up(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.integer('token_version').notNullable().defaultTo(0);
  });

  await knex.schema.createTable('password_reset_requests', (table) => {
    table.increments('id').primary();
    table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('code_hash', 60).notNullable();
    table.timestamp('requested_at').notNullable();
    table.timestamp('expires_at').notNullable();
    table.timestamp('consumed_at').nullable();
    table.integer('failed_attempts').notNullable().defaultTo(0);
    table.index(['user_id', 'consumed_at', 'expires_at'], 'idx_password_reset_active');
  });

  await knex.schema.createTable('password_reset_attempts', (table) => {
    table.increments('id').primary();
    table.string('email_hash', 64).notNullable();
    table.string('ip_hash', 64).notNullable();
    table.timestamp('created_at').notNullable();
    table.index(['email_hash', 'created_at'], 'idx_password_reset_email_rate');
    table.index(['ip_hash', 'created_at'], 'idx_password_reset_ip_rate');
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('password_reset_attempts');
  await knex.schema.dropTableIfExists('password_reset_requests');
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('token_version');
  });
}