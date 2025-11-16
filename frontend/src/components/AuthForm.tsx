"use client";
import { useState } from 'react';
import { startLogin, verifyLogin, Role } from '../lib/auth';

export default function AuthForm({ role }: { role: Role }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [phase, setPhase] = useState<'start'|'verify'>('start');
  const [serverCode, setServerCode] = useState<string>('');
  const [status, setStatus] = useState('');

  async function onStart() {
    setStatus('sending');
    try { const r = await startLogin(email, role); setServerCode(r.code || ''); setPhase('verify'); setStatus('sent'); } catch { setStatus('error'); }
  }
  async function onVerify() {
    setStatus('verifying');
    try { await verifyLogin(email, role, code); setStatus('logged-in'); } catch { setStatus('error'); }
  }

  return (
    <div className="auth-card">
      <div className="auth-title">{role.toUpperCase()} Login</div>
      {phase === 'start' && (
        <div className="stack">
          <input className="form-control" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <div className="auth-actions">
            <button className="connect-btn" onClick={onStart} disabled={!email}>Send Code</button>
          </div>
          {status && <div className="muted" style={{ fontSize:12 }}>{status} {serverCode && `(demo code: ${serverCode})`}</div>}
        </div>
      )}
      {phase === 'verify' && (
        <div className="stack">
          <input className="form-control" placeholder="Code" value={code} onChange={e => setCode(e.target.value)} />
          <div className="auth-actions">
            <button className="connect-btn" onClick={onVerify} disabled={!code}>Verify</button>
          </div>
          {status && <div className="muted" style={{ fontSize:12 }}>{status}</div>}
        </div>
      )}
    </div>
  );
}
