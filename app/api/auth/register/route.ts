import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { createSessionToken } from '@/lib/auth';
import { createUser, findUserByEmail } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password || password.length < 6) {
      return NextResponse.json({ error: 'Use a valid email and password with at least 6 characters.' }, { status: 400 });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const passwordHash = await hash(password, 10);
    const user = await createUser(email, passwordHash);
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
  } catch (error) {
    console.error('Registration failed:', error);
    return NextResponse.json({ error: 'Registration failed. Check the server and database logs.' }, { status: 500 });
  }
}
