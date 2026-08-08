import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const correctPassword = process.env.ADMIN_PASSWORD || 'admin';

    if (password !== correctPassword) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    // Sign JWT token
    const token = await signToken({ role: 'admin' });

    // Set cookie
    const response = NextResponse.json({ success: true, message: 'Logged in successfully' });
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'An error occurred during login' }, { status: 500 });
  }
}
