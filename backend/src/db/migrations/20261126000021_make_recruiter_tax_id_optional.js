import { rebuildUsers } from "./20261126000020_add_recruiter_company_profile.js";

export const config = { transaction: false };

async function hasRequiredTaxId(knex) {
  const columns = await knex.raw("PRAGMA table_info(users)");
  const byName = new Map(columns.map((column) => [column.name, column]));
  const documentColumns = ["document_type", "document_number"];
  const missingColumns = documentColumns.filter((name) => !byName.has(name));

  if (missingColumns.length) {
    throw new Error(`Colunas de documento ausentes em users: ${missingColumns.join(", ")}`);
  }

  return documentColumns.some((name) => Boolean(byName.get(name).notnull));
}

export async function up(knex) {
  if (await hasRequiredTaxId(knex)) {
    await rebuildUsers(knex, false);
  }
}

export async function down(knex) {
  const [{ total }] = await knex("users")
    .where((query) => query.whereNull("document_type").orWhereNull("document_number"))
    .count({ total: "id" });
  if (Number(total) > 0) {
    throw new Error("Não é possível reverter: existem empresas sem documento fiscal.");
  }

  if (!(await hasRequiredTaxId(knex))) {
    await rebuildUsers(knex, true);
  }
}
