/**
 * Ball 4D Claim Verifier
 * 
 * Loads verified_claims.json, validates NATIQ scores against thresholds,
 * flags claims below threshold, and outputs comprehensive summary reports.
 * 
 * @author Ball 4D Development Team
 * @license Ball 4D Sovereign Commercial License (B4D-SCL)
 */

const fs = require('fs');
const path = require('path');

class ClaimVerifier {
  constructor(options = {}) {
    this.debug = options.debug || false;
    this.claimsFilePath = options.claimsFilePath || path.join(process.cwd(), 'verified_claims.json');
    this.natiqThreshold = options.natiqThreshold || 0.55;
    this.driftThreshold = options.driftThreshold || -0.15;
    this.spatialThreshold = options.spatialThreshold || 0.50;
    this.temporalThreshold = options.temporalThreshold || 0.50;
    this.harmonicThreshold = options.harmonicThreshold || 0.40;
    
    this.verificationResults = null;
  }

  /**
   * Load and parse the verified claims JSON file
   */
  loadClaims() {
    try {
      if (!fs.existsSync(this.claimsFilePath)) {
        throw new Error(`Claims file not found: ${this.claimsFilePath}`);
      }

      const fileContent = fs.readFileSync(this.claimsFilePath, 'utf8');
      const data = JSON.parse(fileContent);

      if (!data.claims || !Array.isArray(data.claims)) {
        throw new Error('Invalid claims file format: missing claims array');
      }

      if (this.debug) {
        console.log(`Loaded ${data.claims.length} claims from ${this.claimsFilePath}`);
      }

      return data;
    } catch (error) {
      console.error('Failed to load claims:', error.message);
      throw error;
    }
  }

  /**
   * Validate individual claim structure and data
   */
  validateClaimStructure(claim) {
    const requiredFields = ['claim_id', 'node_id', 'coordinates', 'timestamp', 'natiq_score'];
    const errors = [];

    // Check required fields
    for (const field of requiredFields) {
      if (!claim.hasOwnProperty(field) || claim[field] === null || claim[field] === undefined) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate coordinates
    if (claim.coordinates) {
      if (!Array.isArray(claim.coordinates) || claim.coordinates.length !== 2) {
        errors.push('Coordinates must be [latitude, longitude] array');
      } else {
        const [lat, lon] = claim.coordinates;
        if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
          errors.push('Invalid coordinate values');
        }
      }
    }

    // Validate timestamp
    if (claim.timestamp && isNaN(Date.parse(claim.timestamp))) {
      errors.push('Invalid timestamp format');
    }

    // Validate NATIQ score
    if (claim.natiq_score !== undefined) {
      if (isNaN(claim.natiq_score) || claim.natiq_score < 0 || claim.natiq_score > 1) {
        errors.push('NATIQ score must be a number between 0 and 1');
      }
    }

    // Validate component scores if present
    const componentFields = ['spatial_resonance', 'temporal_resonance', 'harmonic_weight', 'drift_penalty'];
    for (const field of componentFields) {
      if (claim[field] !== undefined) {
        if (isNaN(claim[field])) {
          errors.push(`${field} must be a number`);
        } else if (field === 'drift_penalty') {
          if (claim[field] > 0 || claim[field] < -1) {
            errors.push('drift_penalty must be between -1 and 0');
          }
        } else {
          if (claim[field] < 0 || claim[field] > 1) {
            errors.push(`${field} must be between 0 and 1`);
          }
        }
      }
    }

    return errors;
  }

  /**
   * Validate NATIQ score against threshold and component thresholds
   */
  validateNATIQScore(claim) {
    const validationResult = {
      claim_id: claim.claim_id,
      natiq_score: claim.natiq_score,
      passes_threshold: claim.natiq_score >= this.natiqThreshold,
      component_analysis: {},
      flags: [],
      severity: 'none'
    };

    // Check overall NATIQ threshold
    if (claim.natiq_score < this.natiqThreshold) {
      validationResult.flags.push(`NATIQ score ${claim.natiq_score} below threshold ${this.natiqThreshold}`);
      
      if (claim.natiq_score < 0.40) {
        validationResult.severity = 'critical';
      } else if (claim.natiq_score < 0.55) {
        validationResult.severity = 'high';
      } else {
        validationResult.severity = 'medium';
      }
    }

    // Analyze component scores
    if (claim.spatial_resonance !== undefined) {
      validationResult.component_analysis.spatial_resonance = {
        value: claim.spatial_resonance,
        passes: claim.spatial_resonance >= this.spatialThreshold,
        threshold: this.spatialThreshold
      };
      
      if (claim.spatial_resonance < this.spatialThreshold) {
        validationResult.flags.push(`Spatial resonance ${claim.spatial_resonance} below threshold ${this.spatialThreshold}`);
      }
    }

    if (claim.temporal_resonance !== undefined) {
      validationResult.component_analysis.temporal_resonance = {
        value: claim.temporal_resonance,
        passes: claim.temporal_resonance >= this.temporalThreshold,
        threshold: this.temporalThreshold
      };
      
      if (claim.temporal_resonance < this.temporalThreshold) {
        validationResult.flags.push(`Temporal resonance ${claim.temporal_resonance} below threshold ${this.temporalThreshold}`);
      }
    }

    if (claim.harmonic_weight !== undefined) {
      validationResult.component_analysis.harmonic_weight = {
        value: claim.harmonic_weight,
        passes: claim.harmonic_weight >= this.harmonicThreshold,
        threshold: this.harmonicThreshold
      };
      
      if (claim.harmonic_weight < this.harmonicThreshold) {
        validationResult.flags.push(`Harmonic weight ${claim.harmonic_weight} below threshold ${this.harmonicThreshold}`);
      }
    }

    if (claim.drift_penalty !== undefined) {
      validationResult.component_analysis.drift_penalty = {
        value: claim.drift_penalty,
        passes: claim.drift_penalty >= this.driftThreshold,
        threshold: this.driftThreshold
      };
      
      if (claim.drift_penalty < this.driftThreshold) {
        validationResult.flags.push(`Drift penalty ${claim.drift_penalty} exceeds threshold ${this.driftThreshold}`);
        if (validationResult.severity === 'none' || validationResult.severity === 'medium') {
          validationResult.severity = 'high';
        }
      }
    }

    return validationResult;
  }

  /**
   * Perform comprehensive verification of all claims
   */
  async verifyAllClaims() {
    const claimsData = this.loadClaims();
    const verificationResults = {
      timestamp: new Date().toISOString(),
      thresholds: {
        natiq: this.natiqThreshold,
        spatial: this.spatialThreshold,
        temporal: this.temporalThreshold,
        harmonic: this.harmonicThreshold,
        drift: this.driftThreshold
      },
      claims: [],
      summary: {
        total_claims: claimsData.claims.length,
        verified_claims: 0,
        flagged_claims: 0,
        critical_claims: 0,
        structural_errors: 0
      },
      flagged_claims: [],
      critical_claims: [],
      error_claims: []
    };

    for (const claim of claimsData.claims) {
      const claimResult = {
        claim_id: claim.claim_id,
        node_id: claim.node_id,
        natiq_score: claim.natiq_score,
        coordinates: claim.coordinates,
        timestamp: claim.timestamp,
        structural_errors: [],
        validation_result: null,
        flagged: false,
        critical: false,
        status: 'unknown'
      };

      // Check structural integrity
      claimResult.structural_errors = this.validateClaimStructure(claim);
      
      if (claimResult.structural_errors.length > 0) {
        claimResult.status = 'structural_error';
        verificationResults.summary.structural_errors++;
        verificationResults.error_claims.push(claimResult);
      } else {
        // Validate NATIQ score and components
        claimResult.validation_result = this.validateNATIQScore(claim);
        
        if (claimResult.validation_result.flags.length > 0) {
          claimResult.flagged = true;
          claimResult.status = 'flagged';
          claimResult.flag_reasons = claimResult.validation_result.flags;
          verificationResults.summary.flagged_claims++;
          verificationResults.flagged_claims.push(claimResult);
          
          if (claimResult.validation_result.severity === 'critical') {
            claimResult.critical = true;
            claimResult.status = 'critical';
            verificationResults.summary.critical_claims++;
            verificationResults.critical_claims.push(claimResult);
          }
        } else {
          claimResult.status = 'verified';
          verificationResults.summary.verified_claims++;
        }
      }

      verificationResults.claims.push(claimResult);
    }

    // Calculate additional metrics
    verificationResults.summary.verification_rate = 
      `${((verificationResults.summary.verified_claims / verificationResults.summary.total_claims) * 100).toFixed(2)}%`;
    
    verificationResults.summary.flag_rate = 
      `${((verificationResults.summary.flagged_claims / verificationResults.summary.total_claims) * 100).toFixed(2)}%`;
    
    verificationResults.summary.critical_rate = 
      `${((verificationResults.summary.critical_claims / verificationResults.summary.total_claims) * 100).toFixed(2)}%`;

    // Store results for later use
    this.verificationResults = verificationResults;

    if (this.debug) {
      console.log('Verification completed:', verificationResults.summary);
    }

    return verificationResults;
  }

  /**
   * Generate detailed summary report
   */
  generateSummaryReport(verificationResults = null) {
    const results = verificationResults || this.verificationResults;
    
    if (!results) {
      throw new Error('No verification results available. Run verifyAllClaims() first.');
    }

    const report = {
      header: {
        title: 'Ball 4D Claim Verification Report',
        generated_at: new Date().toISOString(),
        verifier_version: '1.0.0',
        claims_file: this.claimsFilePath
      },
      executive_summary: {
        total_claims_processed: results.summary.total_claims,
        verification_outcome: {
          verified: results.summary.verified_claims,
          flagged: results.summary.flagged_claims,
          critical: results.summary.critical_claims,
          structural_errors: results.summary.structural_errors
        },
        success_metrics: {
          verification_rate: results.summary.verification_rate,
          flag_rate: results.summary.flag_rate,
          critical_rate: results.summary.critical_rate
        }
      },
      thresholds_applied: results.thresholds,
      detailed_findings: {
        verified_claims: results.claims.filter(c => c.status === 'verified').map(c => ({
          claim_id: c.claim_id,
          node_id: c.node_id,
          natiq_score: c.natiq_score,
          coordinates: c.coordinates
        })),
        flagged_claims: results.flagged_claims.map(c => ({
          claim_id: c.claim_id,
          node_id: c.node_id,
          natiq_score: c.natiq_score,
          severity: c.validation_result?.severity || 'unknown',
          flag_reasons: c.flag_reasons || [],
          component_analysis: c.validation_result?.component_analysis || {}
        })),
        critical_claims: results.critical_claims.map(c => ({
          claim_id: c.claim_id,
          node_id: c.node_id,
          natiq_score: c.natiq_score,
          flag_reasons: c.flag_reasons || [],
          immediate_action_required: true
        })),
        structural_errors: results.error_claims.map(c => ({
          claim_id: c.claim_id,
          node_id: c.node_id,
          errors: c.structural_errors
        }))
      },
      recommendations: this.generateRecommendations(results),
      next_actions: this.generateNextActions(results)
    };

    return report;
  }

  /**
   * Generate recommendations based on verification results
   */
  generateRecommendations(results) {
    const recommendations = [];

    if (results.summary.critical_claims > 0) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Immediate Investigation Required',
        details: `${results.summary.critical_claims} claims have critical NATIQ scores and require immediate attention.`
      });
    }

    if (results.summary.flagged_claims > results.summary.total_claims * 0.3) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Review Threshold Settings',
        details: 'High flag rate may indicate thresholds need adjustment or system calibration issues.'
      });
    }

    if (results.summary.structural_errors > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Data Quality Improvement',
        details: `${results.summary.structural_errors} claims have structural errors that need correction.`
      });
    }

    const avgNatiq = results.claims
      .filter(c => c.natiq_score !== undefined)
      .reduce((sum, c) => sum + c.natiq_score, 0) / results.claims.length;

    if (avgNatiq < 0.7) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'System Performance Review',
        details: `Average NATIQ score of ${avgNatiq.toFixed(3)} suggests potential system-wide issues.`
      });
    }

    return recommendations;
  }

  /**
   * Generate next actions based on verification results
   */
  generateNextActions(results) {
    const actions = [];

    if (results.summary.critical_claims > 0) {
      actions.push('Suspend critical claims from active processing');
      actions.push('Initiate manual review of critical claims');
    }

    if (results.summary.flagged_claims > 0) {
      actions.push('Queue flagged claims for enhanced verification');
    }

    if (results.summary.verified_claims > 0) {
      actions.push('Proceed with IPFS upload for verified claims');
      actions.push('Update node synchronization status');
    }

    actions.push('Archive verification report');
    actions.push('Schedule next verification cycle');

    return actions;
  }

  /**
   * Save verification report to file
   */
  saveReport(report, outputPath = null) {
    const filePath = outputPath || path.join(process.cwd(), `verification_report_${Date.now()}.json`);
    
    try {
      fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf8');
      
      if (this.debug) {
        console.log(`Verification report saved to: ${filePath}`);
      }
      
      return filePath;
    } catch (error) {
      console.error('Failed to save report:', error.message);
      throw error;
    }
  }

  /**
   * Print summary to console
   */
  printSummary(results = null) {
    const data = results || this.verificationResults;
    
    if (!data) {
      console.log('No verification results available.');
      return;
    }

    console.log('\n=== Ball 4D Claim Verification Summary ===');
    console.log(`Total Claims: ${data.summary.total_claims}`);
    console.log(`Verified: ${data.summary.verified_claims} (${data.summary.verification_rate})`);
    console.log(`Flagged: ${data.summary.flagged_claims} (${data.summary.flag_rate})`);
    console.log(`Critical: ${data.summary.critical_claims} (${data.summary.critical_rate})`);
    console.log(`Structural Errors: ${data.summary.structural_errors}`);
    
    if (data.summary.flagged_claims > 0) {
      console.log('\n--- Flagged Claims ---');
      data.flagged_claims.forEach(claim => {
        console.log(`${claim.claim_id}: NATIQ ${claim.natiq_score} - ${claim.flag_reasons?.join(', ')}`);
      });
    }

    if (data.summary.critical_claims > 0) {
      console.log('\n--- Critical Claims (Immediate Attention Required) ---');
      data.critical_claims.forEach(claim => {
        console.log(`${claim.claim_id}: NATIQ ${claim.natiq_score} - CRITICAL`);
      });
    }

    console.log('\n==========================================\n');
  }
}

// CLI functionality
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    
    if (value && !value.startsWith('--')) {
      if (key === 'natiq-threshold' || key === 'drift-threshold' || 
          key === 'spatial-threshold' || key === 'temporal-threshold' || 
          key === 'harmonic-threshold') {
        options[key.replace('-', '_')] = parseFloat(value);
      } else {
        options[key.replace('-', '_')] = value;
      }
    } else if (key === 'debug') {
      options.debug = true;
      i--; // No value for debug flag
    }
  }

  async function runVerification() {
    try {
      const verifier = new ClaimVerifier(options);
      console.log('Starting Ball 4D claim verification...\n');
      
      const results = await verifier.verifyAllClaims();
      verifier.printSummary(results);
      
      const report = verifier.generateSummaryReport(results);
      const reportPath = verifier.saveReport(report);
      
      console.log(`Detailed report saved to: ${reportPath}`);
      
      // Exit with appropriate code
      if (results.summary.critical_claims > 0) {
        process.exit(2); // Critical issues found
      } else if (results.summary.flagged_claims > 0) {
        process.exit(1); // Issues found but not critical
      } else {
        process.exit(0); // Success
      }
      
    } catch (error) {
      console.error('Verification failed:', error.message);
      process.exit(3);
    }
  }

  runVerification();
}

module.exports = ClaimVerifier;