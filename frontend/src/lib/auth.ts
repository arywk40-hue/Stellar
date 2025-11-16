export type Role = 'donor' | 'ngo';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

export async function startLogin(email: string, role: Role) {
  const res = await fetch(`${API_BASE}/api/auth/start`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, role }) });
  if (!res.ok) throw new Error('start-failed');
  return res.json();
}

export async function verifyLogin(email: string, role: Role, code: string) {
  const res = await fetch(`${API_BASE}/api/auth/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, role, code }) });
  if (!res.ok) throw new Error('verify-failed');
  const data = await res.json();
  if (typeof window !== 'undefined') {
    localStorage.setItem('geoledger_token', data.token);
    localStorage.setItem('geoledger_role', role);
    localStorage.setItem('geoledger_email', email);
  }
  return data;
}

export function getRole(): Role | null {
  if (typeof window === 'undefined') return null;
  return (localStorage.getItem('geoledger_role') as Role) || null;
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('geoledger_token');
  localStorage.removeItem('geoledger_role');
  localStorage.removeItem('geoledger_email');
  window.location.href = '/';
}