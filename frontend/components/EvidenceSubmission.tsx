'use client';

import { useState, useRef } from 'react';
import { hashCID, hexToBytes } from '../lib/crypto/hashUtils';

interface EvidenceSubmissionProps {
  projectId: number;
  issuerAddress: string;
  contractAddress: string;
  onSuccess?: (evidenceIndex: number, cid: string, hash: string) => void;
  onError?: (error: string) => void;
}

interface UploadResponse {
  success: boolean;
  cid?: string;
  filename?: string;
  size?: number;
  ipfsUrl?: string;
  error?: string;
}

export default function EvidenceSubmission({
  projectId,
  issuerAddress,
  contractAddress,
  onSuccess,
  onError,
}: EvidenceSubmissionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [cid, setCid] = useState<string>('');
  const [hash, setHash] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Invalid file type. Only JPEG, PNG, GIF, and PDF are allowed.');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    setFile(selectedFile);
    setStatus('');
    setCid('');
    setHash('');

    // Generate preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  // Upload file and submit evidence to blockchain
  const handleSubmit = async () => {
    if (!file) {
      alert('Please select a file first.');
      return;
    }

    setUploading(true);
    setProgress(0);
    setStatus('Uploading to IPFS...');

    try {
      // Step 1: Upload to IPFS via backend
      setProgress(25);
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/evidence/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData: UploadResponse = await uploadResponse.json();

      if (!uploadData.success || !uploadData.cid) {
        throw new Error(uploadData.error || 'Failed to upload to IPFS');
      }

      const ipfsCid = uploadData.cid;
      setCid(ipfsCid);
      setStatus('Computing hash...');
      setProgress(50);

      // Step 2: Compute SHA-256 hash of CID
      const cidHash = await hashCID(ipfsCid);
      setHash(cidHash);
      setStatus('Submitting to blockchain...');
      setProgress(75);

      // Step 3: Convert hash to bytes for Soroban
      const hashBytes = hexToBytes(cidHash);

      // Step 4: Submit to Soroban contract
      // NOTE: Replace this with actual Soroban SDK integration
      const evidence = await submitToSoroban(
        projectId,
        hashBytes,
        issuerAddress,
        contractAddress
      );

      setStatus('✅ Evidence submitted successfully!');
      setProgress(100);

      if (onSuccess) {
        onSuccess(evidence.index, ipfsCid, cidHash);
      }
    } catch (error: any) {
      console.error('Evidence submission error:', error);
      setStatus(`❌ Error: ${error.message}`);
      setProgress(0);

      if (onError) {
        onError(error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setProgress(0);
    setStatus('');
    setCid('');
    setHash('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="evidence-submission p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Submit Proof-of-Funds Evidence</h2>
      
      {/* Project Info */}
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <p className="text-sm text-gray-600">
          <strong>Project ID:</strong> {projectId}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Issuer:</strong> {issuerAddress.slice(0, 8)}...{issuerAddress.slice(-6)}
        </p>
      </div>

      {/* File Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Evidence File (Image or PDF)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,application/pdf"
          onChange={handleFileSelect}
          disabled={uploading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            disabled:opacity-50"
        />
        <p className="mt-1 text-xs text-gray-500">
          Max size: 10MB. Allowed: JPEG, PNG, GIF, PDF
        </p>
      </div>

      {/* Preview */}
      {preview && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
          <img
            src={preview}
            alt="Evidence preview"
            className="max-w-full h-auto max-h-64 rounded border"
          />
        </div>
      )}

      {/* File Info */}
      {file && (
        <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
          <p><strong>Filename:</strong> {file.name}</p>
          <p><strong>Type:</strong> {file.type}</p>
          <p><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>
        </div>
      )}

      {/* Progress Bar */}
      {uploading && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">{status}</p>
        </div>
      )}

      {/* Results */}
      {cid && (
        <div className="mb-4 p-3 bg-green-50 rounded text-sm">
          <p className="font-semibold text-green-700 mb-2">✅ IPFS Upload Complete</p>
          <p className="break-all">
            <strong>CID:</strong> <code className="bg-white px-1 py-0.5 rounded">{cid}</code>
          </p>
          <p className="mt-2">
            <a
              href={`https://gateway.pinata.cloud/ipfs/${cid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View on IPFS →
            </a>
          </p>
        </div>
      )}

      {hash && (
        <div className="mb-4 p-3 bg-purple-50 rounded text-sm">
          <p className="font-semibold text-purple-700 mb-2">🔒 SHA-256 Hash</p>
          <p className="break-all">
            <code className="bg-white px-1 py-0.5 rounded text-xs">{hash}</code>
          </p>
        </div>
      )}

      {/* Status Message */}
      {status && !uploading && (
        <div className={`mb-4 p-3 rounded ${
          status.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {status}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={!file || uploading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold
            hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
            transition-colors"
        >
          {uploading ? 'Processing...' : 'Submit Evidence'}
        </button>
        
        <button
          onClick={handleReset}
          disabled={uploading}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold
            hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded text-sm">
        <p className="font-semibold text-blue-900 mb-2">📋 How it works:</p>
        <ol className="list-decimal list-inside space-y-1 text-blue-800">
          <li>Select your evidence file (image or PDF)</li>
          <li>File uploads to IPFS (decentralized storage)</li>
          <li>SHA-256 hash computed from IPFS CID</li>
          <li>Hash stored on-chain in Soroban smart contract</li>
          <li>Evidence is tamper-proof and cryptographically verifiable</li>
        </ol>
      </div>
    </div>
  );
}

/**
 * Submit evidence to Soroban smart contract
 * 
 * NOTE: This is a placeholder. Replace with actual Soroban SDK integration.
 * 
 * @param projectId - Project ID
 * @param hashBytes - SHA-256 hash as bytes (32 bytes)
 * @param issuerAddress - Issuer's Stellar address
 * @param contractAddress - Evidence contract address
 * @returns Evidence index
 */
async function submitToSoroban(
  projectId: number,
  hashBytes: Uint8Array,
  issuerAddress: string,
  contractAddress: string
): Promise<{ index: number }> {
  // TODO: Replace with actual Soroban SDK integration
  // Example code:
  /*
  import * as SorobanClient from '@stellar/stellar-sdk';
  
  const server = new SorobanClient.Server(SOROBAN_RPC_URL);
  const contract = new SorobanClient.Contract(contractAddress);
  
  const tx = new SorobanClient.TransactionBuilder(account, { fee: '1000' })
    .addOperation(
      contract.call(
        'submit_evidence',
        SorobanClient.xdr.ScVal.scvU64(new SorobanClient.xdr.Uint64(projectId)),
        SorobanClient.xdr.ScVal.scvBytes(hashBytes),
        SorobanClient.Address.fromString(issuerAddress).toScVal()
      )
    )
    .setTimeout(30)
    .build();
  
  const signedTx = await signTransaction(tx);
  const result = await server.sendTransaction(signedTx);
  */

  // Simulated response for demo
  console.log('📝 Submitting to Soroban contract:', {
    contractAddress,
    projectId,
    hashBytes: Array.from(hashBytes).map(b => b.toString(16).padStart(2, '0')).join(''),
    issuerAddress,
  });

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    index: Math.floor(Math.random() * 1000),
  };
}
