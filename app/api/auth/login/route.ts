import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createSession, createSessionToken } from '@/lib/auth';
import { LoginRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    if (verifyPassword(password)) {
      const session = createSession();
      const token = createSessionToken(session);

      return NextResponse.json({
        success: true,
        data: { token, session },
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Incorrect password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

