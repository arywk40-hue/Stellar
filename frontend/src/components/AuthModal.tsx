"use client";
import React, { useState } from 'react';

type Props = { onClose?: () => void };

export default function AuthModal({ onClose }: Props) {
  const [step, setStep] = useState<'choose'|'email'|'verify'|'done'>('choose');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function sendOtp() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/otp/send', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ email }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'failed');
      // if previewUrl or code present, show message (dev)
      if (j.code) setMessage(`Dev code: ${j.code}`);
      if (j.previewUrl) setMessage(`Preview URL: ${j.previewUrl}`);
      setStep('verify');
    } catch (e:any) {
      setMessage(String(e.message || e));
    } finally { setLoading(false); }
  }

  async function verifyOtp() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/otp/verify', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ email, code }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'failed');
      setStep('done');
      setMessage('Verified');
    } catch (e:any) {
      setMessage(String(e.message || e));
    } finally { setLoading(false); }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <button className="modal-close" onClick={() => onClose && onClose()}>×</button>
        {step === 'choose' && (
          <div>
            <h3>Sign in</h3>
            <div style={{ display:'flex', gap:8, marginTop:12 }}>
              <button className="btn" onClick={() => setStep('email')}>Email</button>
              <button className="btn" onClick={() => alert('Apple login stub')}>Apple</button>
              <button className="btn" onClick={() => alert('Google login stub')}>Google</button>
            </div>
          </div>
        )}
        {step === 'email' && (
          <div>
            <h3>Enter your email</h3>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />
            <div style={{ marginTop:12 }}>
              <button className="btn" onClick={sendOtp} disabled={loading}>Send code</button>
              <button className="btn" onClick={() => setStep('choose')}>Back</button>
            </div>
            {message && <div style={{ marginTop:8 }}>{message}</div>}
          </div>
        )}
        {step === 'verify' && (
          <div>
            <h3>Enter code</h3>
            <input value={code} onChange={e=>setCode(e.target.value)} placeholder="6-digit code" />
            <div style={{ marginTop:12 }}>
              <button className="btn" onClick={verifyOtp} disabled={loading}>Verify</button>
              <button className="btn" onClick={() => setStep('email')}>Back</button>
            </div>
            {message && <div style={{ marginTop:8 }}>{message}</div>}
          </div>
        )}
        {step === 'done' && (
          <div>
            <h3>Signed in</h3>
            <div style={{ marginTop:12 }}>
              <button className="btn" onClick={() => onClose && onClose()}>Close</button>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .modal-backdrop{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.4)}
        .modal{background:#fff;padding:20px;border-radius:8px;min-width:320px}
        .modal-close{position:absolute;right:12px;top:8px;border:none;background:transparent;font-size:18px}
        input{width:100%;padding:8px;margin-top:8px}
      `}</style>
    </div>
  );
}
