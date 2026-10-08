export async function up(knex) {
  if (!(await knex.schema.hasColumn('users', 'course'))) {
    await knex.schema.alterTable('users', (table) => {
      table.string('course', 255).nullable();
    });
  }
}

export async function down(knex) {
  if (await knex.schema.hasColumn('users', 'course')) {
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('course');
    });
  }
}
