import { SessionInfo } from '@/types';

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 小时

// 验证密码
export function verifyPassword(password: string): boolean {
  const correctPassword = process.env.ACCESS_PASSWORD;
  
  if (!correctPassword) {
    console.error('ACCESS_PASSWORD environment variable is not set');
    return false;
  }
  
  return password === correctPassword;
}

// 创建会话信息
export function createSession(): SessionInfo {
  return {
    authenticated: true,
    expiresAt: Date.now() + SESSION_DURATION,
  };
}

// 验证会话
export function validateSession(session: SessionInfo | null): boolean {
  if (!session || !session.authenticated) {
    return false;
  }
  
  if (session.expiresAt && session.expiresAt < Date.now()) {
    return false;
  }
  
  return true;
}

// 从请求头获取会话信息
export function getSessionFromHeader(authHeader: string | null): SessionInfo | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const token = authHeader.substring(7);
    const session = JSON.parse(Buffer.from(token, 'base64').toString());
    return session;
  } catch {
    return null;
  }
}

// 创建会话令牌
export function createSessionToken(session: SessionInfo): string {
  return Buffer.from(JSON.stringify(session)).toString('base64');
}

