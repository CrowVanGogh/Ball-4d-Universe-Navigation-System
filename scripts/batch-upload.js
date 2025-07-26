#!/usr/bin/env node

/**
 * Batch Upload CLI Tool for Ball 4D Universe Navigation System
 * 
 * Processes verified claims and uploads them in batch to IPFS via Pinata
 * 
 * Usage: node scripts/batch-upload.js [options]
 */

const PinataUploader = require('../utils/pinataUploader');
const ClaimVerifier = require('./claimVerifier');
const fs = require('fs');
const path = require('path');

class BatchUploadProcessor {
  constructor(options = {}) {
    this.debug = options.debug || false;
    this.verifier = new ClaimVerifier({ debug: this.debug });
    this.uploader = new PinataUploader({ debug: this.debug });
    this.outputDir = options.outputDir || process.cwd();
  }

  async processAndUpload() {
    try {
      console.log('🚀 Starting Ball 4D Batch Upload Process...\n');
      
      // Step 1: Verify claims
      console.log('📋 Step 1: Verifying claims...');
      const verification = await this.verifier.verifyAllClaims();
      console.log(`✅ Verified ${verification.summary.total_claims} claims`);
      console.log(`   - Approved: ${verification.summary.verified_claims}`);
      console.log(`   - Flagged: ${verification.summary.flagged_claims}`);
      console.log(`   - Critical: ${verification.summary.critical_claims}\n`);
      
      // Step 2: Filter approved claims
      const approvedClaims = verification.claims.filter(c => c.status === 'verified');
      
      if (approvedClaims.length === 0) {
        console.log('⚠️  No approved claims found for upload.');
        return;
      }
      
      console.log(`📤 Step 2: Uploading ${approvedClaims.length} approved claims to IPFS...`);
      
      // Step 3: Upload to IPFS
      const uploadResults = await this.uploader.uploadClaimsBatch(approvedClaims, {
        maxConcurrent: 3 // Conservative to avoid API rate limits
      });
      
      console.log('\n✅ Upload completed!');
      console.log(`   - Successful: ${uploadResults.summary.successful}`);
      console.log(`   - Failed: ${uploadResults.summary.failed}`);
      console.log(`   - Success Rate: ${uploadResults.summary.success_rate}`);
      
      // Step 4: Generate upload manifest
      const manifest = this.createUploadManifest(uploadResults, verification);
      const manifestPath = this.saveUploadManifest(manifest);
      
      console.log(`\n📄 Upload manifest saved to: ${manifestPath}`);
      
      // Step 5: Display results
      this.displayResults(uploadResults);
      
      return {
        verification,
        uploadResults,
        manifest,
        manifestPath
      };
      
    } catch (error) {
      console.error('\n❌ Batch upload failed:', error.message);
      throw error;
    }
  }

  createUploadManifest(uploadResults, verification) {
    const manifest = {
      batch_upload_session: {
        id: `batch_${Date.now()}`,
        timestamp: new Date().toISOString(),
        ball4d_version: '1.0.0'
      },
      verification_summary: {
        total_claims: verification.summary.total_claims,
        verified_claims: verification.summary.verified_claims,
        flagged_claims: verification.summary.flagged_claims,
        verification_rate: verification.summary.verification_rate
      },
      upload_summary: uploadResults.summary,
      successful_uploads: uploadResults.successful.map(result => ({
        claim_id: result.claim_id,
        ipfs_hash: result.IpfsHash,
        pinata_url: result.PinataURL,
        gateway_url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
        pin_size: result.PinSize,
        upload_timestamp: result.Timestamp
      })),
      failed_uploads: uploadResults.failed,
      ipfs_urls: {
        gateway_urls: uploadResults.successful.map(r => `https://gateway.pinata.cloud/ipfs/${r.IpfsHash}`),
        pinata_urls: uploadResults.successful.map(r => r.PinataURL)
      },
      next_actions: this.generateNextActions(uploadResults, verification)
    };

    return manifest;
  }

  generateNextActions(uploadResults, verification) {
    const actions = [];
    
    if (uploadResults.successful.length > 0) {
      actions.push('Claims successfully stored on IPFS and available globally');
      actions.push('Update node synchronization status with IPFS hashes');
      actions.push('Notify network participants of new claim availability');
    }
    
    if (uploadResults.failed.length > 0) {
      actions.push('Retry failed uploads after resolving issues');
      actions.push('Review API credentials and network connectivity');
    }
    
    if (verification.summary.flagged_claims > 0) {
      actions.push('Review flagged claims before next upload cycle');
    }
    
    actions.push('Schedule next batch upload cycle');
    actions.push('Monitor IPFS gateway availability');
    
    return actions;
  }

  saveUploadManifest(manifest) {
    const filename = `batch_upload_manifest_${Date.now()}.json`;
    const filepath = path.join(this.outputDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(manifest, null, 2), 'utf8');
    
    return filepath;
  }

  displayResults(uploadResults) {
    if (uploadResults.successful.length > 0) {
      console.log('\n📂 Successful Uploads:');
      uploadResults.successful.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.claim_id}`);
        console.log(`      IPFS: ${result.IpfsHash}`);
        console.log(`      URL:  https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);
      });
    }
    
    if (uploadResults.failed.length > 0) {
      console.log('\n❌ Failed Uploads:');
      uploadResults.failed.forEach((failure, index) => {
        console.log(`   ${index + 1}. ${failure.claim_id}: ${failure.error}`);
      });
    }
  }
}

async function runBatchUpload(options = {}) {
  const processor = new BatchUploadProcessor(options);
  
  try {
    const results = await processor.processAndUpload();
    
    console.log('\n🎉 Batch upload process completed successfully!');
    
    // Exit with appropriate code
    if (results.uploadResults.failed.length > 0) {
      process.exit(1); // Some uploads failed
    } else {
      process.exit(0); // All uploads successful
    }
    
  } catch (error) {
    console.error('❌ Batch upload process failed:', error.message);
    
    if (error.message.includes('authenticate')) {
      console.log('\n💡 Tip: Make sure to set your Pinata API credentials in:');
      console.log('   - config/pinata.json, or');
      console.log('   - Environment variables: PINATA_API_KEY, PINATA_API_SECRET, PINATA_JWT');
    }
    
    process.exit(2);
  }
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = { debug: false };
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--debug' || arg === '-d') {
      options.debug = true;
    } else if (arg === '--output-dir' || arg === '-o') {
      options.outputDir = args[i + 1];
      i++; // Skip next argument
    } else if (arg === '--help' || arg === '-h') {
      console.log('Ball 4D Batch Upload Tool');
      console.log('');
      console.log('Usage: node scripts/batch-upload.js [options]');
      console.log('');
      console.log('Options:');
      console.log('  --debug, -d         Enable debug output');
      console.log('  --output-dir, -o    Output directory for manifest');
      console.log('  --help, -h          Show this help');
      console.log('');
      console.log('Examples:');
      console.log('  node scripts/batch-upload.js');
      console.log('  node scripts/batch-upload.js --debug');
      console.log('  node scripts/batch-upload.js --output-dir ./uploads');
      process.exit(0);
    }
  }
  
  runBatchUpload(options);
}

module.exports = { BatchUploadProcessor, runBatchUpload };