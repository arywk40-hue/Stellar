"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  WalletInfo, 
  loadWalletInfo, 
  saveWalletInfo, 
  disconnectWallet as disconnectWalletUtil,
  getWalletBalance 
} from '../lib/stellar/wallet';

interface WalletContextType {
  connected: boolean;
  walletInfo: WalletInfo | null;
  balance: string;
  connecting: boolean;
  setWalletInfo: (info: WalletInfo | null) => void;
  setConnected: (connected: boolean) => void;
  refreshBalance: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [walletInfo, setWalletInfoState] = useState<WalletInfo | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [connecting, setConnecting] = useState(false);

  // Load wallet on mount
  useEffect(() => {
    const saved = loadWalletInfo();
    if (saved) {
      setWalletInfoState(saved);
      setConnected(true);
      loadBalance(saved.publicKey);
    }
  }, []);

  // Refresh balance periodically
  useEffect(() => {
    if (connected && walletInfo) {
      const interval = setInterval(() => {
        loadBalance(walletInfo.publicKey);
      }, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [connected, walletInfo]);

  async function loadBalance(publicKey: string) {
    try {
      const bal = await getWalletBalance(publicKey);
      setBalance(bal);
    } catch (err) {
      console.error('Failed to load balance:', err);
    }
  }

  async function refreshBalance() {
    if (walletInfo) {
      await loadBalance(walletInfo.publicKey);
    }
  }

  function setWalletInfo(info: WalletInfo | null) {
    setWalletInfoState(info);
    if (info) {
      setConnected(true);
      saveWalletInfo(info);
      loadBalance(info.publicKey);
    } else {
      setConnected(false);
      setBalance('0');
    }
  }

  function disconnect() {
    disconnectWalletUtil();
    setWalletInfoState(null);
    setConnected(false);
    setBalance('0');
  }

  const value: WalletContextType = {
    connected,
    walletInfo,
    balance,
    connecting,
    setWalletInfo,
    setConnected,
    refreshBalance,
    disconnect,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
