import assert from "node:assert/strict";
import { readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import Knex from "knex";

const databasePath = path.join(os.tmpdir(), `conectafacil-company-profile-${Date.now()}-${process.pid}.db`);
const targetMigrationName = "20261126000021_make_recruiter_tax_id_optional.js";
process.env.DATABASE_PATH = databasePath;
process.env.NODE_ENV = "test";

const { default: knexConfig } = await import("../knexfile.js");
const { getKnex } = await import("../src/config/database.js");
const knex = Knex(knexConfig);
let authKnex = null;
const migrationDirectory = path.resolve("src/db/migrations");

try {
  const migrationNames = (await readdir(migrationDirectory))
    .filter((name) => name.endsWith(".js"))
    .sort();
  const migrationIndex = migrationNames.indexOf(targetMigrationName);
  assert.ok(migrationIndex > 0, "tax ID migration exists after the company profile migration");

  for (const migrationName of migrationNames.slice(0, migrationIndex)) {
    const migration = await import(pathToFileURL(path.join(migrationDirectory, migrationName)).href);
    await migration.up(knex);
  }

  const { seed } = await import("../src/db/seeds/02_dev_data.js");
  await seed(knex);

  const taxIdMigration = await import(pathToFileURL(path.join(migrationDirectory, targetMigrationName)).href);
  const profileMigration = await import(pathToFileURL(path.join(migrationDirectory, "20261126000020_add_recruiter_company_profile.js")).href);
  await profileMigration.down(knex);
  assert.equal(Number((await knex.raw("PRAGMA table_info(users)")).find((column) => column.name === "document_type").notnull), 1);
  await profileMigration.up(knex);
  await profileMigration.rebuildUsers(knex, true);
  await taxIdMigration.up(knex);
  assert.equal(Number((await knex.raw("PRAGMA table_info(users)")).find((column) => column.name === "document_type").notnull), 0);

  const recruiter = await knex("users")
    .where({ email: "recruiter@test.com" })
    .first("company_name", "company_description", "company_sector", "company_location");

  assert.equal(recruiter.company_name, "StartupXYZ");
  assert.equal(recruiter.company_description, null);
  assert.equal(recruiter.company_sector, "Tecnologia");
  assert.equal(recruiter.company_location, "Remoto");
  const originalUserCount = Number((await knex("users").count({ total: "id" }))[0].total);
  await taxIdMigration.down(knex);
  assert.equal(Number((await knex.raw("PRAGMA table_info(users)")).find((column) => column.name === "document_type").notnull), 1);
  assert.equal(Number((await knex("users").count({ total: "id" }))[0].total), originalUserCount);
  assert.equal((await knex("users").where({ email: "recruiter@test.com" }).first("company_name")).company_name, "StartupXYZ");
  await taxIdMigration.up(knex);
  await profileMigration.rebuildUsers(knex, true);
  await taxIdMigration.up(knex);
  assert.equal((await knex("users").where({ email: "recruiter@test.com" }).first("company_name")).company_name, "StartupXYZ");
  const foreignKeyViolations = await knex.raw("PRAGMA foreign_key_check");
  assert.equal(foreignKeyViolations.length, 0);
  const { registerUser } = await import("../src/modules/auth/service.js");
  authKnex = getKnex();
  const registeredRecruiter = await registerUser({
    email: "recruiter-no-tax-id@test.invalid",
    password: "temporary-password",
    full_name: "Empresa sem CNPJ",
    user_type: "RECRUITER",
  });
  assert.equal(registeredRecruiter.user.user_type, "RECRUITER");
  const taxId = await knex("users")
    .where({ email: "recruiter-no-tax-id@test.invalid" })
    .first("document_type", "document_number");
  assert.equal(taxId.document_type, null);
  assert.equal(taxId.document_number, null);
  await assert.rejects(
    () => taxIdMigration.down(knex),
    /existem empresas sem documento fiscal/,
    "rollback refuses to restore the mandatory tax ID constraint when optional-ID companies exist",
  );
  console.log("Company profile migration backfill passed; seeded vacancy data was preserved.");
} finally {
  if (authKnex) await authKnex.destroy();
  await knex.destroy();
  await Promise.all([
    rm(databasePath, { force: true }),
    rm(`${databasePath}-wal`, { force: true }),
    rm(`${databasePath}-shm`, { force: true }),
  ]);
}
