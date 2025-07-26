/**
 * Ball 4D Genesis Finalization Module
 * 
 * Anchors node coordinates, locks NATIQ score and drift state,
 * and finalizes the resonance field for permanent Ball 4D system integration.
 * 
 * @author Ball 4D Development Team
 * @license Ball 4D Sovereign Commercial License (B4D-SCL)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class GenesisFinalization {
  constructor(options = {}) {
    this.debug = options.debug || false;
    this.outputDir = options.outputDir || path.join(process.cwd(), 'genesis');
    this.genesisAnchor = options.genesisAnchor || {
      coordinates: [33.7490, -84.3880], // Default Atlanta anchor
      signature: null
    };
    this.finalizationTimestamp = null;
    this.finalizedNodes = new Map();
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Generate harmonic signature for coordinates using Golden Ratio mathematics
   */
  generateHarmonicSignature(coordinates, timestamp, nodeId) {
    const phi = 1.618033988749; // Golden ratio
    const [lat, lon] = coordinates;
    
    // Calculate spiral position
    const spiralPosition = Math.atan2(lat, lon);
    const fibonacciAlignment = Math.cos(spiralPosition * phi);
    
    // Create harmonic seed
    const harmonicSeed = `${lat.toFixed(6)},${lon.toFixed(6)},${timestamp},${nodeId},${fibonacciAlignment.toFixed(8)}`;
    
    // Generate signature using SHA-256
    const hash = crypto.createHash('sha256');
    hash.update(harmonicSeed);
    const signature = hash.digest('hex');
    
    if (this.debug) {
      console.log(`Generated harmonic signature for ${nodeId}:`, signature.substring(0, 16) + '...');
    }
    
    return signature;
  }

  /**
   * Calculate drift compensation based on genesis anchor
   */
  calculateDriftCompensation(coordinates, genesisCoordinates) {
    const [lat1, lon1] = coordinates;
    const [lat2, lon2] = genesisCoordinates;
    
    // Calculate distance using Haversine formula
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    // Calculate drift penalty (negative for distance from genesis)
    const maxAcceptableDistance = 5000; // 5000km
    const driftPenalty = Math.max(-1.0, -(distance / maxAcceptableDistance));
    
    return {
      distance_km: distance,
      drift_penalty: driftPenalty,
      acceptable: distance <= maxAcceptableDistance
    };
  }

  /**
   * Convert degrees to radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Lock NATIQ score with temporal harmonics
   */
  lockNATIQScore(originalScore, coordinates, timestamp) {
    const phi = 1.618033988749;
    const timestampMs = new Date(timestamp).getTime();
    
    // Apply temporal harmonic adjustment
    const temporalHarmonic = Math.sin(timestampMs / 1000000) * 0.02; // Small adjustment
    const spatialHarmonic = Math.cos(coordinates[0] * phi) * 0.01;
    
    // Lock score with harmonic adjustments
    const lockedScore = Math.max(0, Math.min(1, 
      originalScore + temporalHarmonic + spatialHarmonic
    ));
    
    // Generate lock signature
    const lockData = `${originalScore},${lockedScore},${timestamp},${coordinates.join(',')}`;
    const lockSignature = crypto.createHash('sha256').update(lockData).digest('hex');
    
    return {
      original_score: originalScore,
      locked_score: parseFloat(lockedScore.toFixed(6)),
      temporal_harmonic: parseFloat(temporalHarmonic.toFixed(6)),
      spatial_harmonic: parseFloat(spatialHarmonic.toFixed(6)),
      lock_signature: lockSignature,
      locked_at: timestamp
    };
  }

  /**
   * Finalize resonance field for a node
   */
  finalizeResonanceField(nodeData) {
    const finalizationTime = new Date().toISOString();
    
    // Calculate resonance field parameters
    const fieldStrength = this.calculateFieldStrength(nodeData);
    const fieldHarmonics = this.calculateFieldHarmonics(nodeData);
    const fieldStability = this.calculateFieldStability(nodeData);
    
    // Generate field signature
    const fieldData = `${nodeData.node_id},${fieldStrength},${fieldHarmonics},${fieldStability},${finalizationTime}`;
    const fieldSignature = crypto.createHash('sha256').update(fieldData).digest('hex');
    
    return {
      node_id: nodeData.node_id,
      field_strength: fieldStrength,
      field_harmonics: fieldHarmonics,
      field_stability: fieldStability,
      field_signature: fieldSignature,
      finalized_at: finalizationTime,
      genesis_locked: true
    };
  }

  /**
   * Calculate resonance field strength
   */
  calculateFieldStrength(nodeData) {
    const baseStrength = nodeData.natiq_score || 0.5;
    const coordinateStrength = Math.min(1, Math.abs(nodeData.coordinates[0]) / 90 + Math.abs(nodeData.coordinates[1]) / 180);
    const temporalStrength = this.calculateTemporalStrength(nodeData.timestamp);
    
    return parseFloat((baseStrength * 0.6 + coordinateStrength * 0.2 + temporalStrength * 0.2).toFixed(6));
  }

  /**
   * Calculate field harmonics
   */
  calculateFieldHarmonics(nodeData) {
    const phi = 1.618033988749;
    const [lat, lon] = nodeData.coordinates;
    
    const spiralAlignment = Math.cos(Math.atan2(lat, lon) * phi);
    const geometricHarmonic = Math.sin(lat * Math.PI / 180) * Math.cos(lon * Math.PI / 180);
    
    return parseFloat(((spiralAlignment + geometricHarmonic) / 2).toFixed(6));
  }

  /**
   * Calculate field stability
   */
  calculateFieldStability(nodeData) {
    let stability = 1.0;
    
    // Reduce stability based on drift
    if (nodeData.drift_penalty && nodeData.drift_penalty < 0) {
      stability += nodeData.drift_penalty; // drift_penalty is negative
    }
    
    // Adjust for resonance signature quality
    if (nodeData.resonance_signature) {
      const signatureEntropy = this.calculateSignatureEntropy(nodeData.resonance_signature);
      stability *= signatureEntropy;
    }
    
    return parseFloat(Math.max(0, Math.min(1, stability)).toFixed(6));
  }

  /**
   * Calculate temporal strength component
   */
  calculateTemporalStrength(timestamp) {
    const now = new Date().getTime();
    const claimTime = new Date(timestamp).getTime();
    const timeDiff = Math.abs(now - claimTime);
    
    // Recent claims have higher temporal strength
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    return Math.max(0, 1 - (timeDiff / maxAge));
  }

  /**
   * Calculate signature entropy
   */
  calculateSignatureEntropy(signature) {
    const hexChars = {};
    for (const char of signature) {
      hexChars[char] = (hexChars[char] || 0) + 1;
    }
    
    let entropy = 0;
    const length = signature.length;
    for (const count of Object.values(hexChars)) {
      const p = count / length;
      entropy -= p * Math.log2(p);
    }
    
    // Normalize entropy (max for hex is 4 bits)
    return Math.min(1, entropy / 4);
  }

  /**
   * Anchor node coordinates to genesis system
   */
  async anchorNodeCoordinates(nodeData) {
    if (!nodeData.node_id || !nodeData.coordinates) {
      throw new Error('Invalid node data: missing node_id or coordinates');
    }

    const anchorTime = new Date().toISOString();
    
    // Generate harmonic signature
    const harmonicSignature = this.generateHarmonicSignature(
      nodeData.coordinates, 
      anchorTime, 
      nodeData.node_id
    );

    // Calculate drift compensation
    const driftCompensation = this.calculateDriftCompensation(
      nodeData.coordinates, 
      this.genesisAnchor.coordinates
    );

    // Create anchored node record
    const anchoredNode = {
      node_id: nodeData.node_id,
      original_coordinates: nodeData.coordinates,
      anchored_coordinates: nodeData.coordinates, // Same for now, could be adjusted
      genesis_anchor: this.genesisAnchor.coordinates,
      harmonic_signature: harmonicSignature,
      drift_compensation: driftCompensation,
      anchored_at: anchorTime,
      anchor_version: '1.0',
      genesis_locked: false // Will be set to true during finalization
    };

    if (this.debug) {
      console.log(`Anchored node ${nodeData.node_id} at coordinates [${nodeData.coordinates.join(', ')}]`);
    }

    return anchoredNode;
  }

  /**
   * Finalize a complete node with all systems locked
   */
  async finalizeNode(nodeData) {
    try {
      if (this.debug) {
        console.log(`Starting finalization for node: ${nodeData.node_id}`);
      }

      // Step 1: Anchor coordinates
      const anchoredNode = await this.anchorNodeCoordinates(nodeData);
      
      // Step 2: Lock NATIQ score
      const lockedNATIQ = this.lockNATIQScore(
        nodeData.natiq_score || 0.5,
        nodeData.coordinates,
        nodeData.timestamp || new Date().toISOString()
      );

      // Step 3: Finalize resonance field
      const resonanceField = this.finalizeResonanceField(nodeData);

      // Step 4: Create final genesis record
      const finalizedNode = {
        ...anchoredNode,
        natiq_lock: lockedNATIQ,
        resonance_field: resonanceField,
        original_data: {
          claim_id: nodeData.claim_id,
          timestamp: nodeData.timestamp,
          original_natiq_score: nodeData.natiq_score,
          spatial_resonance: nodeData.spatial_resonance,
          temporal_resonance: nodeData.temporal_resonance,
          harmonic_weight: nodeData.harmonic_weight,
          drift_penalty: nodeData.drift_penalty
        },
        genesis_locked: true,
        finalized_at: new Date().toISOString(),
        finalization_version: '1.0'
      };

      // Generate master signature for entire record
      const masterData = JSON.stringify(finalizedNode, Object.keys(finalizedNode).sort());
      finalizedNode.master_signature = crypto.createHash('sha256').update(masterData).digest('hex');

      // Store in memory
      this.finalizedNodes.set(nodeData.node_id, finalizedNode);

      // Save to file
      await this.saveFinalizedNode(finalizedNode);

      if (this.debug) {
        console.log(`Node ${nodeData.node_id} finalization completed`);
      }

      return finalizedNode;
      
    } catch (error) {
      console.error(`Failed to finalize node ${nodeData.node_id}:`, error.message);
      throw error;
    }
  }

  /**
   * Save finalized node to file system
   */
  async saveFinalizedNode(finalizedNode) {
    const filename = `genesis_${finalizedNode.node_id}_${Date.now()}.json`;
    const filepath = path.join(this.outputDir, filename);
    
    try {
      fs.writeFileSync(filepath, JSON.stringify(finalizedNode, null, 2), 'utf8');
      
      if (this.debug) {
        console.log(`Finalized node saved to: ${filepath}`);
      }
      
      return filepath;
    } catch (error) {
      console.error('Failed to save finalized node:', error.message);
      throw error;
    }
  }

  /**
   * Create genesis manifest for all finalized nodes
   */
  createGenesisManifest() {
    const manifest = {
      genesis_session: {
        id: `genesis_${Date.now()}`,
        timestamp: new Date().toISOString(),
        total_nodes: this.finalizedNodes.size,
        genesis_anchor: this.genesisAnchor
      },
      finalized_nodes: Array.from(this.finalizedNodes.values()).map(node => ({
        node_id: node.node_id,
        coordinates: node.anchored_coordinates,
        harmonic_signature: node.harmonic_signature,
        natiq_locked_score: node.natiq_lock.locked_score,
        field_strength: node.resonance_field.field_strength,
        master_signature: node.master_signature,
        finalized_at: node.finalized_at
      })),
      system_integrity: {
        all_nodes_anchored: Array.from(this.finalizedNodes.values()).every(n => n.genesis_locked),
        total_field_strength: Array.from(this.finalizedNodes.values())
          .reduce((sum, n) => sum + n.resonance_field.field_strength, 0),
        average_natiq_score: Array.from(this.finalizedNodes.values())
          .reduce((sum, n) => sum + n.natiq_lock.locked_score, 0) / this.finalizedNodes.size
      },
      manifest_signature: null // Will be filled below
    };

    // Generate manifest signature
    const manifestData = JSON.stringify(manifest, ['genesis_session', 'finalized_nodes', 'system_integrity']);
    manifest.manifest_signature = crypto.createHash('sha256').update(manifestData).digest('hex');

    return manifest;
  }

  /**
   * Save genesis manifest
   */
  saveGenesisManifest(manifest = null) {
    const manifestToSave = manifest || this.createGenesisManifest();
    const filename = `genesis_manifest_${Date.now()}.json`;
    const filepath = path.join(this.outputDir, filename);
    
    try {
      fs.writeFileSync(filepath, JSON.stringify(manifestToSave, null, 2), 'utf8');
      
      if (this.debug) {
        console.log(`Genesis manifest saved to: ${filepath}`);
      }
      
      return filepath;
    } catch (error) {
      console.error('Failed to save genesis manifest:', error.message);
      throw error;
    }
  }

  /**
   * Batch finalize multiple nodes
   */
  async batchFinalizeNodes(nodesData) {
    const results = {
      successful: [],
      failed: [],
      summary: {
        total: nodesData.length,
        successful: 0,
        failed: 0
      }
    };

    if (this.debug) {
      console.log(`Starting batch finalization of ${nodesData.length} nodes`);
    }

    for (const nodeData of nodesData) {
      try {
        const finalizedNode = await this.finalizeNode(nodeData);
        results.successful.push(finalizedNode);
        results.summary.successful++;
      } catch (error) {
        results.failed.push({
          node_id: nodeData.node_id,
          error: error.message
        });
        results.summary.failed++;
        console.error(`Failed to finalize node ${nodeData.node_id}:`, error.message);
      }
    }

    // Create and save manifest
    if (results.summary.successful > 0) {
      const manifest = this.createGenesisManifest();
      this.saveGenesisManifest(manifest);
    }

    if (this.debug) {
      console.log(`Batch finalization completed. Success: ${results.summary.successful}, Failed: ${results.summary.failed}`);
    }

    return results;
  }

  /**
   * Verify genesis integrity
   */
  verifyGenesisIntegrity(nodeData) {
    const checks = {
      coordinates_anchored: false,
      natiq_locked: false,
      resonance_finalized: false,
      signatures_valid: false,
      overall_integrity: false
    };

    try {
      // Check coordinates anchoring
      if (nodeData.anchored_coordinates && nodeData.harmonic_signature) {
        checks.coordinates_anchored = true;
      }

      // Check NATIQ lock
      if (nodeData.natiq_lock && nodeData.natiq_lock.lock_signature) {
        checks.natiq_locked = true;
      }

      // Check resonance field
      if (nodeData.resonance_field && nodeData.resonance_field.field_signature) {
        checks.resonance_finalized = true;
      }

      // Verify master signature
      if (nodeData.master_signature) {
        const dataToVerify = { ...nodeData };
        delete dataToVerify.master_signature;
        const verificationData = JSON.stringify(dataToVerify, Object.keys(dataToVerify).sort());
        const expectedSignature = crypto.createHash('sha256').update(verificationData).digest('hex');
        
        checks.signatures_valid = expectedSignature === nodeData.master_signature;
      }

      // Overall integrity
      checks.overall_integrity = Object.values(checks).every(check => check === true);

    } catch (error) {
      console.error('Integrity verification failed:', error.message);
    }

    return checks;
  }

  /**
   * Get finalization status
   */
  getFinalizationStatus() {
    return {
      total_nodes_finalized: this.finalizedNodes.size,
      nodes: Array.from(this.finalizedNodes.keys()),
      genesis_anchor: this.genesisAnchor,
      output_directory: this.outputDir,
      last_finalization: this.finalizationTimestamp
    };
  }
}

// CLI functionality
if (require.main === module) {
  const ClaimVerifier = require('./scripts/claimVerifier');

  async function runGenesisFinalization() {
    try {
      console.log('Starting Ball 4D Genesis Finalization...\n');
      
      // Initialize verifier to get claims
      const verifier = new ClaimVerifier({ debug: true });
      const verificationResults = await verifier.verifyAllClaims();
      
      // Get verified claims for finalization
      const verifiedClaims = verificationResults.claims.filter(c => c.status === 'verified');
      
      if (verifiedClaims.length === 0) {
        console.log('No verified claims found for finalization.');
        process.exit(1);
      }

      console.log(`Found ${verifiedClaims.length} verified claims for finalization`);
      
      // Initialize genesis finalizer
      const genesis = new GenesisFinalization({ debug: true });
      
      // Batch finalize all verified claims
      const finalizationResults = await genesis.batchFinalizeNodes(verifiedClaims);
      
      console.log('\n=== Genesis Finalization Summary ===');
      console.log(`Total Claims Processed: ${finalizationResults.summary.total}`);
      console.log(`Successfully Finalized: ${finalizationResults.summary.successful}`);
      console.log(`Failed: ${finalizationResults.summary.failed}`);
      
      if (finalizationResults.failed.length > 0) {
        console.log('\n--- Failed Finalizations ---');
        finalizationResults.failed.forEach(failure => {
          console.log(`${failure.node_id}: ${failure.error}`);
        });
      }

      console.log('\nGenesis finalization completed successfully!');
      console.log(`Output directory: ${genesis.outputDir}`);
      
    } catch (error) {
      console.error('Genesis finalization failed:', error.message);
      process.exit(1);
    }
  }

  runGenesisFinalization();
}

module.exports = GenesisFinalization;