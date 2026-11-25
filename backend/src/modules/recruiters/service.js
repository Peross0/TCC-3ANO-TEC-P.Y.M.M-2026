import { existsSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { getKnex } from "../../config/database.js";
import { env } from "../../config/env.js";

async function getOwnedVacancy(userId, vacancyId) {
  const knex = getKnex();
  const vacancy = await knex("vacancies")
    .where({ id: vacancyId })
    .whereNull("deleted_at")
    .first();

  if (!vacancy) {
    const err = new Error("Vaga não encontrada");
    err.statusCode = 404;
    throw err;
  }

  if (vacancy.user_id !== userId) {
    const err = new Error("Você não tem permissão para acessar esta vaga");
    err.statusCode = 403;
    throw err;
  }

  return vacancy;
}

export async function getProfile(userId) {
  const knex = getKnex();

  const user = await knex("users")
    .where({ id: userId, user_type: "RECRUITER" })
    .whereNull("deleted_at")
    .first(
      "id",
      "email",
      "full_name",
      "phone",
      "company_name",
      "avatar_url",
      "company_logo_url",
      "document_type",
      "document_number",
      "active_notification",
      "created_at",
    );

  if (!user) {
    const err = new Error("Perfil de recrutador não encontrado");
    err.statusCode = 404;
    throw err;
  }

  return { recruiter: user };
}

export async function getDashboard(userId) {
  const knex = getKnex();
  const [
    profileRows,
    vacancyRows,
    applicationRows,
    recentVacancies,
    recentApplications,
  ] = await Promise.all([
    knex("users")
      .where({ id: userId, user_type: "RECRUITER" })
      .whereNull("deleted_at")
      .count("* as total"),
    knex("vacancies")
      .where({ user_id: userId })
      .whereNull("deleted_at")
      .select("status")
      .count("* as total")
      .groupBy("status"),
    knex("interests")
      .join("vacancies", "interests.vacancy_id", "vacancies.id")
      .join("users", "interests.user_id", "users.id")
      .where("vacancies.user_id", userId)
      .whereNull("vacancies.deleted_at")
      .whereNull("users.deleted_at")
      .select("interests.status")
      .count("* as total")
      .groupBy("interests.status"),
    knex("vacancies")
      .where({ user_id: userId })
      .whereNull("deleted_at")
      .select("job_title", "created_at")
      .orderBy("created_at", "desc")
      .limit(5),
    knex("interests")
      .join("vacancies", "interests.vacancy_id", "vacancies.id")
      .join("users", "interests.user_id", "users.id")
      .where("vacancies.user_id", userId)
      .whereNull("vacancies.deleted_at")
      .whereNull("users.deleted_at")
      .select("users.full_name", "vacancies.job_title", "interests.created_at")
      .orderBy("interests.created_at", "desc")
      .limit(5),
  ]);

  const vacancyCounts = Object.fromEntries(
    vacancyRows.map((row) => [row.status, Number(row.total)]),
  );
  const applicationCounts = Object.fromEntries(
    applicationRows.map((row) => [row.status, Number(row.total)]),
  );
  const activities = [
    ...recentVacancies.map((vacancy) => ({
      type: "VACANCY_CREATED",
      title: "Vaga publicada",
      description: vacancy.job_title,
      created_at: vacancy.created_at,
    })),
    ...recentApplications.map((application) => ({
      type: "APPLICATION_RECEIVED",
      title: "Candidatura recebida",
      description: `${application.full_name} · ${application.job_title}`,
      created_at: application.created_at,
    })),
  ]
    .sort(
      (first, second) =>
        new Date(second.created_at) - new Date(first.created_at),
    )
    .slice(0, 5);

  return {
    profileCount: Number(profileRows[0]?.total || 0),
    vacancies: {
      open: vacancyCounts.OPEN || 0,
      closed: vacancyCounts.CLOSED || 0,
    },
    applications: {
      total: Object.values(applicationCounts).reduce(
        (total, count) => total + count,
        0,
      ),
      pending: applicationCounts.PENDING || 0,
      accepted: applicationCounts.ACCEPTED || 0,
      rejected: applicationCounts.REJECTED || 0,
    },
    activities,
  };
}

export async function updateProfile(userId, data) {
  const knex = getKnex();

  const allowedFields = ["full_name", "phone", "active_notification"];
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
    .where({ id: userId, user_type: "RECRUITER" })
    .whereNull("deleted_at")
    .update(updateData);

  return getProfile(userId);
}

export async function updateCompany(userId, data) {
  const knex = getKnex();
  const updatedAt = new Date().toISOString();

  const updatedVacancies = await knex.transaction(async (trx) => {
    const vacancies = await trx("vacancies")
      .where({ user_id: userId })
      .whereNull("deleted_at")
      .count("* as total");
    const total = Number(vacancies[0].total);

    if (total === 0) {
      const err = new Error(
        "Publique uma vaga antes de editar os dados da empresa.",
      );
      err.statusCode = 409;
      throw err;
    }

    const updateData = {
      company_name: data.company_name,
      company_sector: data.company_sector.trim() || null,
      location: data.location.trim() || null,
      updated_at: updatedAt,
    };
    if (data.company_description !== undefined) {
      updateData.company_description = data.company_description.trim() || null;
    }

    return trx("vacancies")
      .where({ user_id: userId })
      .whereNull("deleted_at")
      .update(updateData);
  });

  return {
    message: "Dados da empresa atualizados com sucesso.",
    updated_vacancies: Number(updatedVacancies),
  };
}

export async function updateCompanyLogo(userId, filename) {
  const knex = getKnex();
  const user = await knex("users")
    .where({ id: userId, user_type: "RECRUITER" })
    .whereNull("deleted_at")
    .first("company_logo_url");

  if (!user) {
    const err = new Error("Perfil de recrutador não encontrado");
    err.statusCode = 404;
    throw err;
  }

  await knex("users").where({ id: userId, user_type: "RECRUITER" }).update({
    company_logo_url: filename,
    updated_at: new Date().toISOString(),
  });

  if (user.company_logo_url && user.company_logo_url !== filename) {
    const oldPath = resolve(
      process.cwd(),
      env.UPLOAD_DIR,
      user.company_logo_url,
    );
    if (existsSync(oldPath)) {
      unlinkSync(oldPath);
    }
  }

  return {
    company_logo_url: `/uploads/${filename}`,
    message: "Ícone da empresa atualizado com sucesso.",
  };
}

export async function createVacancy(userId, data) {
  const knex = getKnex();
  const isExtendedContract = ["APPRENTICE", "TEMPORARY"].includes(
    data.contract_type,
  );

  const [vacancy] = await knex("vacancies")
    .insert({
      user_id: userId,
      job_title: data.job_title,
      company_name: data.company_name,
      company_description: data.company_description?.trim() || null,
      company_sector: data.company_sector || null,
      job_description: data.job_description,
      requirements: data.requirements || null,
      benefits: data.benefits || null,
      location: data.location || null,
      work_model: data.work_model,
      contract_type: isExtendedContract ? "CLT" : data.contract_type,
      contract_type_override: isExtendedContract ? data.contract_type : null,
      experience_level: data.experience_level || null,
      work_schedule: data.work_schedule || null,
      salary_min: data.salary_min || null,
      salary_max: data.salary_max || null,
      status: "OPEN",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    })
    .returning("*");

  return { vacancy: { ...vacancy, contract_type: data.contract_type } };
}

const publicVacancyFields = [
  "vacancies.id",
  "vacancies.job_title",
  "vacancies.company_name",
  "vacancies.company_description",
  "vacancies.company_sector",
  "vacancies.job_description",
  "vacancies.requirements",
  "vacancies.benefits",
  "vacancies.location",
  "vacancies.work_model",
  "vacancies.contract_type",
  "vacancies.contract_type_override",
  "vacancies.experience_level",
  "vacancies.work_schedule",
  "vacancies.salary_min",
  "vacancies.salary_max",
  "vacancies.created_at",
  "recruiters.company_logo_url as company_logo_url",
];

export async function listOtherVacancies(userId, filters) {
  const knex = getKnex();
  const {
    q,
    company_sector,
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
    .join("users as recruiters", "vacancies.user_id", "recruiters.id")
    .whereNot("vacancies.user_id", userId)
    .where({ "vacancies.status": "OPEN" })
    .whereNull("vacancies.deleted_at")
    .whereNull("recruiters.deleted_at")
    .select(publicVacancyFields);

  if (q) {
    const term = `%${q}%`;
    query = query.where((builder) =>
      builder
        .where("vacancies.job_title", "like", term)
        .orWhere("vacancies.company_name", "like", term)
        .orWhere("vacancies.company_sector", "like", term)
        .orWhere("vacancies.location", "like", term)
        .orWhere("vacancies.job_description", "like", term)
        .orWhere("vacancies.requirements", "like", term)
        .orWhere("vacancies.benefits", "like", term),
    );
  }
  if (company_sector) {
    query = query.where(
      "vacancies.company_sector",
      "like",
      `%${company_sector}%`,
    );
  }
  if (city) query = query.where("vacancies.location", "like", `%${city}%`);
  if (state) {
    query = query.where(
      "vacancies.location",
      "like",
      `% - ${state.toUpperCase()}`,
    );
  }
  if (salary_min !== undefined) {
    query = query.where("vacancies.salary_max", ">=", salary_min);
  }
  if (salary_max !== undefined) {
    query = query.where("vacancies.salary_min", "<=", salary_max);
  }
  if (work_model) query = query.where("vacancies.work_model", work_model);
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
    const storedTypes = contract_types.filter(
      (type) => !["APPRENTICE", "TEMPORARY"].includes(type),
    );
    const overrideTypes = contract_types.filter((type) =>
      ["APPRENTICE", "TEMPORARY"].includes(type),
    );
    query = query.where((builder) => {
      if (storedTypes.length) {
        builder.whereIn("vacancies.contract_type", storedTypes);
      }
      if (overrideTypes.length) {
        const method = storedTypes.length ? "orWhereIn" : "whereIn";
        builder[method]("vacancies.contract_type_override", overrideTypes);
      }
    });
  }
  if (experience_levels?.length) {
    query = query.whereIn("vacancies.experience_level", experience_levels);
  }
  if (work_schedules?.length) {
    query = query.whereIn("vacancies.work_schedule", work_schedules);
  }

  const [{ total }] = await query
    .clone()
    .clearSelect()
    .clearOrder()
    .count("* as total");
  const vacancies = await query
    .orderBy("vacancies.created_at", "desc")
    .limit(limit)
    .offset((page - 1) * limit);

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

export async function getOtherVacancy(userId, vacancyId) {
  const vacancy = await getKnex()("vacancies")
    .join("users as recruiters", "vacancies.user_id", "recruiters.id")
    .where({ "vacancies.id": vacancyId, "vacancies.status": "OPEN" })
    .whereNot("vacancies.user_id", userId)
    .whereNull("vacancies.deleted_at")
    .whereNull("recruiters.deleted_at")
    .select(publicVacancyFields)
    .first();

  if (!vacancy) {
    const err = new Error("Vaga não encontrada ou indisponível");
    err.statusCode = 404;
    throw err;
  }

  return {
    vacancy: {
      ...vacancy,
      contract_type: vacancy.contract_type_override || vacancy.contract_type,
    },
  };
}

export async function listMyVacancies(userId, filters) {
  const knex = getKnex();

  const { page = 1, limit = 10, status = "ALL" } = filters;

  let query = knex("vacancies")
    .where({ user_id: userId })
    .whereNull("deleted_at");

  if (status && status !== "ALL") {
    query = query.where({ status });
  }

  const countQuery = query
    .clone()
    .clearSelect()
    .clearOrder()
    .count("* as total");
  const [{ total }] = await countQuery;

  const offset = (page - 1) * limit;
  const vacancies = await query
    .select(
      "vacancies.*",
      knex.raw(
        "(SELECT COUNT(*) FROM interests WHERE interests.vacancy_id = vacancies.id) AS applicant_count",
      ),
    )
    .orderBy("created_at", "desc")
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

export async function getMyVacancy(userId, vacancyId) {
  const vacancy = await getOwnedVacancy(userId, vacancyId);

  return {
    vacancy: {
      ...vacancy,
      contract_type: vacancy.contract_type_override || vacancy.contract_type,
    },
  };
}

export async function updateVacancy(userId, vacancyId, data) {
  const knex = getKnex();

  const vacancy = await getOwnedVacancy(userId, vacancyId);

  const allowedFields = [
    "job_title",
    "company_name",
    "company_sector",
    "job_description",
    "requirements",
    "benefits",
    "location",
    "work_model",
    "experience_level",
    "work_schedule",
    "salary_min",
    "salary_max",
    "status",
  ];

  const updateData = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }
  if (data.contract_type !== undefined) {
    const isExtendedContract = ["APPRENTICE", "TEMPORARY"].includes(
      data.contract_type,
    );
    updateData.contract_type = isExtendedContract ? "CLT" : data.contract_type;
    updateData.contract_type_override = isExtendedContract
      ? data.contract_type
      : null;
  }

  if (Object.keys(updateData).length === 0) {
    return getMyVacancy(userId, vacancyId);
  }

  const hasFieldUpdate = Object.keys(updateData).some(
    (field) => field !== "status",
  );
  const requestedStatus = updateData.status;
  const isStatusToggle = requestedStatus !== undefined;

  if (
    vacancy.status === "OPEN" &&
    (hasFieldUpdate || (isStatusToggle && requestedStatus === "OPEN"))
  ) {
    const err = new Error("Para editar esta vaga, primeiro desative-a.");
    err.statusCode = 409;
    throw err;
  }

  if (
    vacancy.status === "CLOSED" &&
    requestedStatus === "OPEN" &&
    hasFieldUpdate
  ) {
    const err = new Error(
      "Para reativar esta vaga, use a ação de reativar sem alterar os outros campos da vaga.",
    );
    err.statusCode = 409;
    throw err;
  }

  updateData.updated_at = new Date().toISOString();

  await knex("vacancies").where({ id: vacancyId }).update(updateData);

  return getMyVacancy(userId, vacancyId);
}

export async function deleteVacancy(userId, vacancyId) {
  const knex = getKnex();

  await getOwnedVacancy(userId, vacancyId);

  // Soft delete: set status to CLOSED and deleted_at
  await knex("vacancies").where({ id: vacancyId }).update({
    status: "CLOSED",
    deleted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  return { message: "Vaga removida com sucesso (soft delete)" };
}

export async function listCandidatesForVacancy(userId, vacancyId, filters) {
  const knex = getKnex();

  const { page = 1, limit = 10 } = filters;

  await getOwnedVacancy(userId, vacancyId);

  let query = knex("interests")
    .where({ vacancy_id: vacancyId })
    .join("users", "interests.user_id", "users.id")
    .whereNull("users.deleted_at")
    .select(
      "interests.id",
      "interests.status",
      "interests.created_at as applied_at",
      "interests.updated_at as status_updated_at",
      "users.id as candidate_id",
      "users.email",
      "users.full_name",
      "users.phone",
      "users.avatar_url",
      "users.document_type",
      "users.document_number",
    );

  const countQuery = query
    .clone()
    .clearSelect()
    .clearOrder()
    .count("* as total");
  const [{ total }] = await countQuery;

  const offset = (page - 1) * limit;
  const candidates = await query
    .orderBy("interests.created_at", "desc")
    .limit(limit)
    .offset(offset);

  return {
    candidates,
    pagination: {
      page,
      limit,
      total: Number(total),
      totalPages: Math.ceil(Number(total) / limit),
    },
  };
}

export async function updateCandidateStatus(
  userId,
  vacancyId,
  candidateId,
  status,
) {
  const knex = getKnex();

  await getOwnedVacancy(userId, vacancyId);

  // Check if candidate applied
  const interest = await knex("interests")
    .where({ vacancy_id: vacancyId, user_id: candidateId })
    .first();

  if (!interest) {
    const err = new Error("Candidato não se candidatou a esta vaga");
    err.statusCode = 404;
    throw err;
  }

  await knex("interests").where({ id: interest.id }).update({
    status,
    updated_at: new Date().toISOString(),
  });

  return {
    message: `Candidatura ${status === "ACCEPTED" ? "aceita" : "rejeitada"} com sucesso`,
    application: {
      vacancy_id: vacancyId,
      candidate_id: candidateId,
      status,
    },
  };
}

export async function getCandidateProfile(userId, candidateId) {
  const knex = getKnex();

  // Verify recruiter exists
  const recruiter = await knex("users")
    .where({ id: userId, user_type: "RECRUITER" })
    .whereNull("deleted_at")
    .first();

  if (!recruiter) {
    const err = new Error("Recrutador não encontrado");
    err.statusCode = 404;
    throw err;
  }

  const candidate = await knex("users")
    .where({ id: candidateId, user_type: "CANDIDATE" })
    .whereNull("deleted_at")
    .first(
      "id",
      "email",
      "full_name",
      "phone",
      "avatar_url",
      "document_type",
      "document_number",
      "created_at",
    );

  if (!candidate) {
    const err = new Error("Candidato não encontrado");
    err.statusCode = 404;
    throw err;
  }

  return { candidate };
}
