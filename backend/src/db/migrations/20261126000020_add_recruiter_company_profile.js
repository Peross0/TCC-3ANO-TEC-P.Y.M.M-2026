export const config = { transaction: false };

export async function rebuildUsers(knex, documentRequired) {
  const temporaryTable = documentRequired ? 'users_document_required' : 'users_document_optional';
  const documentType = documentRequired
    ? "TEXT NOT NULL CHECK(document_type IN ('CPF', 'CNPJ'))"
    : "TEXT CHECK(document_type IS NULL OR document_type IN ('CPF', 'CNPJ'))";
  const documentNumber = documentRequired ? 'VARCHAR(18) NOT NULL UNIQUE' : 'VARCHAR(18) NULL UNIQUE';

  await knex.raw('PRAGMA foreign_keys = OFF');
  await knex.raw('BEGIN IMMEDIATE');
  try {
    await knex.raw('DROP TRIGGER IF EXISTS trg_users_updated_at');
    await knex.raw(`
    CREATE TABLE ${temporaryTable} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      user_type TEXT NOT NULL DEFAULT 'CANDIDATE' CHECK(user_type IN ('CANDIDATE', 'RECRUITER', 'ADMIN')),
      document_type ${documentType},
      document_number ${documentNumber},
      phone VARCHAR(20) NULL,
      avatar_url VARCHAR(500) NULL,
      active_notification BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
      updated_at DATETIME NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
      deleted_at DATETIME NULL,
      company_logo_url VARCHAR(500) NULL,
      course VARCHAR(255) NULL,
      token_version INTEGER NOT NULL DEFAULT 0,
      company_name VARCHAR(255) NULL,
      company_description TEXT NULL,
      company_sector VARCHAR(100) NULL,
      company_location VARCHAR(255) NULL
    )
    `);
    await knex.raw(`
    INSERT INTO ${temporaryTable} (
      id, email, password_hash, full_name, user_type, document_type, document_number,
      phone, avatar_url, active_notification, created_at, updated_at, deleted_at,
      company_logo_url, course, token_version, company_name, company_description,
      company_sector, company_location
    )
    SELECT id, email, password_hash, full_name, user_type, document_type, document_number,
      phone, avatar_url, active_notification, created_at, updated_at, deleted_at,
      company_logo_url, course, token_version, company_name, company_description,
      company_sector, company_location
    FROM users
    `);
    await knex.schema.dropTable('users');
    await knex.schema.renameTable(temporaryTable, 'users');
    await knex.schema.raw('CREATE INDEX idx_user_email ON users(email)');
    await knex.schema.raw('CREATE INDEX idx_user_type ON users(user_type)');
    await knex.schema.raw('CREATE INDEX idx_user_full_name ON users(full_name)');
    await knex.schema.raw('CREATE INDEX idx_user_document_number ON users(document_number)');
    await knex.schema.raw(`
    CREATE TRIGGER trg_users_updated_at
    AFTER UPDATE ON users
    FOR EACH ROW
    BEGIN
      UPDATE users SET updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = OLD.id;
    END;
    `);
    const violations = await knex.raw('PRAGMA foreign_key_check');
    if (violations.length) throw new Error('Violação de integridade referencial ao reestruturar users.');
    await knex.raw('COMMIT');
  } catch (error) {
    await knex.raw('ROLLBACK');
    throw error;
  } finally {
    await knex.raw('PRAGMA foreign_keys = ON');
  }
}

export async function up(knex) {
  const columns = [
    ['company_description', (table) => table.text('company_description').nullable()],
    ['company_sector', (table) => table.string('company_sector', 100).nullable()],
    ['company_location', (table) => table.string('company_location', 255).nullable()],
  ];

  for (const [name, addColumn] of columns) {
    if (!(await knex.schema.hasColumn('users', name))) {
      await knex.schema.alterTable('users', addColumn);
    }
  }

  await knex.raw(`
    UPDATE users
    SET company_name = COALESCE(company_name, (
      SELECT vacancies.company_name
      FROM vacancies
      WHERE vacancies.user_id = users.id
        AND vacancies.deleted_at IS NULL
      ORDER BY vacancies.created_at DESC, vacancies.id DESC
      LIMIT 1
    )),
    company_description = COALESCE(company_description, (
      SELECT vacancies.company_description
      FROM vacancies
      WHERE vacancies.user_id = users.id
        AND vacancies.deleted_at IS NULL
      ORDER BY vacancies.created_at DESC, vacancies.id DESC
      LIMIT 1
    )),
    company_sector = COALESCE(company_sector, (
      SELECT vacancies.company_sector
      FROM vacancies
      WHERE vacancies.user_id = users.id
        AND vacancies.deleted_at IS NULL
      ORDER BY vacancies.created_at DESC, vacancies.id DESC
      LIMIT 1
    )),
    company_location = COALESCE(company_location, (
      SELECT vacancies.location
      FROM vacancies
      WHERE vacancies.user_id = users.id
        AND vacancies.deleted_at IS NULL
      ORDER BY vacancies.created_at DESC, vacancies.id DESC
      LIMIT 1
    ))
    WHERE users.user_type = 'RECRUITER'
  `);

  await rebuildUsers(knex, false);
}

// Keep these additive profile fields on rollback to avoid discarding company
// data created after this migration. Older application code safely ignores them.
export async function down(knex) {
  const [{ total }] = await knex('users')
    .whereNull('document_number')
    .count({ total: 'id' });
  if (Number(total) > 0) {
    throw new Error('Não é possível reverter: existem empresas sem documento fiscal.');
  }
  await rebuildUsers(knex, true);
}
