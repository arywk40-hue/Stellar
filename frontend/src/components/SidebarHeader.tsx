"use client";
import { getRole, logout } from '../lib/auth';
import { useEffect, useState } from 'react';
import Modal from './Modal';
import AuthForm from './AuthForm';

export default function SidebarHeader() {
  const [role, setRole] = useState<string | null>(null);
  const [showDonor, setShowDonor] = useState(false);
  const [showNgo, setShowNgo] = useState(false);
  useEffect(() => { setRole(getRole()); }, []);
  return (
    <div className="header-new">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo-icon">🌍</div>
          <div>
            <h1>GeoLedger</h1>
            <div className="subtitle">Transparent Donations on Stellar Blockchain</div>
          </div>
        </div>
        
        <div className="auth-section">
          {!role ? (
            <div className="auth-buttons">
              <button className="btn-auth btn-donor" onClick={() => setShowDonor(true)}>
                <span className="btn-icon">👤</span>
                <span>Donor Login</span>
              </button>
              <button className="btn-auth btn-ngo" onClick={() => setShowNgo(true)}>
                <span className="btn-icon">🏢</span>
                <span>NGO Login</span>
              </button>
            </div>
          ) : (
            <div className="logged-in-status">
              <div className="status-badge">
                <span className="status-icon">{role === 'donor' ? '👤' : '🏢'}</span>
                <span className="status-text">
                  <span className="status-label">Logged in as</span>
                  <span className="status-role">{role}</span>
                </span>
              </div>
              <button onClick={logout} className="btn-logout">
                <span>Logout</span>
                <span>→</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      <Modal open={showDonor} onClose={() => setShowDonor(false)} title="Donor Login">
        <AuthForm role="donor" />
      </Modal>
      <Modal open={showNgo} onClose={() => setShowNgo(false)} title="NGO Login">
        <AuthForm role="ngo" />
      </Modal>
    </div>
  );
}
