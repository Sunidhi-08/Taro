import crypto from 'node:crypto';
import { NextRequest } from 'next/server';
import { findUserById } from './store';

const SESSION_SECRET = process.env.SESSION_SECRET || 'taro-dev-secret';

function base64UrlEncode(value: string | Buffer) {
  return Buffer.isBuffer(value)
    ? value.toString('base64url')
    : Buffer.from(value).toString('base64url');
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function signPayload(payload: string) {
  return crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
}

export function createSessionToken(userId: string) {
  const payload = base64UrlEncode(JSON.stringify({ sub: userId, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 }));
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined) {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = signPayload(payload);
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    return null;
  }

  try {
    const data = JSON.parse(base64UrlDecode(payload));
    return typeof data?.sub === 'string' ? data.sub : null;
  } catch {
    return null;
  }
}

export async function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  const userId = verifySessionToken(token);
  if (!userId) {
    return null;
  }

  return findUserById(userId);
}

export function clearSessionCookie() {
  return {
    name: 'session',
    value: '',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  };
}
