// Demo data for GeoLedger demonstrations
// This file contains pre-configured NGOs and demo wallet addresses

export interface DemoNGO {
  id: number;
  name: string;
  wallet_address: string;
  verification_status: 'verified' | 'pending';
  sector: string;
  description: string;
  location: string;
  impact_areas: string[];
  created_at: string;
}

export interface DemoWallet {
  publicKey: string;
  secretKey: string; // For demo only - NEVER use in production!
  balance: string;
  name: string;
  type: 'donor' | 'ngo';
}

// Demo NGOs
export const DEMO_NGOS: DemoNGO[] = [
  {
    id: 1,
    name: 'Save The Ocean Foundation',
    wallet_address: 'GDEMOOCEAN1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    verification_status: 'verified',
    sector: 'Environment',
    description: 'Dedicated to ocean conservation and marine life protection',
    location: 'Mumbai, India',
    impact_areas: ['Ocean Cleanup', 'Marine Conservation', 'Beach Restoration'],
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    name: 'Education For All Initiative',
    wallet_address: 'GDEMOEDU1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    verification_status: 'verified',
    sector: 'Education',
    description: 'Providing quality education to underprivileged children',
    location: 'Delhi, India',
    impact_areas: ['Primary Education', 'Digital Literacy', 'School Infrastructure'],
    created_at: '2024-02-20T14:30:00Z',
  },
  {
    id: 3,
    name: 'Green Earth Initiative',
    wallet_address: 'GDEMOGREEN1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    verification_status: 'verified',
    sector: 'Environment',
    description: 'Fighting climate change through reforestation and sustainable practices',
    location: 'Bangalore, India',
    impact_areas: ['Tree Plantation', 'Carbon Offset', 'Sustainable Farming'],
    created_at: '2024-03-10T09:15:00Z',
  },
  {
    id: 4,
    name: 'Health First Medical Aid',
    wallet_address: 'GDEMOHEALTH1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    verification_status: 'verified',
    sector: 'Healthcare',
    description: 'Providing free medical care to rural communities',
    location: 'Kolkata, India',
    impact_areas: ['Primary Healthcare', 'Medical Camps', 'Emergency Relief'],
    created_at: '2024-04-05T11:45:00Z',
  },
  {
    id: 5,
    name: 'Clean Water Project',
    wallet_address: 'GDEMOWATER1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    verification_status: 'verified',
    sector: 'Water & Sanitation',
    description: 'Ensuring clean drinking water access for all',
    location: 'Chennai, India',
    impact_areas: ['Water Purification', 'Well Construction', 'Sanitation'],
    created_at: '2024-05-12T16:20:00Z',
  },
  {
    id: 6,
    name: 'Women Empowerment Network',
    wallet_address: 'GDEMOWOMEN1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    verification_status: 'verified',
    sector: 'Women Empowerment',
    description: 'Empowering women through skill development and entrepreneurship',
    location: 'Pune, India',
    impact_areas: ['Skill Training', 'Microfinance', 'Leadership Development'],
    created_at: '2024-06-18T13:00:00Z',
  },
  {
    id: 7,
    name: 'Child Welfare Foundation',
    wallet_address: 'GDEMOCHILD1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    verification_status: 'pending',
    sector: 'Child Welfare',
    description: 'Protecting children\'s rights and providing shelter',
    location: 'Hyderabad, India',
    impact_areas: ['Child Protection', 'Nutrition', 'Orphan Care'],
    created_at: '2024-07-22T10:30:00Z',
  },
  {
    id: 8,
    name: 'Animal Rescue League',
    wallet_address: 'GDEMOANIMAL1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    verification_status: 'verified',
    sector: 'Animal Welfare',
    description: 'Rescuing and rehabilitating stray and injured animals',
    location: 'Jaipur, India',
    impact_areas: ['Animal Rescue', 'Veterinary Care', 'Adoption Services'],
    created_at: '2024-08-30T15:45:00Z',
  },
];

// Demo Wallets for Testing
export const DEMO_WALLETS: DemoWallet[] = [
  // Donor Wallets
  {
    publicKey: 'GDEMODONOR1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    secretKey: 'SDEMO_SECRET_DONOR1_DO_NOT_USE_IN_PRODUCTION_ONLY_FOR_DEMO',
    balance: '10000.0000000',
    name: 'Demo Donor #1 - Alex Chen',
    type: 'donor',
  },
  {
    publicKey: 'GDEMODONOR2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    secretKey: 'SDEMO_SECRET_DONOR2_DO_NOT_USE_IN_PRODUCTION_ONLY_FOR_DEMO',
    balance: '5000.0000000',
    name: 'Demo Donor #2 - Maria Garcia',
    type: 'donor',
  },
  {
    publicKey: 'GDEMODONOR3AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    secretKey: 'SDEMO_SECRET_DONOR3_DO_NOT_USE_IN_PRODUCTION_ONLY_FOR_DEMO',
    balance: '15000.0000000',
    name: 'Demo Donor #3 - John Smith',
    type: 'donor',
  },
  // NGO Wallets (matching the NGO wallet addresses)
  {
    publicKey: 'GDEMOOCEAN1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    secretKey: 'SDEMO_SECRET_NGO_OCEAN_DO_NOT_USE_IN_PRODUCTION',
    balance: '2500.0000000',
    name: 'Save The Ocean Foundation',
    type: 'ngo',
  },
  {
    publicKey: 'GDEMOEDU1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    secretKey: 'SDEMO_SECRET_NGO_EDU_DO_NOT_USE_IN_PRODUCTION',
    balance: '3200.0000000',
    name: 'Education For All Initiative',
    type: 'ngo',
  },
  {
    publicKey: 'GDEMOGREEN1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    secretKey: 'SDEMO_SECRET_NGO_GREEN_DO_NOT_USE_IN_PRODUCTION',
    balance: '1800.0000000',
    name: 'Green Earth Initiative',
    type: 'ngo',
  },
  {
    publicKey: 'GDEMOHEALTH1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    secretKey: 'SDEMO_SECRET_NGO_HEALTH_DO_NOT_USE_IN_PRODUCTION',
    balance: '4100.0000000',
    name: 'Health First Medical Aid',
    type: 'ngo',
  },
  {
    publicKey: 'GDEMOWATER1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    secretKey: 'SDEMO_SECRET_NGO_WATER_DO_NOT_USE_IN_PRODUCTION',
    balance: '2900.0000000',
    name: 'Clean Water Project',
    type: 'ngo',
  },
];

// Helper function to get a random demo wallet
export function getRandomDemoWallet(): DemoWallet {
  return DEMO_WALLETS[Math.floor(Math.random() * DEMO_WALLETS.length)];
}

// Helper function to get a demo wallet by public key
export function getDemoWallet(publicKey: string): DemoWallet | null {
  return DEMO_WALLETS.find(w => w.publicKey === publicKey) || null;
}

// Helper function to check if a public key is a demo wallet
export function isDemoWallet(publicKey: string): boolean {
  return DEMO_WALLETS.some(w => w.publicKey === publicKey);
}

// Helper function to get a demo NGO by wallet address
export function getDemoNGO(walletAddress: string): DemoNGO | null {
  return DEMO_NGOS.find(ngo => ngo.wallet_address === walletAddress) || null;
}

// Helper function to check if a wallet address is a demo NGO
export function isDemoNGO(walletAddress: string): boolean {
  return DEMO_NGOS.some(ngo => ngo.wallet_address === walletAddress);
}

// Demo donation data
export interface DemoDonation {
  id: number;
  donor_wallet: string;
  ngo_id: number;
  amount: string;
  currency: string;
  status: 'completed' | 'pending' | 'verified';
  transaction_hash: string;
  latitude: number;
  longitude: number;
  message?: string;
  created_at: string;
}

export const DEMO_DONATIONS: DemoDonation[] = [
  {
    id: 1,
    donor_wallet: 'GDEMODONOR1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    ngo_id: 1,
    amount: '500.0000000',
    currency: 'XLM',
    status: 'completed',
    transaction_hash: 'demo_tx_hash_001_save_ocean',
    latitude: 19.0760,
    longitude: 72.8777,
    message: 'Keep up the great work!',
    created_at: '2024-10-15T10:30:00Z',
  },
  {
    id: 2,
    donor_wallet: 'GDEMODONOR2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    ngo_id: 2,
    amount: '1000.0000000',
    currency: 'XLM',
    status: 'completed',
    transaction_hash: 'demo_tx_hash_002_education',
    latitude: 28.7041,
    longitude: 77.1025,
    message: 'Education is the key to future',
    created_at: '2024-10-20T14:15:00Z',
  },
  {
    id: 3,
    donor_wallet: 'GDEMODONOR1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    ngo_id: 3,
    amount: '750.0000000',
    currency: 'XLM',
    status: 'verified',
    transaction_hash: 'demo_tx_hash_003_green_earth',
    latitude: 12.9716,
    longitude: 77.5946,
    message: 'Planting trees for our future',
    created_at: '2024-10-25T09:45:00Z',
  },
  {
    id: 4,
    donor_wallet: 'GDEMODONOR3AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    ngo_id: 4,
    amount: '2000.0000000',
    currency: 'XLM',
    status: 'completed',
    transaction_hash: 'demo_tx_hash_004_health',
    latitude: 22.5726,
    longitude: 88.3639,
    message: 'Healthcare for all',
    created_at: '2024-11-01T11:00:00Z',
  },
  {
    id: 5,
    donor_wallet: 'GDEMODONOR2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    ngo_id: 5,
    amount: '850.0000000',
    currency: 'XLM',
    status: 'completed',
    transaction_hash: 'demo_tx_hash_005_water',
    latitude: 13.0827,
    longitude: 80.2707,
    message: 'Clean water is a basic right',
    created_at: '2024-11-05T16:30:00Z',
  },
];

// In-memory wallet balances (updated as donations are made in demo mode)
export const DEMO_WALLET_BALANCES: Map<string, number> = new Map([
  ['GDEMODONOR1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 10000.0],
  ['GDEMODONOR2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 5000.0],
  ['GDEMODONOR3AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 15000.0],
  ['GDEMOOCEAN1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 2500.0],
  ['GDEMOEDU1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 3200.0],
  ['GDEMOGREEN1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 1800.0],
  ['GDEMOHEALTH1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 4100.0],
  ['GDEMOWATER1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 2900.0],
]);

export default {
  DEMO_NGOS,
  DEMO_WALLETS,
  DEMO_DONATIONS,
  DEMO_WALLET_BALANCES,
  getRandomDemoWallet,
  getDemoWallet,
  isDemoWallet,
  getDemoNGO,
  isDemoNGO,
};
