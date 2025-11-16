'use client';
import { useState, useEffect } from 'react';
import TransactionModal from './TransactionModal';
import { createDonation } from '../lib/api/client';
import { recordDonationOnChain } from '../lib/soroban/contracts';
import { listNGOs, NGOItem } from '../lib/api/client';
import { hasFreighter, connectFreighter } from '../lib/stellar/wallet';

export default function DonationFlow({ selectedLatLng }: { selectedLatLng?: { lat: number; lng: number } }) {
  const [amount, setAmount] = useState(10);
  const [ngoId, setNgoId] = useState(1);
  const [status, setStatus] = useState<'idle' | 'signing' | 'submitted' | 'confirmed' | 'error'>('idle');
  const [showModal, setShowModal] = useState(false);
  const [txHash, setTxHash] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [ngos, setNgos] = useState<NGOItem[]>([]);
  const [loadingNgos, setLoadingNgos] = useState(false);

  const submit = async () => {
    setShowModal(true);
    setError(undefined);
    try {
      setStatus('signing');
      
      // Get wallet info from localStorage
      const walletPublicKey = localStorage.getItem('wallet_public_key');
      const publicKey = walletPublicKey || 'ANON';
      
      if (!walletPublicKey) {
        throw new Error('Please connect your wallet first');
      }
      
      // Call Soroban (placeholder) then persist off-chain
      const onchain = await recordDonationOnChain({
        contractId: process.env.NEXT_PUBLIC_DONATION_REGISTRY_CONTRACT_ID || '',
        donor: publicKey,
        amount,
        ngo_id: ngoId,
        donor_lat: selectedLatLng?.lat || 0,
        donor_lon: selectedLatLng?.lng || 0,
      });
      setTxHash(onchain.txHash);
      setStatus('submitted');
      const donation = await createDonation({
        donor_public_key: publicKey,
        amount: amount,
        ngo_id: ngoId,
        donor_location: selectedLatLng ?? { lat: 0, lng: 0 },
      });
      setStatus('confirmed');
    } catch (e: any) {
      setError(e.message || 'tx-error');
      setStatus('error');
    }
  };

  // respond to external NGO selection
  useEffect(() => {
    function handler(e: Event) {
      const detail: any = (e as CustomEvent).detail;
      if (detail && typeof detail.id === 'number') setNgoId(detail.id);
    }
    window.addEventListener('select-ngo', handler as any);
    return () => window.removeEventListener('select-ngo', handler as any);
  }, []);

  useEffect(() => {
    (async () => { try { setLoadingNgos(true); const data = await listNGOs(); setNgos(data); } catch {} finally { setLoadingNgos(false); } })();
  }, []);

  const ready = Boolean(ngoId && amount > 0 && selectedLatLng);
  
  return (
    <div className="stack">
      <div className="section-header">
        <div className="section-icon">💝</div>
        <div>
          <h3 className="section-title">Make a Donation</h3>
          <p className="section-subtitle">Support verified NGOs with transparent blockchain donations</p>
        </div>
      </div>

      <div className="donation-form">
        <div className="form-group">
          <label htmlFor="ngo-select">
            <span className="label-icon">🏢</span>
            <span>Select NGO Organization</span>
          </label>
          <div className="select-wrapper">
            <select 
              id="ngo-select" 
              className="form-control" 
              value={ngoId} 
              onChange={(e) => setNgoId(parseInt(e.target.value))} 
              disabled={loadingNgos || ngos.length === 0}
            >
              {loadingNgos && <option>Loading NGOs...</option>}
              {!loadingNgos && ngos.length === 0 && <option>No NGOs available</option>}
              {!loadingNgos && ngos.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
            <span className="select-arrow">▼</span>
          </div>
          {ngos.length > 0 && (
            <div className="form-hint">
              💡 Tip: You can also click an NGO card in the NGOs tab
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="amount">
            <span className="label-icon">💰</span>
            <span>Donation Amount</span>
          </label>
          <div className="amount-input-enhanced">
            <div className="amount-input-wrapper">
              <span className="currency-badge">XLM</span>
              <input 
                id="amount" 
                className="form-control amount-field" 
                type="number" 
                min={1} 
                step={0.1} 
                value={amount} 
                onChange={(e) => setAmount(parseFloat(e.target.value))}
                placeholder="Enter amount"
              />
            </div>
            <div className="amount-quick-select">
              <button type="button" onClick={() => setAmount(10)} className={amount === 10 ? 'active' : ''}>10</button>
              <button type="button" onClick={() => setAmount(50)} className={amount === 50 ? 'active' : ''}>50</button>
              <button type="button" onClick={() => setAmount(100)} className={amount === 100 ? 'active' : ''}>100</button>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>
            <span className="label-icon">📍</span>
            <span>Your Location</span>
          </label>
          <div className={`location-preview-enhanced ${selectedLatLng ? 'selected' : ''}`}>
            <div className="location-icon">{selectedLatLng ? '✓' : '🗺️'}</div>
            <div className="location-text">
              {selectedLatLng ? (
                <>
                  <div className="location-coords">{selectedLatLng.lat.toFixed(4)}, {selectedLatLng.lng.toFixed(4)}</div>
                  <div className="location-status">Location selected</div>
                </>
              ) : (
                <>
                  <div className="location-placeholder">Click on the map</div>
                  <div className="location-status">Select your location to continue</div>
                </>
              )}
            </div>
          </div>
        </div>

        <button 
          className="donate-btn-enhanced" 
          onClick={submit} 
          disabled={!ready || status !== 'idle'}
        >
          <span className="btn-content">
            <span className="btn-icon">🚀</span>
            <span className="btn-text">
              {status === 'idle' ? 'Make Donation' : status === 'signing' ? 'Signing...' : 'Processing...'}
            </span>
          </span>
        </button>

        <div className={`status-enhanced status-${status}`}>
          <div className="status-icon-container">
            {status === 'idle' && '💡'}
            {status === 'signing' && '✍️'}
            {status === 'submitted' && '⏳'}
            {status === 'confirmed' && '✅'}
            {status === 'error' && '❌'}
          </div>
          <div className="status-message">
            {status === 'idle' && 'Select NGO, amount, and location to donate'}
            {status === 'signing' && 'Awaiting wallet signature...'}
            {status === 'submitted' && 'Transaction submitted. Waiting for confirmation...'}
            {status === 'confirmed' && 'Donation successful! Transaction confirmed on Stellar.'}
            {status === 'error' && (error || 'Something went wrong. Please try again.')}
          </div>
        </div>
      </div>

      <TransactionModal open={showModal} status={status} hash={txHash} error={error} onClose={() => setShowModal(false)} />
    </div>
  );
}
