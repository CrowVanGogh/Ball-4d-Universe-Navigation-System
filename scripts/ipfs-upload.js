#!/usr/bin/env node

/**
 * IPFS Upload CLI Tool for Ball 4D Universe Navigation System
 * 
 * Quick upload script for individual files to IPFS via Pinata
 * 
 * Usage: node scripts/ipfs-upload.js <file-path>
 */

const PinataUploader = require('../utils/pinataUploader');
const fs = require('fs');
const path = require('path');

async function uploadFile(filePath) {
  const uploader = new PinataUploader({ debug: true });
  
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }
  
  try {
    console.log('Uploading file to IPFS via Pinata...');
    console.log('File:', filePath);
    
    const fileName = path.basename(filePath);
    const metadata = {
      name: `Ball4D_${fileName}`,
      keyvalues: {
        type: 'ball4d_file',
        upload_date: new Date().toISOString(),
        file_size: fs.statSync(filePath).size.toString(),
        source: 'ball4d_cli'
      }
    };
    
    const result = await uploader.uploadFile(filePath, metadata);
    
    console.log('\n✅ Upload successful!');
    console.log('IPFS Hash:', result.IpfsHash);
    console.log('Pinata URL:', result.PinataURL);
    console.log('Gateway URL:', `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);
    console.log('File Size:', result.metadata.keyvalues.file_size, 'bytes');
    
  } catch (error) {
    console.error('\n❌ Upload failed:', error.message);
    
    if (error.message.includes('authenticate')) {
      console.log('\n💡 Tip: Make sure to set your Pinata API credentials in:');
      console.log('   - config/pinata.json, or');
      console.log('   - Environment variables: PINATA_API_KEY, PINATA_API_SECRET, PINATA_JWT');
    }
    
    process.exit(1);
  }
}

// CLI entry point
if (require.main === module) {
  if (process.argv.length < 3) {
    console.log('Ball 4D IPFS Upload Tool');
    console.log('Usage: node scripts/ipfs-upload.js <file-path>');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/ipfs-upload.js verified_claims.json');
    console.log('  node scripts/ipfs-upload.js genesis/genesis_manifest.json');
    process.exit(1);
  }

  const filePath = process.argv[2];
  uploadFile(filePath);
}

module.exports = { uploadFile };