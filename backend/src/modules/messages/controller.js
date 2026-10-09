import * as messageService from './service.js';

export async function listMessages(req, res) {
  const result = await messageService.listMessages(req.user.id);
  res.json(result);
}

export async function createMessage(req, res) {
  const result = await messageService.createMessage(req.user.id, req.validated.body);
  res.status(201).json(result);
}
