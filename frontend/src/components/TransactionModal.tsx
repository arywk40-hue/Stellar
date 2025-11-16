'use client';
import React from 'react';

interface Props {
  open: boolean;
  status: 'idle' | 'signing' | 'submitted' | 'confirmed' | 'error';
  hash?: string;
  error?: string;
  onClose: () => void;
}

export default function TransactionModal({ open, status, hash, error, onClose }: Props) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', padding: 24, width: 360, borderRadius: 8 }}>
        <h3>Transaction</h3>
        <div>Status: {status}</div>
        {hash && <div>Hash: <code>{hash.slice(0, 12)}...</code></div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button onClick={onClose} style={{ marginTop: 12 }}>Close</button>
      </div>
    </div>
  );
}
