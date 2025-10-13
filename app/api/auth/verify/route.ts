import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromHeader, validateSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const session = getSessionFromHeader(authHeader);

  if (validateSession(session)) {
    return NextResponse.json({ success: true, data: { authenticated: true } });
  } else {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

