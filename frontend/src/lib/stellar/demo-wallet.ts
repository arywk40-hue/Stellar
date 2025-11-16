// Demo Wallet Simulator for GeoLedger Demonstrations
// This simulates Freighter wallet functionality for demos without requiring the extension

export interface DemoWalletAccount {
  publicKey: string;
  secretKey: string;
  balance: string;
  name: string;
}

// Pre-configured demo accounts
export const DEMO_ACCOUNTS: DemoWalletAccount[] = [
  {
    publicKey: 'GDEMODONOR1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    secretKey: 'SDEMO_SECRET_DONOR1_DO_NOT_USE_IN_PRODUCTION',
    balance: '10000.0000000',
    name: 'Demo Donor #1',
  },
  {
    publicKey: 'GDEMODONOR2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    secretKey: 'SDEMO_SECRET_DONOR2_DO_NOT_USE_IN_PRODUCTION',
    balance: '5000.0000000',
    name: 'Demo Donor #2',
  },
  {
    publicKey: 'GDEMODONOR3AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    secretKey: 'SDEMO_SECRET_DONOR3_DO_NOT_USE_IN_PRODUCTION',
    balance: '15000.0000000',
    name: 'Demo Donor #3',
  },
];

// Current demo wallet state
let currentDemoAccount: DemoWalletAccount | null = null;
let demoModeEnabled = false;

// Enable demo mode
export function enableDemoMode() {
  demoModeEnabled = true;
  console.log('🎭 Demo mode enabled - Using simulated wallet');
}

// Disable demo mode
export function disableDemoMode() {
  demoModeEnabled = false;
  currentDemoAccount = null;
  console.log('🎭 Demo mode disabled');
}

// Check if demo mode is active
export function isDemoMode(): boolean {
  return demoModeEnabled;
}

// Get available demo accounts
export function getDemoAccounts(): DemoWalletAccount[] {
  return DEMO_ACCOUNTS;
}

// Connect to demo wallet (simulates Freighter connection)
export async function connectDemoWallet(accountIndex: number = 0): Promise<{
  publicKey: string;
  balance: string;
  name: string;
}> {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      if (accountIndex < 0 || accountIndex >= DEMO_ACCOUNTS.length) {
        accountIndex = 0;
      }
      
      currentDemoAccount = DEMO_ACCOUNTS[accountIndex];
      
      console.log(`🎭 Connected to demo wallet: ${currentDemoAccount.name}`);
      console.log(`📍 Public Key: ${currentDemoAccount.publicKey}`);
      console.log(`💰 Balance: ${currentDemoAccount.balance} XLM`);
      
      resolve({
        publicKey: currentDemoAccount.publicKey,
        balance: currentDemoAccount.balance,
        name: currentDemoAccount.name,
      });
    }, 500);
  });
}

// Get current demo account
export function getCurrentDemoAccount(): DemoWalletAccount | null {
  return currentDemoAccount;
}

// Sign transaction (simulated)
export async function signDemoTransaction(xdr: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!currentDemoAccount) {
      reject(new Error('No demo wallet connected'));
      return;
    }
    
    // Simulate user confirmation dialog
    setTimeout(() => {
      console.log('🎭 Demo transaction signed');
      console.log('📝 XDR:', xdr.substring(0, 50) + '...');
      
      // Return a simulated signed XDR
      const signedXdr = `DEMO_SIGNED_${xdr.substring(0, 20)}_${Date.now()}`;
      resolve(signedXdr);
    }, 800);
  });
}

// Get demo wallet balance
export async function getDemoBalance(publicKey: string): Promise<string> {
  const account = DEMO_ACCOUNTS.find(acc => acc.publicKey === publicKey);
  return account ? account.balance : '0.0000000';
}

// Simulate a donation transaction
export async function simulateDonation(
  recipientAddress: string,
  amount: string,
  message?: string
): Promise<{
  success: boolean;
  transactionHash: string;
  timestamp: string;
}> {
  return new Promise((resolve, reject) => {
    if (!currentDemoAccount) {
      reject(new Error('No demo wallet connected'));
      return;
    }
    
    const donationAmount = parseFloat(amount);
    const currentBalance = parseFloat(currentDemoAccount.balance);
    
    if (donationAmount > currentBalance) {
      reject(new Error('Insufficient balance'));
      return;
    }
    
    // Simulate transaction processing
    setTimeout(() => {
      // Update demo balance
      currentDemoAccount!.balance = (currentBalance - donationAmount).toFixed(7);
      
      const txHash = `demo_tx_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      console.log('🎭 Demo donation successful!');
      console.log(`💸 Amount: ${amount} XLM`);
      console.log(`📫 Recipient: ${recipientAddress}`);
      console.log(`🔗 Transaction Hash: ${txHash}`);
      if (message) console.log(`💬 Message: ${message}`);
      console.log(`💰 New Balance: ${currentDemoAccount!.balance} XLM`);
      
      resolve({
        success: true,
        transactionHash: txHash,
        timestamp: new Date().toISOString(),
      });
    }, 1500);
  });
}

// Disconnect demo wallet
export function disconnectDemoWallet() {
  currentDemoAccount = null;
  console.log('🎭 Demo wallet disconnected');
}

// Check if a public key is a demo account
export function isDemoAccount(publicKey: string): boolean {
  return DEMO_ACCOUNTS.some(acc => acc.publicKey === publicKey);
}

// Generate demo transaction history
export function getDemoTransactionHistory() {
  if (!currentDemoAccount) return [];
  
  return [
    {
      id: 'demo_tx_001',
      type: 'donation',
      amount: '500.0000000',
      recipient: 'Save The Ocean Foundation',
      recipientAddress: 'GDEMOOCEAN1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      timestamp: '2024-11-01T10:30:00Z',
      status: 'completed',
      message: 'Keep up the great work!',
    },
    {
      id: 'demo_tx_002',
      type: 'donation',
      amount: '1000.0000000',
      recipient: 'Education For All Initiative',
      recipientAddress: 'GDEMOEDU1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      timestamp: '2024-11-05T14:15:00Z',
      status: 'completed',
      message: 'Education is the key to future',
    },
    {
      id: 'demo_tx_003',
      type: 'donation',
      amount: '750.0000000',
      recipient: 'Green Earth Initiative',
      recipientAddress: 'GDEMOGREEN1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      timestamp: '2024-11-10T09:45:00Z',
      status: 'completed',
      message: 'Planting trees for our future',
    },
  ];
}

export default {
  enableDemoMode,
  disableDemoMode,
  isDemoMode,
  getDemoAccounts,
  connectDemoWallet,
  getCurrentDemoAccount,
  signDemoTransaction,
  getDemoBalance,
  simulateDonation,
  disconnectDemoWallet,
  isDemoAccount,
  getDemoTransactionHistory,
};
