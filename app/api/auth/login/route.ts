import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { createSessionToken } from '@/lib/auth';
import { findUserByEmail } from '@/lib/store';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  const isValid = await compare(password, user.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  const token = createSessionToken(user.id);
  const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email } });
  response.cookies.set({
    name: 'session',
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
