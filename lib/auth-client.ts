export function readAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export function writeAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

export function clearAuthToken(): void {
  localStorage.removeItem('auth_token');
}

export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  try {
    const session = JSON.parse(atob(token));
    if (!session?.authenticated) return false;
    if (session.expiresAt && session.expiresAt < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

export function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}
