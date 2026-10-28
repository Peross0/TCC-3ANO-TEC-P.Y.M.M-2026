import * as authService from "./service.js";

export async function register(req, res) {
  const result = await authService.registerUser(req.validated.body);
  res.status(201).json(result);
}

export async function login(req, res) {
  const { email, password } = req.validated.body;
  const result = await authService.loginUser(email, password);
  res.json(result);
}

export async function forgotPassword(req, res) {
  const { email } = req.validated.body;
  const result = await authService.forgotPassword(email, req.ip);
  res.json(result);
}

export async function resetPassword(req, res) {
  const { email, code, password } = req.validated.body;
  const result = await authService.resetPassword(email, code, password);
  res.json(result);
}

export async function changePassword(req, res) {
  const { current_password, new_password } = req.validated.body;
  const result = await authService.changePassword(req.user.id, current_password, new_password);
  res.json(result);
}

export async function me(req, res) {
  const result = await authService.getMe(req.user.id);
  res.json(result);
}
