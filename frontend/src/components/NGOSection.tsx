"use client";
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { listNGOs, createNGO, NGOItem } from '../lib/api/client';
import NGODetailsModal from './NGODetailsModal';

const ngoSchema = z.object({ name: z.string().min(2), wallet_address: z.string().min(10), sector: z.string().optional() });

export default function NGOSection() {
  const [ngos, setNgos] = useState<NGOItem[]>([]);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState<{ name: string; wallet_address: string; sector?: string }>({ name: '', wallet_address: '' });
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNGO, setSelectedNGO] = useState<NGOItem | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  async function load() {
    try { const data = await listNGOs(); setNgos(data); } catch {}
  }
  useEffect(() => { load(); const id = setInterval(load, 10000); return () => clearInterval(id); }, []);

  async function submit(e: any) {
    e.preventDefault();
    const parsed = ngoSchema.safeParse(form);
    if (!parsed.success) { setErrors(parsed.error.issues.map(i => i.message)); return; }
    setErrors([]); setLoading(true);
  try { await createNGO(parsed.data as { name: string; wallet_address: string; sector?: string }); setForm({ name: '', wallet_address: '' }); load(); }
    catch { setErrors(['failed']); }
    finally { setLoading(false); }
  }

  function selectNGO(ngo: NGOItem, e: React.MouseEvent) {
    // Check if it's a right-click or cmd+click to open details
    if (e.metaKey || e.ctrlKey || e.button === 2) {
      setSelectedNGO(ngo);
      setShowDetailsModal(true);
    } else {
      // Normal click - select for donation
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('select-ngo', { detail: { id: ngo.id } }));
      }
    }
  }

  function openNGODetails(ngo: NGOItem) {
    setSelectedNGO(ngo);
    setShowDetailsModal(true);
  }

  const filtered = ngos.filter(n => n.name.toLowerCase().includes(query.toLowerCase()) || (n.sector||'').toLowerCase().includes(query.toLowerCase()))
  return <div className="stack">
    <h3>Verified NGOs</h3>
    <input className="search-input" placeholder="Search by name or sector" value={query} onChange={e => setQuery(e.target.value)} />
    <div className="ngo-list" style={{ maxHeight: 220, overflow: 'auto' }}>
      {filtered.length === 0 && <div className="muted" style={{ fontSize: 12 }}>No NGOs yet.</div>}
      {filtered.map(n => (
        <div key={n.id} className="ngo-card" onClick={(e) => selectNGO(n, e)}>
          <div className="ngo-card-header">
            <div className="ngo-name">{n.name}</div>
            <button 
              className="view-details-btn"
              onClick={(e) => { e.stopPropagation(); openNGODetails(n); }}
              title="View donations and updates"
            >
              👁️
            </button>
          </div>
          {n.sector && <div className="ngo-sector">{n.sector}</div>}
          <div className="ngo-impact" title={n.wallet_address}>{n.wallet_address.slice(0,6)}...{n.wallet_address.slice(-6)}</div>
          <div style={{ marginTop:8 }}>
            <span className={`badge ${n.verification_status==='verified' ? 'verified':'pending'}`}>{n.verification_status}</span>
          </div>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 8, padding: 12, background: 'var(--gray-100)', borderRadius: 8 }}>
      <h4 style={{ marginBottom: 8 }}>NGO Registration</h4>
      <form onSubmit={submit} className="stack">
        <input className="form-control" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <input className="form-control" placeholder="Wallet Address" value={form.wallet_address} onChange={e => setForm(f => ({ ...f, wallet_address: e.target.value }))} />
        <input className="form-control" placeholder="Sector (optional)" value={form.sector || ''} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))} />
        <button className="connect-btn" disabled={loading} type="submit">Register NGO</button>
      </form>
      {errors.length > 0 && <div style={{ color: 'crimson', fontSize: 12, marginTop: 6 }}>{errors.join(', ')}</div>}
    </div>
    
    <NGODetailsModal 
      ngo={selectedNGO} 
      open={showDetailsModal} 
      onClose={() => setShowDetailsModal(false)} 
    />
  </div>;
}
