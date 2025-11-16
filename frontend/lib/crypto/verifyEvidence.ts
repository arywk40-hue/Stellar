/**
 * Evidence Verification Utilities
 * 
 * Verify tamper-proof evidence by comparing IPFS CID hashes
 * with on-chain stored hashes in Soroban smart contract.
 */

import { hashCID, verifyHash } from './hashUtils';

interface Evidence {
  project_id: number;
  evidence_hash: string; // Hex-encoded hash from contract
  timestamp: number;
  issuer: string;
}

interface VerificationResult {
  isValid: boolean;
  cid: string;
  computedHash: string;
  onChainHash: string;
  evidence?: Evidence;
  error?: string;
}

/**
 * Verify evidence authenticity
 * 
 * Workflow:
 * 1. Fetch evidence data from Soroban contract
 * 2. Retrieve file from IPFS using CID
 * 3. Recompute SHA-256 hash from CID
 * 4. Compare with stored on-chain hash
 * 
 * @param projectId - Project ID
 * @param evidenceIndex - Evidence index in contract
 * @param cid - IPFS CID to verify
 * @param contractAddress - Evidence contract address
 * @returns VerificationResult with validation status
 */
export async function verifyEvidence(
  projectId: number,
  evidenceIndex: number,
  cid: string,
  contractAddress: string
): Promise<VerificationResult> {
  try {
    // Step 1: Fetch evidence from Soroban contract
    const evidence = await getEvidenceFromContract(
      projectId,
      evidenceIndex,
      contractAddress
    );

    if (!evidence) {
      return {
        isValid: false,
        cid,
        computedHash: '',
        onChainHash: '',
        error: 'Evidence not found on-chain',
      };
    }

    // Step 2: Recompute hash from CID
    const computedHash = await hashCID(cid);

    // Step 3: Compare hashes
    const isValid = verifyHash(computedHash, evidence.evidence_hash);

    return {
      isValid,
      cid,
      computedHash,
      onChainHash: evidence.evidence_hash,
      evidence,
      error: isValid ? undefined : 'Hash mismatch - evidence may be tampered',
    };
  } catch (error: any) {
    console.error('Verification error:', error);
    return {
      isValid: false,
      cid,
      computedHash: '',
      onChainHash: '',
      error: error.message || 'Verification failed',
    };
  }
}

/**
 * Verify evidence by fetching file from IPFS
 * 
 * @param projectId - Project ID
 * @param evidenceIndex - Evidence index
 * @param contractAddress - Contract address
 * @returns VerificationResult
 */
export async function verifyEvidenceFromIPFS(
  projectId: number,
  evidenceIndex: number,
  contractAddress: string
): Promise<VerificationResult> {
  try {
    // Step 1: Get evidence from contract (includes CID in metadata)
    const evidence = await getEvidenceFromContract(
      projectId,
      evidenceIndex,
      contractAddress
    );

    if (!evidence) {
      return {
        isValid: false,
        cid: '',
        computedHash: '',
        onChainHash: '',
        error: 'Evidence not found',
      };
    }

    // Step 2: Fetch CID from evidence metadata
    // NOTE: This assumes you store CID in contract metadata
    // If not, you need to pass CID separately
    const cid = await getCIDFromEvidence(projectId, evidenceIndex);

    // Step 3: Verify file exists on IPFS
    const ipfsExists = await checkIPFSFile(cid);
    if (!ipfsExists) {
      return {
        isValid: false,
        cid,
        computedHash: '',
        onChainHash: evidence.evidence_hash,
        evidence,
        error: 'File not found on IPFS',
      };
    }

    // Step 4: Recompute hash and verify
    const computedHash = await hashCID(cid);
    const isValid = verifyHash(computedHash, evidence.evidence_hash);

    return {
      isValid,
      cid,
      computedHash,
      onChainHash: evidence.evidence_hash,
      evidence,
      error: isValid ? undefined : 'Hash mismatch',
    };
  } catch (error: any) {
    return {
      isValid: false,
      cid: '',
      computedHash: '',
      onChainHash: '',
      error: error.message,
    };
  }
}

/**
 * Batch verify multiple evidence items
 * 
 * @param projectId - Project ID
 * @param cids - Array of CIDs to verify
 * @param contractAddress - Contract address
 * @returns Array of verification results
 */
export async function batchVerifyEvidence(
  projectId: number,
  cids: Array<{ evidenceIndex: number; cid: string }>,
  contractAddress: string
): Promise<VerificationResult[]> {
  const verifications = cids.map(({ evidenceIndex, cid }) =>
    verifyEvidence(projectId, evidenceIndex, cid, contractAddress)
  );

  return Promise.all(verifications);
}

/**
 * Check if IPFS file exists and is accessible
 * 
 * @param cid - IPFS CID
 * @returns boolean - True if file exists
 */
async function checkIPFSFile(cid: string): Promise<boolean> {
  try {
    // Try to fetch file metadata from IPFS gateway
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`, {
      method: 'HEAD',
    });

    return response.ok;
  } catch (error) {
    console.error('IPFS check error:', error);
    return false;
  }
}

/**
 * Get evidence from Soroban contract
 * 
 * NOTE: Replace with actual Soroban SDK integration
 * 
 * @param projectId - Project ID
 * @param evidenceIndex - Evidence index
 * @param contractAddress - Contract address
 * @returns Evidence data
 */
async function getEvidenceFromContract(
  projectId: number,
  evidenceIndex: number,
  contractAddress: string
): Promise<Evidence | null> {
  // TODO: Replace with actual Soroban SDK integration
  // Example code:
  /*
  import * as SorobanClient from '@stellar/stellar-sdk';
  
  const server = new SorobanClient.Server(SOROBAN_RPC_URL);
  const contract = new SorobanClient.Contract(contractAddress);
  
  const result = await contract.call(
    'get_evidence',
    SorobanClient.xdr.ScVal.scvU64(new SorobanClient.xdr.Uint64(projectId)),
    SorobanClient.xdr.ScVal.scvU64(new SorobanClient.xdr.Uint64(evidenceIndex))
  );
  
  return parseEvidenceFromScVal(result);
  */

  // Simulated response for demo
  console.log('📥 Fetching evidence from contract:', {
    contractAddress,
    projectId,
    evidenceIndex,
  });

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock evidence data
  return {
    project_id: projectId,
    evidence_hash: '6d7968617368313233343536373839306162636465666768696a6b6c6d6e6f70',
    timestamp: Date.now(),
    issuer: 'GDEMOISSUER1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  };
}

/**
 * Get IPFS CID from evidence metadata
 * 
 * NOTE: This assumes you store CID in contract or separate database
 * 
 * @param projectId - Project ID
 * @param evidenceIndex - Evidence index
 * @returns IPFS CID
 */
async function getCIDFromEvidence(
  projectId: number,
  evidenceIndex: number
): Promise<string> {
  // TODO: Implement CID retrieval
  // Option 1: Store CID in contract metadata
  // Option 2: Store CID in database linked to evidence_index
  // Option 3: Use event logs to find CID

  // Placeholder
  return 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG';
}

/**
 * Generate verification report
 * 
 * @param result - Verification result
 * @returns Formatted report string
 */
export function generateVerificationReport(result: VerificationResult): string {
  const status = result.isValid ? '✅ VALID' : '❌ INVALID';
  
  return `
EVIDENCE VERIFICATION REPORT
============================

Status: ${status}
${result.error ? `Error: ${result.error}\n` : ''}
CID: ${result.cid}
Computed Hash: ${result.computedHash}
On-Chain Hash: ${result.onChainHash}

${result.evidence ? `
Evidence Details:
- Project ID: ${result.evidence.project_id}
- Issuer: ${result.evidence.issuer}
- Timestamp: ${new Date(result.evidence.timestamp).toISOString()}
` : ''}

${result.isValid ? 
  'This evidence is authentic and has not been tampered with.' :
  'WARNING: This evidence may have been tampered with or corrupted.'
}
`;
}

/**
 * Example verification workflow
 */
export const VERIFICATION_EXAMPLE = `
// Example: Verify evidence authenticity

import { verifyEvidence, generateVerificationReport } from './verifyEvidence';

const projectId = 1001;
const evidenceIndex = 0;
const cid = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
const contractAddress = "CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC";

// Perform verification
const result = await verifyEvidence(
  projectId,
  evidenceIndex,
  cid,
  contractAddress
);

// Generate report
console.log(generateVerificationReport(result));

// Check result
if (result.isValid) {
  console.log("✅ Evidence is authentic!");
  // Allow funds disbursement
} else {
  console.log("❌ Evidence verification failed!");
  console.log("Reason:", result.error);
  // Block funds disbursement
}
`;
