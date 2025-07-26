# NATIQ Scoring Documentation

## Overview

NATIQ (Natural Intelligence Quotient) is Ball 4D's resonance-based scoring system that evaluates the harmonic alignment between nodes, claims, and the sovereign field. The NATIQ score determines a claim's validity and influences its weight within the Ball 4D ecosystem.

## NATIQ Scoring Formula

The NATIQ score is calculated using a composite formula that considers multiple resonance factors:

```
NATIQ = (Spatial_Resonance * 0.4) + (Temporal_Resonance * 0.3) + (Harmonic_Weight * 0.2) + (Drift_Penalty * 0.1)
```

Where:
- **Spatial_Resonance**: Alignment with Golden Spiral Coordinates (0.0 - 1.0)
- **Temporal_Resonance**: Synchronization with Vedic cycles and UTC anchoring (0.0 - 1.0)
- **Harmonic_Weight**: Resonance signature strength and consistency (0.0 - 1.0)
- **Drift_Penalty**: Negative adjustment for node drift or instability (-1.0 - 0.0)

## Scoring Components

### 1. Spatial Resonance (40% weight)

Measures how well a claim's coordinates align with the Golden Spiral mapping system.

**Calculation:**
```javascript
spatial_resonance = 1.0 - (distance_from_spiral_center / max_spiral_radius)
```

**Examples:**
- Perfect spiral alignment: 1.0
- Minor deviation (5% off): 0.95
- Significant deviation (25% off): 0.75
- Outside spiral zone: 0.0

### 2. Temporal Resonance (30% weight)

Evaluates timing alignment with Vedic cycles and system synchronization.

**Calculation:**
```javascript
temporal_resonance = vedic_cycle_alignment * utc_sync_factor * timestamp_validity
```

**Examples:**
- Perfect timing during harmonic window: 1.0
- Good timing with minor delay: 0.85
- Poor timing outside optimal window: 0.45
- Timestamp conflicts: 0.0

### 3. Harmonic Weight (20% weight)

Assesses the resonance signature strength and node consistency.

**Calculation:**
```javascript
harmonic_weight = (signature_strength + node_consistency + field_alignment) / 3
```

**Examples:**
- Strong, consistent signature: 1.0
- Moderate signature with fluctuations: 0.7
- Weak or inconsistent signature: 0.3
- No detectable signature: 0.0

### 4. Drift Penalty (10% weight)

Negative adjustment for node instability or drift from genesis anchor.

**Calculation:**
```javascript
drift_penalty = -(drift_distance / max_acceptable_drift)
```

**Examples:**
- No drift detected: 0.0
- Minor drift within tolerance: -0.1
- Significant drift: -0.5
- Critical drift requiring intervention: -1.0

## NATIQ Score Thresholds

| Score Range | Classification | Action Required |
|-------------|----------------|-----------------|
| 0.85 - 1.0  | Excellent      | Auto-approve |
| 0.70 - 0.84 | Good           | Standard review |
| 0.55 - 0.69 | Moderate       | Enhanced review |
| 0.40 - 0.54 | Poor           | Flag for investigation |
| 0.0 - 0.39  | Critical       | Reject claim |

## Edge Case Logic

### Handling Special Conditions

1. **New Node Initialization**
   - First 24 hours: Apply 0.1 bonus to compensate for calibration period
   - Use genesis anchor as reference point
   - Gradually phase out bonus over initial week

2. **Network Disruption Events**
   - During system maintenance: Pause scoring calculations
   - Post-disruption: Apply 0.05 recovery bonus for 6 hours
   - Use last known good state as baseline

3. **Quantum Leap Events**
   - Sudden coordinate jumps > 1000% typical range
   - Trigger manual verification protocol
   - Temporary score freeze until validation

4. **Resonance Field Collapse**
   - Multiple nodes losing sync simultaneously
   - Activate emergency consensus protocol
   - Use distributed backup scoring until recovery

### Invalid Data Handling

```javascript
// Handle missing or corrupted data
if (!coordinates || !timestamp || !resonance_signature) {
    return { score: 0.0, status: "INVALID_DATA", flag: true };
}

// Handle extreme outliers
if (spatial_resonance < -1.0 || spatial_resonance > 1.0) {
    return { score: 0.0, status: "OUTLIER_DETECTED", flag: true };
}
```

## Harmonic Weighting Details

### Golden Spiral Integration

The harmonic weighting system uses Fibonacci-based calculations to align with the Golden Spiral coordinate system:

```javascript
function calculateHarmonicWeight(coordinates, resonance_signature) {
    const phi = 1.618033988749; // Golden ratio
    const spiral_position = Math.atan2(coordinates.y, coordinates.x);
    const fibonacci_alignment = Math.cos(spiral_position * phi) * 0.5 + 0.5;
    const signature_strength = validateResonanceSignature(resonance_signature);
    
    return fibonacci_alignment * signature_strength;
}
```

### Resonance Signature Validation

```javascript
function validateResonanceSignature(signature) {
    // Check signature format and entropy
    if (signature.length !== 64) return 0.0; // Invalid hex length
    
    const entropy = calculateEntropy(signature);
    const pattern_strength = detectHarmonicPatterns(signature);
    
    return Math.min(entropy * pattern_strength, 1.0);
}
```

## Drift Penalty System

### Drift Detection

Drift is measured as the deviation from expected position based on:
- Genesis anchor coordinates
- Historical movement patterns
- Peer node correlations

```javascript
function calculateDriftPenalty(current_coords, expected_coords, drift_history) {
    const drift_distance = euclideanDistance(current_coords, expected_coords);
    const max_acceptable = 0.001; // Degrees
    
    if (drift_distance <= max_acceptable) {
        return 0.0; // No penalty
    }
    
    const penalty_factor = Math.min(drift_distance / max_acceptable, 10.0);
    return -0.1 * penalty_factor; // Maximum penalty of -1.0
}
```

### Drift Compensation

For gradual drift due to natural causes:
- Continental drift: Built-in compensation tables
- Tidal effects: Harmonic adjustment factors
- Atmospheric interference: Weather-based corrections

## Implementation Guidelines

### Real-time Scoring

```javascript
function calculateNATIQScore(claim) {
    const spatial = calculateSpatialResonance(claim.coordinates);
    const temporal = calculateTemporalResonance(claim.timestamp);
    const harmonic = calculateHarmonicWeight(claim.coordinates, claim.resonance_signature);
    const drift = calculateDriftPenalty(claim.coordinates, claim.expected_coordinates);
    
    const natiq_score = (spatial * 0.4) + (temporal * 0.3) + (harmonic * 0.2) + (drift * 0.1);
    
    return {
        score: Math.max(0.0, Math.min(1.0, natiq_score)),
        components: { spatial, temporal, harmonic, drift },
        timestamp: new Date().toISOString()
    };
}
```

### Batch Processing

For processing multiple claims efficiently:

```javascript
function batchCalculateNATIQ(claims) {
    return claims.map(claim => ({
        claim_id: claim.id,
        natiq_score: calculateNATIQScore(claim),
        processed_at: new Date().toISOString()
    }));
}
```

## Maintenance and Calibration

### Regular Calibration

- **Daily**: Drift compensation updates
- **Weekly**: Harmonic weight recalibration
- **Monthly**: Threshold adjustment based on network performance
- **Quarterly**: Full algorithm review and optimization

### Performance Monitoring

Track key metrics:
- Average score distribution
- Flagged claim percentage
- Processing time per claim
- Node synchronization rates

---

*This documentation is part of the Ball 4D Universe Navigation System and is governed by the Ball 4D Sovereign Commercial License (B4D-SCL).*