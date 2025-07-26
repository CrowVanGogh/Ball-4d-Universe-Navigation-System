/**
 * Pinata IPFS Uploader for Ball 4D Universe Navigation System
 * 
 * Handles upload of claims, resonance data, and node information to IPFS
 * through Pinata's managed infrastructure for decentralized storage.
 * 
 * @author Ball 4D Development Team
 * @license Ball 4D Sovereign Commercial License (B4D-SCL)
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class PinataUploader {
  constructor(options = {}) {
    this.debug = options.debug || false;
    this.config = this.loadConfig();
    this.apiKey = process.env.PINATA_API_KEY || this.config.apiKey;
    this.apiSecret = process.env.PINATA_API_SECRET || this.config.apiSecret;
    this.jwt = process.env.PINATA_JWT || this.config.jwt;
    
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Pinata API credentials not found. Check config/pinata.json or environment variables.');
    }
    
    this.headers = {
      'Content-Type': 'application/json',
      'pinata_api_key': this.apiKey,
      'pinata_secret_api_key': this.apiSecret
    };
    
    if (this.jwt) {
      this.headers['Authorization'] = `Bearer ${this.jwt}`;
    }
  }

  /**
   * Load configuration from config/pinata.json
   */
  loadConfig() {
    try {
      const configPath = path.join(process.cwd(), 'config', 'pinata.json');
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      if (this.debug) {
        console.warn('Could not load config/pinata.json:', error.message);
      }
      return {};
    }
  }

  /**
   * Test authentication with Pinata API
   */
  async testAuthentication() {
    try {
      const response = await axios.get(this.config.endpoints?.testAuthentication || 'https://api.pinata.cloud/data/testAuthentication', {
        headers: this.headers
      });
      
      if (this.debug) {
        console.log('Authentication test successful:', response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('Authentication failed:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Pinata API');
    }
  }

  /**
   * Upload a single claim to IPFS
   * @param {Object} claim - The claim object to upload
   * @param {Object} pinOptions - Custom pinning options
   * @param {Object} metadata - Additional metadata for the pin
   */
  async uploadClaim(claim, pinOptions = null, metadata = null) {
    this.validateClaim(claim);
    
    const sanitizedClaim = this.sanitizeClaim(claim);
    
    const pinData = {
      pinataContent: sanitizedClaim,
      pinataOptions: pinOptions || this.config.options || {},
      pinataMetadata: metadata || {
        name: `Ball4D_Claim_${claim.claim_id}`,
        keyvalues: {
          type: 'ball4d_claim',
          claim_id: claim.claim_id,
          node_id: claim.node_id,
          natiq_score: claim.natiq_score?.toString() || 'unknown',
          upload_date: new Date().toISOString()
        }
      }
    };

    try {
      if (this.debug) {
        console.log('Uploading claim to IPFS:', claim.claim_id);
      }

      const response = await axios.post(
        this.config.endpoints?.pinJSONToIPFS || 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        pinData,
        { headers: this.headers }
      );

      const result = {
        IpfsHash: response.data.IpfsHash,
        PinSize: response.data.PinSize,
        Timestamp: response.data.Timestamp,
        PinataURL: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
        claim_id: claim.claim_id,
        metadata: pinData.pinataMetadata
      };

      if (this.debug) {
        console.log('Upload successful:', result);
      }

      return result;
    } catch (error) {
      console.error('Failed to upload claim:', error.response?.data || error.message);
      throw new Error(`Failed to upload claim ${claim.claim_id}: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Upload multiple claims in batch
   * @param {Array} claims - Array of claim objects
   * @param {Object} options - Batch upload options
   */
  async uploadClaimsBatch(claims, options = {}) {
    const maxConcurrent = options.maxConcurrent || 5;
    const results = [];
    const errors = [];

    if (this.debug) {
      console.log(`Starting batch upload of ${claims.length} claims with max ${maxConcurrent} concurrent uploads`);
    }

    // Process claims in batches to avoid overwhelming the API
    for (let i = 0; i < claims.length; i += maxConcurrent) {
      const batch = claims.slice(i, i + maxConcurrent);
      
      const batchPromises = batch.map(async (claim, index) => {
        try {
          const result = await this.uploadClaim(claim);
          return { success: true, result, claim_id: claim.claim_id };
        } catch (error) {
          return { success: false, error: error.message, claim_id: claim.claim_id };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(batchResult => {
        if (batchResult.success) {
          results.push(batchResult.result);
        } else {
          errors.push(batchResult);
          console.error(`Failed to upload claim ${batchResult.claim_id}:`, batchResult.error);
        }
      });

      // Small delay between batches to be respectful to the API
      if (i + maxConcurrent < claims.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    if (this.debug) {
      console.log(`Batch upload completed. Success: ${results.length}, Errors: ${errors.length}`);
    }

    return {
      successful: results,
      failed: errors,
      summary: {
        total: claims.length,
        successful: results.length,
        failed: errors.length,
        success_rate: `${((results.length / claims.length) * 100).toFixed(2)}%`
      }
    };
  }

  /**
   * Upload a file to IPFS
   * @param {string} filePath - Path to the file to upload
   * @param {Object} metadata - File metadata
   */
  async uploadFile(filePath, metadata = null) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    const pinataMetadata = metadata || {
      name: path.basename(filePath),
      keyvalues: {
        type: 'ball4d_file',
        upload_date: new Date().toISOString(),
        file_size: fs.statSync(filePath).size.toString()
      }
    };

    formData.append('pinataMetadata', JSON.stringify(pinataMetadata));
    
    if (this.config.options) {
      formData.append('pinataOptions', JSON.stringify(this.config.options));
    }

    try {
      if (this.debug) {
        console.log('Uploading file to IPFS:', filePath);
      }

      const response = await axios.post(
        this.config.endpoints?.pinFileToIPFS || 'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'pinata_api_key': this.apiKey,
            'pinata_secret_api_key': this.apiSecret
          }
        }
      );

      const result = {
        IpfsHash: response.data.IpfsHash,
        PinSize: response.data.PinSize,
        Timestamp: response.data.Timestamp,
        PinataURL: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
        fileName: path.basename(filePath),
        metadata: pinataMetadata
      };

      if (this.debug) {
        console.log('File upload successful:', result);
      }

      return result;
    } catch (error) {
      console.error('Failed to upload file:', error.response?.data || error.message);
      throw new Error(`Failed to upload file ${filePath}: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Unpin content from IPFS
   * @param {string} ipfsHash - IPFS hash to unpin
   */
  async unpinContent(ipfsHash) {
    try {
      if (this.debug) {
        console.log('Unpinning content:', ipfsHash);
      }

      const response = await axios.delete(
        `${this.config.endpoints?.unpin || 'https://api.pinata.cloud/pinning/unpin'}/${ipfsHash}`,
        { headers: this.headers }
      );

      if (this.debug) {
        console.log('Content unpinned successfully');
      }

      return response.data;
    } catch (error) {
      console.error('Failed to unpin content:', error.response?.data || error.message);
      throw new Error(`Failed to unpin ${ipfsHash}: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Validate claim structure before upload
   * @param {Object} claim - Claim to validate
   */
  validateClaim(claim) {
    const requiredFields = ['claim_id', 'node_id', 'coordinates', 'timestamp'];
    
    for (const field of requiredFields) {
      if (!claim[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (!Array.isArray(claim.coordinates) || claim.coordinates.length !== 2) {
      throw new Error('Coordinates must be [latitude, longitude] array');
    }

    if (isNaN(Date.parse(claim.timestamp))) {
      throw new Error('Invalid timestamp format');
    }

    if (claim.natiq_score !== undefined && (claim.natiq_score < 0 || claim.natiq_score > 1)) {
      throw new Error('NATIQ score must be between 0 and 1');
    }

    return true;
  }

  /**
   * Sanitize claim data before upload
   * @param {Object} claim - Claim to sanitize
   */
  sanitizeClaim(claim) {
    return {
      claim_id: claim.claim_id.replace(/[^a-zA-Z0-9-_]/g, ''),
      node_id: claim.node_id.replace(/[^a-zA-Z0-9-_]/g, ''),
      coordinates: [
        parseFloat(Number(claim.coordinates[0]).toFixed(6)),
        parseFloat(Number(claim.coordinates[1]).toFixed(6))
      ],
      timestamp: new Date(claim.timestamp).toISOString(),
      resonance_signature: claim.resonance_signature || null,
      natiq_score: claim.natiq_score ? parseFloat(Number(claim.natiq_score).toFixed(3)) : null,
      additional_data: claim.additional_data || {}
    };
  }

  /**
   * Create upload manifest for tracking purposes
   * @param {Array} uploadResults - Results from batch upload
   */
  createUploadManifest(uploadResults) {
    const manifest = {
      upload_session: {
        id: `session_${Date.now()}`,
        timestamp: new Date().toISOString(),
        total_uploads: uploadResults.length
      },
      uploads: uploadResults.map(result => ({
        claim_id: result.claim_id,
        ipfs_hash: result.IpfsHash,
        pinata_url: result.PinataURL,
        pin_size: result.PinSize,
        upload_timestamp: result.Timestamp
      })),
      summary: {
        total_pin_size: uploadResults.reduce((total, result) => total + (result.PinSize || 0), 0),
        gateway_urls: uploadResults.map(result => result.PinataURL)
      }
    };

    return manifest;
  }

  /**
   * Get pinned content list from Pinata
   */
  async getPinnedContent(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.metadata) {
        Object.entries(filters.metadata).forEach(([key, value]) => {
          params.append(`metadata[keyvalues][${key}]`, value);
        });
      }

      if (filters.status) {
        params.append('status', filters.status);
      }

      const response = await axios.get(
        `https://api.pinata.cloud/data/pinList?${params.toString()}`,
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to get pinned content:', error.response?.data || error.message);
      throw new Error(`Failed to retrieve pinned content: ${error.response?.data?.error || error.message}`);
    }
  }
}

module.exports = PinataUploader;