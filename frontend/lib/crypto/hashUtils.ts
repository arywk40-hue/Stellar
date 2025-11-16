/**
 * SHA-256 Hashing Utility for IPFS CIDs
 * 
 * This utility provides functions to compute SHA-256 hashes from IPFS CIDs
 * using the Web Crypto API (browser-native, no dependencies required).
 */

/**
 * Compute SHA-256 hash from an IPFS CID string
 * 
 * @param cid - IPFS CID (e.g., "QmABC123..." or "bafybeiabc123...")
 * @returns Promise<string> - Hex-encoded hash (64 characters)
 * 
 * @example
 * const hash = await hashCID("QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG");
 * // Returns: "6d7968617368313233343536373839306162636465666768696a6b6c6d6e6f70"
 */
export async function hashCID(cid: string): Promise<string> {
  // Encode the CID string to bytes
  const encoder = new TextEncoder();
  const data = encoder.encode(cid);

  // Compute SHA-256 hash using Web Crypto API
  const hashBuffer = await crypto.subtle.digest('SHA-256', data as BufferSource);

  // Convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');

  return hashHex;
}

/**
 * Compute SHA-256 hash from a File object
 * 
 * @param file - File object from file input
 * @returns Promise<string> - Hex-encoded hash
 * 
 * @example
 * const fileInput = document.getElementById('fileInput') as HTMLInputElement;
 * const file = fileInput.files[0];
 * const hash = await hashFile(file);
 */
export async function hashFile(file: File): Promise<string> {
  // Read file as ArrayBuffer
  const buffer = await file.arrayBuffer();

  // Compute SHA-256 hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);

  // Convert to hex
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');

  return hashHex;
}

/**
 * Convert hex string to Uint8Array (32 bytes)
 * Useful for passing hash to Soroban contract
 * 
 * @param hexString - Hex-encoded hash (64 characters)
 * @returns Uint8Array - 32-byte array
 * 
 * @example
 * const hashHex = "6d7968617368...";
 * const bytes = hexToBytes(hashHex);
 * // Use bytes in Soroban contract call
 */
export function hexToBytes(hexString: string): Uint8Array {
  if (hexString.length !== 64) {
    throw new Error('Hash must be 64 hex characters (32 bytes)');
  }

  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Convert Uint8Array to hex string
 * 
 * @param bytes - Byte array
 * @returns string - Hex-encoded string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verify if a hash matches expected hash
 * 
 * @param hash1 - First hash (hex string)
 * @param hash2 - Second hash (hex string)
 * @returns boolean - True if hashes match
 */
export function verifyHash(hash1: string, hash2: string): boolean {
  return hash1.toLowerCase() === hash2.toLowerCase();
}

/**
 * Batch hash multiple CIDs
 * 
 * @param cids - Array of IPFS CIDs
 * @returns Promise<Map<string, string>> - Map of CID -> hash
 * 
 * @example
 * const cids = ["QmABC...", "QmDEF..."];
 * const hashes = await batchHashCIDs(cids);
 * console.log(hashes.get("QmABC...")); // Hash for first CID
 */
export async function batchHashCIDs(cids: string[]): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  
  // Hash all CIDs in parallel
  const hashPromises = cids.map(async (cid) => {
    const hash = await hashCID(cid);
    return { cid, hash };
  });

  const hashes = await Promise.all(hashPromises);
  
  hashes.forEach(({ cid, hash }) => {
    results.set(cid, hash);
  });

  return results;
}

/**
 * Example usage demonstrating the complete workflow
 */
export const EXAMPLE_USAGE = `
// 1. Hash a CID
const cid = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
const hash = await hashCID(cid);
console.log("SHA-256:", hash);

// 2. Convert to bytes for Soroban
const hashBytes = hexToBytes(hash);
console.log("Bytes:", hashBytes);

// 3. Use in Soroban contract call
import * as SorobanClient from '@stellar/stellar-sdk';

const contract = new SorobanClient.Contract(CONTRACT_ADDRESS);
const tx = contract.call(
  'submit_evidence',
  SorobanClient.xdr.ScVal.scvU64(new SorobanClient.xdr.Uint64(projectId)),
  SorobanClient.xdr.ScVal.scvBytes(hashBytes),
  SorobanClient.Address.fromString(issuerAddress).toScVal()
);

// 4. Verify hash later
const retrievedHash = await getEvidenceHashFromContract(projectId, evidenceIndex);
const isValid = verifyHash(hash, retrievedHash);
console.log("Evidence valid:", isValid);
`;
