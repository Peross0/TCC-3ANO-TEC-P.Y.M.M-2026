import { randomInt } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signToken(payload, options = {}) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    ...options,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

export function generatePasswordResetCode() {
  return randomInt(100000, 1000000).toString();
}

export function createAuthTokens(user) {
  const payload = {
    sub: user.id,
    type: user.user_type,
  };
  const token = signToken(payload);
  return { token };
}