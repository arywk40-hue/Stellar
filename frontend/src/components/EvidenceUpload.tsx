"use client";
import { useState } from 'react';

export default function EvidenceUpload() {
  const [donationId, setDonationId] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');

  async function upload() {
    setStatus('uploading');
    try {
      const res = await fetch('/api/evidence', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ donation_id: parseInt(donationId), content }) 
      });
      if (!res.ok) { setStatus('error'); return; }
      const data = await res.json();
      const upd = await fetch(`/api/donations/${donationId}/evidence`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ evidence_url: data.url }) 
      });
      setStatus(upd.ok ? 'done' : 'error');
      if (upd.ok) {
        setTimeout(() => {
          setDonationId('');
          setContent('');
          setStatus('idle');
        }, 3000);
      }
    } catch { setStatus('error'); }
  }

  const canUpload = donationId && content && status !== 'uploading';

  return (
    <div className="evidence-upload-container">
      <div className="section-header">
        <div className="section-icon">📎</div>
        <div>
          <h3 className="section-title">Quick Evidence Upload</h3>
          <p className="section-subtitle">Legacy tool - NGOs should use Dashboard for better experience</p>
        </div>
      </div>

      <div className="evidence-form">
        <div className="form-group">
          <label htmlFor="donation-id">
            <span className="label-icon">🔢</span>
            <span>Donation ID</span>
          </label>
          <input 
            id="donation-id"
            className="form-control" 
            placeholder="Enter donation ID (e.g., 123)" 
            value={donationId} 
            onChange={e => setDonationId(e.target.value)}
            type="number"
          />
        </div>

        <div className="form-group">
          <label htmlFor="evidence-content">
            <span className="label-icon">📝</span>
            <span>Evidence Details</span>
          </label>
          <textarea 
            id="evidence-content"
            className="form-control evidence-textarea" 
            placeholder="Describe the impact, attach photos URLs, or provide documentation details..."
            value={content} 
            onChange={e => setContent(e.target.value)}
            rows={6}
          />
          <div className="form-hint">
            💡 Provide detailed information about how the donation was used
          </div>
        </div>

        <button 
          className="evidence-upload-btn" 
          onClick={upload} 
          disabled={!canUpload}
        >
          <span className="btn-content">
            <span className="btn-icon">{status === 'uploading' ? '⏳' : '📤'}</span>
            <span className="btn-text">
              {status === 'uploading' ? 'Uploading...' : 'Upload Evidence'}
            </span>
          </span>
        </button>

        {status !== 'idle' && (
          <div className={`status-enhanced status-${status}`}>
            <div className="status-icon-container">
              {status === 'uploading' && '⏳'}
              {status === 'done' && '✅'}
              {status === 'error' && '❌'}
            </div>
            <div className="status-message">
              {status === 'uploading' && 'Uploading evidence to IPFS...'}
              {status === 'done' && 'Evidence uploaded successfully! Donation updated.'}
              {status === 'error' && 'Upload failed. Please check the donation ID and try again.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}