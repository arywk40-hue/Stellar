import express, { Request, Response } from 'express';
import multer from 'multer';
import FormData from 'form-data';
import axios from 'axios';
import fs from 'fs';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/', // Temporary storage
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs only
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and PDF allowed.'));
    }
  },
});

// IPFS Pinning Service Configuration
// Using Pinata as default - replace with your API keys
const PINATA_API_KEY = process.env.PINATA_API_KEY || '';
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY || '';
const PINATA_BASE_URL = 'https://api.pinata.cloud';

// Alternative: Infura IPFS (uncomment to use)
// const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID || '';
// const INFURA_PROJECT_SECRET = process.env.INFURA_PROJECT_SECRET || '';
// const INFURA_BASE_URL = 'https://ipfs.infura.io:5001/api/v0';

/**
 * Upload file to IPFS via Pinata
 * @param filePath - Local file path
 * @param originalName - Original filename
 * @returns IPFS CID
 */
async function uploadToPinata(filePath: string, originalName: string): Promise<string> {
  const url = `${PINATA_BASE_URL}/pinning/pinFileToIPFS`;

  // Create form data
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));

  // Add metadata
  const metadata = JSON.stringify({
    name: originalName,
    keyvalues: {
      uploadedAt: new Date().toISOString(),
      type: 'evidence',
    },
  });
  formData.append('pinataMetadata', metadata);

  // Add pinning options
  const options = JSON.stringify({
    cidVersion: 1, // Use CIDv1 for better compatibility
  });
  formData.append('pinataOptions', options);

  try {
    const response = await axios.post(url, formData, {
      maxBodyLength: Infinity,
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
    });

    return response.data.IpfsHash; // Returns CID
  } catch (error: any) {
    console.error('Pinata upload error:', error.response?.data || error.message);
    throw new Error('Failed to upload to IPFS via Pinata');
  }
}

/**
 * Alternative: Upload file to IPFS via Infura
 * Uncomment this function if using Infura instead of Pinata
 */
/*
async function uploadToInfura(filePath: string): Promise<string> {
  const url = `${INFURA_BASE_URL}/add`;
  const auth = Buffer.from(`${INFURA_PROJECT_ID}:${INFURA_PROJECT_SECRET}`).toString('base64');

  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));

  try {
    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
        Authorization: `Basic ${auth}`,
      },
    });

    return response.data.Hash; // Returns CID
  } catch (error: any) {
    console.error('Infura upload error:', error.response?.data || error.message);
    throw new Error('Failed to upload to IPFS via Infura');
  }
}
*/

/**
 * POST /api/evidence/upload
 * Upload file to IPFS and return CID
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    const { path: filePath, originalname, mimetype, size } = req.file;

    console.log(`📤 Uploading to IPFS: ${originalname} (${size} bytes)`);

    // Upload to IPFS
    const cid = await uploadToPinata(filePath, originalname);

    // Clean up temporary file
    fs.unlinkSync(filePath);

    console.log(`✅ Upload successful: ${cid}`);

    // Return CID and metadata
    return res.status(200).json({
      success: true,
      cid,
      filename: originalname,
      mimetype,
      size,
      ipfsUrl: `https://gateway.pinata.cloud/ipfs/${cid}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Upload error:', error.message);

    // Clean up temporary file on error
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload file',
    });
  }
});

/**
 * GET /api/evidence/retrieve/:cid
 * Get file metadata and URL from IPFS
 */
router.get('/retrieve/:cid', async (req: Request, res: Response) => {
  try {
    const { cid } = req.params;

    // Validate CID format (basic check)
    if (!cid || cid.length < 40) {
      return res.status(400).json({
        success: false,
        error: 'Invalid CID format',
      });
    }

    // Return IPFS gateway URLs
    return res.status(200).json({
      success: true,
      cid,
      gateways: [
        `https://gateway.pinata.cloud/ipfs/${cid}`,
        `https://ipfs.io/ipfs/${cid}`,
        `https://cloudflare-ipfs.com/ipfs/${cid}`,
      ],
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Retrieve error:', error.message);

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve file info',
    });
  }
});

/**
 * GET /api/evidence/health
 * Check IPFS service health
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Check if API keys are configured
    const isPinataConfigured = !!(PINATA_API_KEY && PINATA_SECRET_KEY);

    // Test Pinata connection
    let pinataStatus = 'not_configured';
    if (isPinataConfigured) {
      try {
        await axios.get(`${PINATA_BASE_URL}/data/testAuthentication`, {
          headers: {
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY,
          },
        });
        pinataStatus = 'connected';
      } catch (error) {
        pinataStatus = 'error';
      }
    }

    return res.status(200).json({
      success: true,
      service: 'IPFS Evidence Upload',
      pinata: {
        configured: isPinataConfigured,
        status: pinataStatus,
      },
      maxFileSize: '10MB',
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
