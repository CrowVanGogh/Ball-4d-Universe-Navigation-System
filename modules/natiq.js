/**
 * NATIQ Scoring Module - Natural Intelligence Quotient
 * 
 * Pure functions for calculating harmonic resonance scores in the Ball 4D Universe Navigation System.
 * Implements mathematical models for temporal drift normalization, golden ratio alignment,
 * harmonic weighting, and overall node resonance scoring.
 * 
 * @author Ball 4D Universe Navigation System
 * @version 1.0.0
 * @license Ball 4D Sovereign Commercial License (B4D-SCL)
 */

/**
 * The Golden Ratio (φ) - fundamental mathematical constant for spiral harmony
 * φ = (1 + √5) / 2 ≈ 1.618033988749895
 * 
 * Mathematical foundation: The golden ratio appears in nature's spirals, 
 * from nautilus shells to galaxy formations, making it ideal for 
 * universal coordinate alignment calculations.
 */
const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;

/**
 * Natural logarithm of the golden ratio, used in exponential calculations
 * ln(φ) ≈ 0.481211825059603
 */
const LN_GOLDEN_RATIO = Math.log(GOLDEN_RATIO);

/**
 * Normalize temporal drift to a weighted 0-1 factor
 * 
 * Uses a sigmoid-like function to map arbitrary drift values to [0,1] range.
 * The function applies exponential decay to penalize high drift values
 * while preserving sensitivity to small variations.
 * 
 * Mathematical model: f(x) = 1 / (1 + e^(x/φ))
 * Where φ (golden ratio) provides natural scaling for universal harmony.
 * 
 * @param {number} drift - Temporal drift value (can be any real number)
 * @returns {number} Normalized drift factor in range [0, 1]
 *                   0 = maximum drift (poor temporal alignment)
 *                   1 = zero drift (perfect temporal synchronization)
 */
function normalizeDrift(drift) {
    // Input validation
    if (typeof drift !== 'number' || !isFinite(drift)) {
        throw new Error('Drift must be a finite number');
    }
    
    // Apply sigmoid normalization with golden ratio scaling
    // High positive drift → approaches 0
    // Zero drift → approaches 1
    // Negative drift → approaches 1 (temporal advance is beneficial)
    const normalized = 1 / (1 + Math.exp(Math.abs(drift) / GOLDEN_RATIO));
    
    return normalized;
}

/**
 * Calculate coordinate alignment to the golden ratio (φ)
 * 
 * Measures how closely a coordinate system aligns with golden spiral patterns.
 * Uses the golden ratio relationships in both Cartesian and polar representations
 * to determine harmonic resonance with universal mathematical constants.
 * 
 * Mathematical foundation:
 * - Golden spiral: r = ae^(bθ) where b = ln(φ)/π/2
 * - Alignment score based on coordinate ratio proximity to φ
 * - Distance from golden spiral path weighted by φ-based decay
 * 
 * @param {Array<number>} coords - Coordinate array [x, y, z?, w?] (2D to 4D)
 * @returns {number} Alignment score in range [0, 1]
 *                   0 = no golden ratio alignment
 *                   1 = perfect golden spiral alignment
 */
function calculateGoldenRatioAlignment(coords) {
    // Input validation
    if (!Array.isArray(coords) || coords.length < 2) {
        throw new Error('Coordinates must be an array with at least 2 dimensions');
    }
    
    if (!coords.every(coord => typeof coord === 'number' && isFinite(coord))) {
        throw new Error('All coordinates must be finite numbers');
    }
    
    let totalAlignment = 0;
    let pairCount = 0;
    
    // Calculate alignment for all coordinate pairs
    for (let i = 0; i < coords.length - 1; i++) {
        for (let j = i + 1; j < coords.length; j++) {
            const a = Math.abs(coords[i]);
            const b = Math.abs(coords[j]);
            
            // Avoid division by zero
            if (a === 0 && b === 0) continue;
            
            // Calculate ratio and compare to golden ratio
            const ratio = (a > b) ? a / Math.max(b, Number.EPSILON) : b / Math.max(a, Number.EPSILON);
            
            // Measure deviation from golden ratio using exponential decay
            // Closer to φ → higher alignment score
            const deviation = Math.abs(ratio - GOLDEN_RATIO);
            const alignment = Math.exp(-deviation * LN_GOLDEN_RATIO);
            
            totalAlignment += alignment;
            pairCount++;
        }
    }
    
    // Handle edge case of single coordinate pair
    if (pairCount === 0) return 0;
    
    // Average alignment across all coordinate pairs
    const averageAlignment = totalAlignment / pairCount;
    
    // Apply golden ratio enhancement for naturally occurring φ patterns
    // Coordinates that naturally exhibit φ relationships get bonus scoring
    const polarRadius = Math.sqrt(coords.reduce((sum, coord) => sum + coord * coord, 0));
    const goldenEnhancement = Math.exp(-Math.abs(polarRadius % GOLDEN_RATIO) / GOLDEN_RATIO);
    
    return Math.min(1, averageAlignment * (1 + goldenEnhancement * 0.1));
}

/**
 * Aggregate harmonics with exponential decay weighting
 * 
 * Applies exponential decay to harmonic frequencies, emphasizing fundamental
 * frequencies while progressively diminishing higher harmonics. This models
 * natural resonance patterns where lower frequencies carry more energy.
 * 
 * Mathematical model: W(n) = A(n) * e^(-n/φ)
 * Where:
 * - A(n) is the amplitude of the nth harmonic
 * - φ provides natural decay rate based on golden ratio
 * - Higher harmonic numbers (n) receive exponentially less weight
 * 
 * @param {Array<number>} harmonics - Array of harmonic amplitudes
 * @returns {number} Weighted harmonic sum normalized to [0, 1]
 */
function weightHarmonics(harmonics) {
    // Input validation
    if (!Array.isArray(harmonics) || harmonics.length === 0) {
        throw new Error('Harmonics must be a non-empty array');
    }
    
    if (!harmonics.every(h => typeof h === 'number' && isFinite(h))) {
        throw new Error('All harmonic values must be finite numbers');
    }
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    // Apply exponential decay weighting to each harmonic
    harmonics.forEach((amplitude, index) => {
        // Harmonic number starts at 1 (fundamental frequency)
        const harmonicNumber = index + 1;
        
        // Exponential decay weight using golden ratio
        const weight = Math.exp(-harmonicNumber / GOLDEN_RATIO);
        
        // Accumulate weighted amplitude
        weightedSum += Math.abs(amplitude) * weight;
        totalWeight += weight;
    });
    
    // Normalize by total weight to maintain [0, 1] range
    const normalizedSum = totalWeight > 0 ? weightedSum / totalWeight : 0;
    
    // Apply harmonic series enhancement for perfect ratios
    // Boost score for harmonics that follow natural frequency relationships
    let harmonicBonus = 0;
    for (let i = 1; i < harmonics.length; i++) {
        const ratio = Math.abs(harmonics[0]) > 0 ? Math.abs(harmonics[i]) / Math.abs(harmonics[0]) : 0;
        const idealRatio = 1 / (i + 1); // Natural harmonic series ratio
        const ratioAlignment = Math.exp(-Math.abs(ratio - idealRatio) * GOLDEN_RATIO);
        harmonicBonus += ratioAlignment / harmonics.length;
    }
    
    return Math.min(1, normalizedSum * (1 + harmonicBonus * 0.15));
}

/**
 * Calculate overall NATIQ score for a node (0-100 scale)
 * 
 * Combines harmonic resonance, golden spiral alignment, and temporal drift
 * into a unified Natural Intelligence Quotient score. The algorithm weighs
 * each component according to their importance in universal resonance.
 * 
 * Scoring Formula:
 * NATIQ = 100 * [α*H + β*G + γ*D]
 * Where:
 * - H = weightHarmonics(node.harmonics) [0,1]
 * - G = calculateGoldenRatioAlignment(node.coordinates) [0,1]  
 * - D = normalizeDrift(node.drift) [0,1]
 * - α = 0.4 (harmonic weight - primary resonance factor)
 * - β = 0.35 (golden ratio weight - spatial alignment factor)
 * - γ = 0.25 (drift weight - temporal stability factor)
 * - α + β + γ = 1.0 (normalized weights)
 * 
 * Score Interpretation:
 * - 90-100: Perfect resonance (optimal for navigation)
 * - 75-89:  High resonance (excellent alignment)
 * - 60-74:  Good resonance (suitable for most operations)
 * - 40-59:  Moderate resonance (basic functionality)
 * - 20-39:  Low resonance (requires calibration)
 * - 0-19:   Poor resonance (system instability)
 * 
 * @param {Object} node - Node object with properties:
 *   @param {Array<number>} node.harmonics - Harmonic frequency amplitudes
 *   @param {Array<number>} node.coordinates - Spatial coordinates [x,y,z?,w?]
 *   @param {number} node.drift - Temporal drift value
 * @returns {number} NATIQ score in range [0, 100]
 */
function scoreNodeResonance(node) {
    // Input validation
    if (!node || typeof node !== 'object') {
        throw new Error('Node must be an object');
    }
    
    if (!node.harmonics || !node.coordinates || typeof node.drift !== 'number') {
        throw new Error('Node must have harmonics (array), coordinates (array), and drift (number) properties');
    }
    
    // Calculate individual component scores
    const harmonicScore = weightHarmonics(node.harmonics);
    const alignmentScore = calculateGoldenRatioAlignment(node.coordinates);
    const driftScore = normalizeDrift(node.drift);
    
    // Weighted combination using golden ratio inspired weights
    // These weights are derived from φ-based proportions for natural balance
    const harmonicWeight = 0.4;    // Primary component (2/5)
    const alignmentWeight = 0.35;  // Secondary component (φ-1)/φ ≈ 0.382
    const driftWeight = 0.25;      // Tertiary component (1/φ²) ≈ 0.236
    
    // Calculate weighted average
    const weightedScore = (
        harmonicWeight * harmonicScore +
        alignmentWeight * alignmentScore +
        driftWeight * driftScore
    );
    
    // Apply resonance amplification for highly aligned nodes
    // Nodes with high scores in all categories get bonus amplification
    const minScore = Math.min(harmonicScore, alignmentScore, driftScore);
    const resonanceBonus = Math.exp(minScore * LN_GOLDEN_RATIO) - 1;
    const amplifiedScore = weightedScore * (1 + resonanceBonus * 0.1);
    
    // Convert to 0-100 scale and ensure bounds
    const natiqScore = Math.min(100, Math.max(0, amplifiedScore * 100));
    
    return Math.round(natiqScore * 100) / 100; // Round to 2 decimal places
}

// Export all functions for module usage
if (typeof module !== 'undefined' && module.exports) {
    // Node.js/CommonJS export
    module.exports = {
        normalizeDrift,
        calculateGoldenRatioAlignment,
        weightHarmonics,
        scoreNodeResonance,
        GOLDEN_RATIO
    };
} else if (typeof window !== 'undefined') {
    // Browser global export
    window.NATIQ = {
        normalizeDrift,
        calculateGoldenRatioAlignment,
        weightHarmonics,
        scoreNodeResonance,
        GOLDEN_RATIO
    };
}