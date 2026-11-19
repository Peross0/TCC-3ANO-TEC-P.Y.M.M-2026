import { getKnex } from "../../config/database.js";

export async function getProfile(userId) {
  const knex = getKnex();

  const user = await knex("users")
    .where({ id: userId, user_type: "CANDIDATE" })
    .whereNull("deleted_at")
    .first(
      "id",
      "email",
      "full_name",
      "phone",
      "course",
      "avatar_url",
      "document_type",
      "document_number",
      "active_notification",
      "created_at",
    );

  if (!user) {
    const err = new Error("Perfil de candidato não encontrado");
    err.statusCode = 404;
    throw err;
  }

  return { candidate: user };
}

export async function updateProfile(userId, data) {
  const knex = getKnex();

  const allowedFields = ["full_name", "phone", "course", "active_notification"];
  const updateData = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return getProfile(userId);
  }

  updateData.updated_at = new Date().toISOString();

  await knex("users")
    .where({ id: userId, user_type: "CANDIDATE" })
    .whereNull("deleted_at")
    .update(updateData);

  return getProfile(userId);
}

export async function listVacancies(userId, filters) {
  const knex = getKnex();

  const {
    job_title,
    company_sector,
    location,
    q,
    salary_min,
    salary_max,
    city,
    state,
    work_models,
    contract_types,
    experience_levels,
    work_schedules,
    work_model,
    contract_type,
    page = 1,
    limit = 10,
  } = filters;

  let query = knex("vacancies")
    .whereNull("vacancies.deleted_at")
    .where({ "vacancies.status": "OPEN" })
    .join("users", "vacancies.user_id", "users.id")
    .select(
      "vacancies.*",
      "users.email as company_email",
      "users.company_logo_url as company_logo_url",
      "users.full_name as recruiter_name",
    );

  if (job_title) {
    query = query.where("vacancies.job_title", "like", `%${job_title}%`);
  }
  if (company_sector) {
    query = query.where(
      "vacancies.company_sector",
      "like",
      `%${company_sector}%`,
    );
  }
  if (location) {
    query = query.where("vacancies.location", "like", `%${location.trim()}%`);
  }
  if (city) {
    query = query.where("vacancies.location", "like", `%${city.trim()}%`);
  }
  if (state) {
    query = query.where(
      "vacancies.location",
      "like",
      `% - ${state.trim().toUpperCase()}`,
    );
  }
  if (q) {
    const term = `%${q.trim()}%`;
    query = query.where((builder) =>
      builder
        .where("vacancies.job_title", "like", term)
        .orWhere("vacancies.company_name", "like", term)
        .orWhere("vacancies.company_sector", "like", term)
        .orWhere("vacancies.job_description", "like", term)
        .orWhere("vacancies.requirements", "like", term)
        .orWhere("vacancies.benefits", "like", term)
        .orWhere("vacancies.location", "like", term),
    );
  }
  if (salary_min !== undefined) {
    query = query.where("vacancies.salary_max", ">=", salary_min);
  }
  if (salary_max !== undefined) {
    query = query.where("vacancies.salary_min", "<=", salary_max);
  }
  if (work_model) {
    query = query.where("vacancies.work_model", work_model);
  }
  if (work_models?.length) {
    query = query.whereIn("vacancies.work_model", work_models);
  }
  if (contract_type) {
    if (["APPRENTICE", "TEMPORARY"].includes(contract_type)) {
      query = query.where("vacancies.contract_type_override", contract_type);
    } else {
      query = query
        .where("vacancies.contract_type", contract_type)
        .whereNull("vacancies.contract_type_override");
    }
  }
  if (contract_types?.length) {
    const storedContractTypes = contract_types.filter(
      (type) => !["APPRENTICE", "TEMPORARY"].includes(type),
    );
    const extendedContractTypes = contract_types.filter((type) =>
      ["APPRENTICE", "TEMPORARY"].includes(type),
    );
    query = query.where((builder) => {
      if (storedContractTypes.length) {
        builder.whereIn("vacancies.contract_type", storedContractTypes);
      }
      if (extendedContractTypes.length) {
        const method = storedContractTypes.length ? "orWhereIn" : "whereIn";
        builder[method](
          "vacancies.contract_type_override",
          extendedContractTypes,
        );
      }
    });
  }
  if (experience_levels?.length) {
    query = query.whereIn("vacancies.experience_level", experience_levels);
  }
  if (work_schedules?.length) {
    query = query.whereIn("vacancies.work_schedule", work_schedules);
  }

  // Get total count for pagination
  const countQuery = query
    .clone()
    .clearSelect()
    .clearOrder()
    .count("* as total");
  const [{ total }] = await countQuery;

  const offset = (page - 1) * limit;
  const vacancies = await query
    .orderBy("vacancies.created_at", "desc")
    .limit(limit)
    .offset(offset);

  return {
    vacancies: vacancies.map((vacancy) => ({
      ...vacancy,
      contract_type: vacancy.contract_type_override || vacancy.contract_type,
    })),
    pagination: {
      page,
      limit,
      total: Number(total),
      totalPages: Math.ceil(Number(total) / limit),
    },
  };
}

export async function listFavorites(userId) {
  const knex = getKnex();
  const favorites = await knex("saved_vacancies")
    .join("vacancies", "saved_vacancies.vacancy_id", "vacancies.id")
    .join("users", "vacancies.user_id", "users.id")
    .where({ "saved_vacancies.user_id": userId, "vacancies.status": "OPEN" })
    .whereNull("vacancies.deleted_at")
    .select(
      "vacancies.*",
      "users.company_logo_url",
      "saved_vacancies.created_at as saved_at",
    )
    .orderBy("saved_vacancies.created_at", "desc");

  return {
    favorites: favorites.map((vacancy) => ({
      ...vacancy,
      contract_type: vacancy.contract_type_override || vacancy.contract_type,
    })),
  };
}

export async function addFavorite(userId, vacancyId) {
  const knex = getKnex();
  const vacancy = await knex("vacancies")
    .where({ id: vacancyId, status: "OPEN" })
    .whereNull("deleted_at")
    .first("id");

  if (!vacancy) {
    const err = new Error("Vaga não encontrada ou não está aberta");
    err.statusCode = 404;
    throw err;
  }

  await knex("saved_vacancies")
    .insert({ user_id: userId, vacancy_id: vacancyId })
    .onConflict(["user_id", "vacancy_id"])
    .ignore();
  return { message: "Vaga salva com sucesso" };
}

export async function removeFavorite(userId, vacancyId) {
  const deleted = await getKnex()("saved_vacancies")
    .where({ user_id: userId, vacancy_id: vacancyId })
    .delete();

  if (!deleted) {
    const err = new Error("Vaga não encontrada nos itens salvos");
    err.statusCode = 404;
    throw err;
  }

  return { message: "Vaga removida dos itens salvos" };
}

export async function listCompanies(userId) {
  const knex = getKnex();
  const rows = await knex("interests")
    .join("vacancies", "interests.vacancy_id", "vacancies.id")
    .join("users as recruiters", "vacancies.user_id", "recruiters.id")
    .where("interests.user_id", userId)
    .whereNull("vacancies.deleted_at")
    .whereNull("recruiters.deleted_at")
    .select(
      "interests.id as application_id",
      "interests.status as application_status",
      "interests.created_at as interested_at",
      "vacancies.id as vacancy_id",
      "vacancies.job_title",
      "vacancies.company_name",
      "vacancies.company_description",
      "vacancies.company_sector",
      "vacancies.location",
      "vacancies.work_model",
      "vacancies.contract_type",
      "vacancies.contract_type_override",
      "vacancies.salary_min",
      "vacancies.salary_max",
      "recruiters.company_logo_url as company_logo_url",
    )
    .orderBy("interests.created_at", "desc");

  const companiesByName = new Map();
  rows.forEach((row) => {
    const companyKey = String(row.company_name || "Empresa")
      .trim()
      .toLocaleLowerCase("pt-BR");
    let company = companiesByName.get(companyKey);
    if (!company) {
      company = {
        id: companyKey,
        company_name: String(row.company_name || "Empresa").trim(),
        company_description: row.company_description || "",
        company_sector: row.company_sector || "",
        location: row.location || "",
        company_logo_url: row.company_logo_url || null,
        applications: [],
      };
      companiesByName.set(companyKey, company);
    } else {
      company.company_description ||= row.company_description || "";
      company.company_sector ||= row.company_sector || "";
      company.location ||= row.location || "";
      company.company_logo_url ||= row.company_logo_url || null;
    }

    company.applications.push({
      id: row.application_id,
      vacancy_id: row.vacancy_id,
      job_title: row.job_title,
      status: row.application_status,
      interested_at: row.interested_at,
      location: row.location || "",
      work_model: row.work_model,
      contract_type: row.contract_type_override || row.contract_type,
      salary_min: row.salary_min,
      salary_max: row.salary_max,
    });
  });

  return { companies: [...companiesByName.values()] };
}

export async function getVacancy(userId, vacancyId) {
  const knex = getKnex();

  const vacancy = await knex("vacancies")
    .where({ "vacancies.id": vacancyId })
    .whereNull("vacancies.deleted_at")
    .where({ "vacancies.status": "OPEN" })
    .join("users", "vacancies.user_id", "users.id")
    .select(
      "vacancies.*",
      "users.email as company_email",
      "users.full_name as recruiter_name",
      "users.phone as company_phone",
    )
    .first();

  if (!vacancy) {
    const err = new Error("Vaga não encontrada");
    err.statusCode = 404;
    throw err;
  }

  // Check if user already applied
  const existingInterest = await knex("interests")
    .where({ user_id: userId, vacancy_id: vacancyId })
    .first();

  return {
    vacancy: {
      ...vacancy,
      contract_type: vacancy.contract_type_override || vacancy.contract_type,
      already_applied: !!existingInterest,
      application_status: existingInterest?.status || null,
    },
  };
}

export async function applyToVacancy(userId, vacancyId) {
  const knex = getKnex();

  // Check if vacancy exists and is open
  const vacancy = await knex("vacancies")
    .where({ "vacancies.id": vacancyId })
    .whereNull("vacancies.deleted_at")
    .where({ "vacancies.status": "OPEN" })
    .join("users", "vacancies.user_id", "users.id")
    .select(
      "vacancies.*",
      "users.email as recruiter_email",
      "users.full_name as recruiter_name",
    )
    .first();

  if (!vacancy) {
    const err = new Error("Vaga não encontrada ou não está aberta");
    err.statusCode = 404;
    throw err;
  }

  // Check if already applied
  const existing = await knex("interests")
    .where({ user_id: userId, vacancy_id: vacancyId })
    .first();

  if (existing) {
    const err = new Error("Você já se candidatou a esta vaga");
    err.statusCode = 409;
    throw err;
  }

  // Create interest
  let application;
  try {
    [application] = await knex("interests")
      .insert({
        user_id: userId,
        vacancy_id: vacancyId,
        origin: "MOBILE",
        status: "PENDING",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning(["id", "status", "created_at"]);
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      const conflict = new Error("Você já demonstrou interesse nesta vaga.");
      conflict.statusCode = 409;
      throw conflict;
    }
    throw error;
  }

  return {
    message: "Candidatura enviada com sucesso",
    application: {
      id: application.id,
      vacancy_id: vacancyId,
      status: application.status,
      applied_at: application.created_at,
      company_name: vacancy.company_name,
      company_sector: vacancy.company_sector,
      company_description: vacancy.company_description,
      company_logo_url: vacancy.company_logo_url,
      company_email: vacancy.recruiter_email,
    },
  };
}

export async function listApplications(userId) {
  const knex = getKnex();

  const applications = await knex("interests")
    .where({ "interests.user_id": userId })
    .join("vacancies", "interests.vacancy_id", "vacancies.id")
    .join("users as recruiters", "vacancies.user_id", "recruiters.id")
    .whereNull("vacancies.deleted_at")
    .select(
      "interests.id",
      "interests.status",
      "interests.created_at as applied_at",
      "interests.updated_at as status_updated_at",
      "vacancies.id as vacancy_id",
      "vacancies.job_title",
      "vacancies.company_name",
      "vacancies.company_sector",
      "vacancies.location",
      "vacancies.work_model",
      "vacancies.contract_type",
      "vacancies.salary_min",
      "vacancies.salary_max",
      "recruiters.email as company_email",
      "recruiters.full_name as recruiter_name",
    )
    .orderBy("interests.created_at", "desc");

  return { applications };
}

export async function deleteApplication(userId, vacancyId) {
  const knex = getKnex();

  const application = await knex("interests")
    .where({ user_id: userId, vacancy_id: vacancyId })
    .first("id");

  if (application) {
    await knex("messages").where({ application_id: application.id }).delete();
  }

  const deleted = await knex("interests")
    .where({ user_id: userId, vacancy_id: vacancyId })
    .delete();

  if (deleted === 0) {
    const err = new Error("Candidatura não encontrada");
    err.statusCode = 404;
    throw err;
  }

  return { message: "Candidatura removida com sucesso" };
}

export async function toggleNotification(userId, activeNotification) {
  const knex = getKnex();

  await knex("users")
    .where({ id: userId, user_type: "CANDIDATE" })
    .whereNull("deleted_at")
    .update({
      active_notification: activeNotification,
      updated_at: new Date().toISOString(),
    });

  return {
    message: "Preferência de notificação atualizada",
    active_notification: activeNotification,
  };
}
