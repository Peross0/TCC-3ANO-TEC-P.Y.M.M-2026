import * as userService from './service.js';

export async function uploadAvatar(req, res) {
  if (!req.file) {
    const err = new Error('Nenhum arquivo enviado');
    err.statusCode = 400;
    throw err;
  }

  const result = await userService.updateAvatar(req.user.id, req.file.filename);
  res.json(result);
}

export async function listUsers(req, res) {
  const users = await userService.getUsers();
  res.json(users)
}

export async function getPreferences(req, res) {
  const preferences = await userService.getPreferences(req.user.id);
  res.json({ preferences });
}

export async function updatePreferences(req, res) {
  const preferences = await userService.updatePreferences(req.user.id, req.validated.body);
  res.json({ preferences });
}