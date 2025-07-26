# IPFS Integration Guide

## Overview

Ball 4D integrates with IPFS (InterPlanetary File System) through Pinata's managed infrastructure to provide decentralized storage for claims, resonance signatures, and node data. This ensures sovereignty and permanence of Ball 4D's spatial anchoring system.

## Prerequisites

### Required Accounts and Keys

1. **Pinata Account**
   - Sign up at [pinata.cloud](https://pinata.cloud)
   - Generate API credentials
   - Optional: Subscribe to dedicated gateways for enhanced performance

2. **Node.js Environment**
   - Node.js v18+ required
   - npm or yarn package manager

### Environment Setup

Create a `.env` file in your project root:

```env
PINATA_API_KEY=your_api_key_here
PINATA_API_SECRET=your_api_secret_here
PINATA_JWT=your_jwt_token_here
BALL4D_NODE_ID=your_node_identifier
```

## Installation

### Install Dependencies

```bash
npm install axios form-data fs path
```

### Configure Pinata Settings

Update `config/pinata.json` with your credentials:

```json
{
  "apiKey": "your-actual-api-key",
  "apiSecret": "your-actual-api-secret", 
  "jwt": "your-actual-jwt-token",
  "gateway": "https://gateway.pinata.cloud"
}
```

## Basic Usage

### 1. Upload Single Claim

```javascript
const PinataUploader = require('./utils/pinataUploader');

const uploader = new PinataUploader();

// Upload a single claim
const claim = {
  claim_id: "b4d-001",
  node_id: "node-xyz", 
  coordinates: [33.7490, -84.3880],
  timestamp: "2025-01-26T15:30:00Z",
  resonance_signature: "a9f3c1e7d5b8...",
  natiq_score: 0.87
};

const result = await uploader.uploadClaim(claim);
console.log('IPFS Hash:', result.IpfsHash);
console.log('Pinata URL:', result.PinataURL);
```

### 2. Upload Multiple Claims (Batch)

```javascript
const claims = [
  { claim_id: "b4d-001", /* ... */ },
  { claim_id: "b4d-002", /* ... */ },
  { claim_id: "b4d-003", /* ... */ }
];

const results = await uploader.uploadClaimsBatch(claims);
results.forEach(result => {
  console.log(`Claim ${result.metadata.name}: ${result.IpfsHash}`);
});
```

### 3. Upload from File

```javascript
// Upload verified_claims.json to IPFS
const filePath = './data/verified_claims.json';
const result = await uploader.uploadFile(filePath, {
  name: 'Ball4D_Verified_Claims',
  keyvalues: {
    type: 'claims_data',
    version: '1.0',
    node_id: process.env.BALL4D_NODE_ID
  }
});
```

## Advanced Features

### Custom Pin Options

```javascript
const pinOptions = {
  cidVersion: 1,
  wrapWithDirectory: false,
  customPinPolicy: {
    regions: [
      { id: "FRA1", desiredReplicationCount: 2 },
      { id: "NYC1", desiredReplicationCount: 1 }
    ]
  }
};

const result = await uploader.uploadClaim(claim, pinOptions);
```

### Metadata Enhancement

```javascript
const metadata = {
  name: "Ball4D_Genesis_Claim",
  keyvalues: {
    claim_type: "genesis_anchor",
    coordinates: "33.7490,-84.3880", 
    natiq_score: "0.95",
    verification_level: "sovereign",
    ball4d_version: "1.0"
  }
};

const result = await uploader.uploadClaim(claim, null, metadata);
```

## Integration Patterns

### 1. Automated Claim Backup

Set up automatic IPFS backup for all verified claims:

```javascript
const ClaimVerifier = require('./scripts/claimVerifier');
const PinataUploader = require('./utils/pinataUploader');

class AutomatedBackup {
  constructor() {
    this.verifier = new ClaimVerifier();
    this.uploader = new PinataUploader();
  }

  async processAndBackup() {
    // Verify claims
    const results = await this.verifier.verifyAllClaims();
    
    // Upload verified claims to IPFS
    const approvedClaims = results.claims.filter(c => !c.flagged);
    const ipfsResults = await this.uploader.uploadClaimsBatch(approvedClaims);
    
    // Update backup manifest
    await this.updateBackupManifest(ipfsResults);
    
    return ipfsResults;
  }
}
```

### 2. Distributed Verification

Create a network of verification nodes:

```javascript
class DistributedVerifier {
  async shareClaimForVerification(claim) {
    // Upload claim to IPFS for peer verification
    const ipfsResult = await uploader.uploadClaim(claim, null, {
      name: `Claim_Verification_${claim.claim_id}`,
      keyvalues: {
        status: "pending_verification",
        verification_nodes: "3",
        consensus_required: "2"
      }
    });
    
    // Notify verification network
    await this.notifyVerificationNodes(ipfsResult.IpfsHash);
    
    return ipfsResult;
  }
}
```

### 3. Genesis Protocol Integration

Anchor genesis nodes to IPFS for permanent record:

```javascript
const GenesisFinalization = require('./genesisFinalization');

class IPFSGenesis {
  async finalizeAndAnchor(nodeData) {
    // Finalize genesis coordinates
    const finalized = await GenesisFinalization.finalizeNode(nodeData);
    
    // Create permanent IPFS record
    const ipfsRecord = await uploader.uploadClaim(finalized, {
      cidVersion: 1,
      customPinPolicy: {
        regions: [
          { id: "FRA1", desiredReplicationCount: 3 },
          { id: "NYC1", desiredReplicationCount: 3 },
          { id: "SGP1", desiredReplicationCount: 3 }
        ]
      }
    }, {
      name: `Genesis_Node_${finalized.node_id}`,
      keyvalues: {
        type: "genesis_anchor",
        status: "finalized",
        immutable: "true"
      }
    });
    
    return ipfsRecord;
  }
}
```

## Error Handling

### Connection Issues

```javascript
class RobustUploader extends PinataUploader {
  async uploadWithRetry(data, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.uploadClaim(data);
      } catch (error) {
        console.log(`Upload attempt ${i + 1} failed:`, error.message);
        
        if (i === maxRetries - 1) throw error;
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }
}
```

### Validation Errors

```javascript
function validateClaimForIPFS(claim) {
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
  
  return true;
}
```

## Security Considerations

### Data Sanitization

```javascript
function sanitizeClaimData(claim) {
  return {
    claim_id: claim.claim_id.replace(/[^a-zA-Z0-9-]/g, ''),
    node_id: claim.node_id.replace(/[^a-zA-Z0-9-]/g, ''),
    coordinates: [
      parseFloat(claim.coordinates[0].toFixed(6)),
      parseFloat(claim.coordinates[1].toFixed(6))
    ],
    timestamp: new Date(claim.timestamp).toISOString(),
    resonance_signature: claim.resonance_signature,
    natiq_score: Math.max(0, Math.min(1, claim.natiq_score))
  };
}
```

### Access Control

```javascript
class SecureUploader extends PinataUploader {
  constructor(nodeId, permissions = []) {
    super();
    this.nodeId = nodeId;
    this.permissions = permissions;
  }
  
  async uploadClaim(claim) {
    // Verify node ownership
    if (claim.node_id !== this.nodeId) {
      throw new Error('Unauthorized: Cannot upload claim for different node');
    }
    
    // Check permissions
    if (!this.permissions.includes('upload_claims')) {
      throw new Error('Insufficient permissions');
    }
    
    return super.uploadClaim(claim);
  }
}
```

## Monitoring and Analytics

### Upload Tracking

```javascript
class UploadMonitor {
  constructor() {
    this.uploadLog = [];
  }
  
  async monitoredUpload(uploader, claim) {
    const startTime = Date.now();
    
    try {
      const result = await uploader.uploadClaim(claim);
      
      this.uploadLog.push({
        claim_id: claim.claim_id,
        ipfs_hash: result.IpfsHash,
        upload_time: Date.now() - startTime,
        status: 'success',
        timestamp: new Date().toISOString()
      });
      
      return result;
    } catch (error) {
      this.uploadLog.push({
        claim_id: claim.claim_id,
        error: error.message,
        upload_time: Date.now() - startTime,
        status: 'failed',
        timestamp: new Date().toISOString()
      });
      
      throw error;
    }
  }
  
  getUploadStats() {
    const total = this.uploadLog.length;
    const successful = this.uploadLog.filter(log => log.status === 'success').length;
    const failed = total - successful;
    
    return {
      total_uploads: total,
      successful: successful,
      failed: failed,
      success_rate: total > 0 ? (successful / total * 100).toFixed(2) + '%' : '0%',
      average_upload_time: this.calculateAverageUploadTime()
    };
  }
}
```

## Command Line Tools

### Quick Upload Script

Create `scripts/ipfs-upload.js`:

```javascript
#!/usr/bin/env node

const PinataUploader = require('../utils/pinataUploader');
const fs = require('fs');

async function uploadFile(filePath) {
  const uploader = new PinataUploader();
  
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }
  
  try {
    const result = await uploader.uploadFile(filePath);
    console.log('Success!');
    console.log('IPFS Hash:', result.IpfsHash);
    console.log('Pinata URL:', result.PinataURL);
    console.log('Gateway URL:', `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);
  } catch (error) {
    console.error('Upload failed:', error.message);
    process.exit(1);
  }
}

// Usage: node scripts/ipfs-upload.js path/to/file
if (process.argv.length < 3) {
  console.log('Usage: node scripts/ipfs-upload.js <file-path>');
  process.exit(1);
}

uploadFile(process.argv[2]);
```

### Batch Processing Tool

Create `scripts/batch-upload.js`:

```javascript
#!/usr/bin/env node

const PinataUploader = require('../utils/pinataUploader');
const ClaimVerifier = require('./claimVerifier');

async function batchUpload() {
  const uploader = new PinataUploader();
  const verifier = new ClaimVerifier();
  
  console.log('Starting batch upload process...');
  
  // Load and verify claims
  const verification = await verifier.verifyAllClaims();
  console.log(`Verified ${verification.total_claims} claims`);
  
  // Upload approved claims
  const approvedClaims = verification.claims.filter(c => !c.flagged);
  console.log(`Uploading ${approvedClaims.length} approved claims...`);
  
  const results = await uploader.uploadClaimsBatch(approvedClaims);
  
  console.log('Upload completed!');
  console.log(`Successfully uploaded: ${results.length} claims`);
  
  // Save upload manifest
  const manifest = {
    upload_date: new Date().toISOString(),
    total_claims: results.length,
    ipfs_hashes: results.map(r => r.IpfsHash),
    verification_summary: verification.summary
  };
  
  fs.writeFileSync('upload-manifest.json', JSON.stringify(manifest, null, 2));
  console.log('Upload manifest saved to upload-manifest.json');
}

batchUpload().catch(console.error);
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify API keys in config/pinata.json
   - Check JWT token expiration
   - Ensure proper environment variables

2. **Upload Failures**
   - Check network connectivity
   - Verify file size limits (100MB max for free tier)
   - Validate JSON structure

3. **Gateway Access Issues**
   - Try alternative gateways
   - Check CORS settings for web applications
   - Verify IPFS hash format

### Debug Mode

Enable debug logging:

```javascript
const uploader = new PinataUploader({ debug: true });
```

This will output detailed information about API requests and responses.

---

*This guide is part of the Ball 4D Universe Navigation System and is governed by the Ball 4D Sovereign Commercial License (B4D-SCL).*