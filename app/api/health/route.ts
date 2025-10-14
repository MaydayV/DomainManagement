import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromHeader, validateSession } from '@/lib/auth';
import { checkKVHealth } from '@/lib/kv-health';

// KV 健康检查端点
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const session = getSessionFromHeader(authHeader);

  if (!validateSession(session)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const healthResult = await checkKVHealth();
    
    return NextResponse.json({
      success: true,
      data: healthResult,
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
