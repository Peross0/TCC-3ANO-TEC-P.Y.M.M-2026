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

export async function listDocuments(req, res) {
  const documents = await userService.getDocuments(req.user.id);
  res.json({ documents });
}

export async function uploadDocument(req, res) {
  if (!req.file) {
    const err = new Error('Selecione um arquivo não vazio para anexar.');
    err.statusCode = 400;
    throw err;
  }

  const document = await userService.saveDocument(req.user.id, req.file);
  res.status(201).json({ document });
}

export async function downloadDocument(req, res) {
  const document = await userService.getDocumentFile(req.user.id, req.validated.params.documentId);
  res.set({
    'Cache-Control': 'private, no-store',
    'Content-Security-Policy': 'sandbox',
    'Content-Type': 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
  });
  res.download(document.filePath, document.original_name);
}

export async function deleteDocument(req, res) {
  await userService.deleteDocument(req.user.id, req.validated.params.documentId);
  res.json({ message: 'Documento excluído com sucesso.' });
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