// lib/scoring.ts

// Helper: Standardize angles to 0-180 (Absolute deviation from neutral)
// This handles negative inputs (-150 -> 150) and wrap-arounds (316 -> 44)
function normalizeAngle(angle: number) {
  let a = angle % 360;
  
  if (a > 180) a = 360 - a;
  
  return Math.abs(a);
}

// Helper: Calculate score with decay
function getSubScore(value: number, min: number, max: number): number {
  if (value >= min && value <= max) return 100;
  
  const diff = Math.min(Math.abs(value - min), Math.abs(value - max));
  // Relaxed decay: lose 5 points per degree off (instead of 10 or 2)
  return Math.max(0, 100 - diff * 5); 
}

export function calculateSwingScore(analysis: any) {
  if (!analysis) return null;

  const scores = {
    separation: 0,
    shoulderRotation: 0,
    hipRotation: 0,
    tempo: 0,
    total: 0,
  };

  // 1. Hip-Shoulder Separation (Djokovic: ~43.7°)
  // Range set to 35-55 to mimic realistic pro values
  if (analysis.engine?.hip_shoulder_separation?.max_value !== undefined) {
    const rawSep = analysis.engine.hip_shoulder_separation.max_value;
    const sep = normalizeAngle(rawSep);
    scores.separation = getSubScore(sep, 35, 55);
  }

  // 2. Max Shoulder Rotation (Djokovic: ~150.4°)
  // Range shifted significantly higher to match model perception
  // New Range: 130° - 165°
  if (analysis.engine?.max_shoulder_rotation?.value !== undefined) {
    const rawRot = analysis.engine.max_shoulder_rotation.value;
    const rot = normalizeAngle(rawRot);
    scores.shoulderRotation = getSubScore(rot, 130, 165);
  }

  // 3. Max Hip Rotation (Djokovic: ~157.1°)
  // Range shifted significantly higher to match model perception
  // New Range: 140° - 170°
  if (analysis.engine?.max_hip_rotation?.value !== undefined) {
    const rawHip = analysis.engine.max_hip_rotation.value;
    const hip = normalizeAngle(rawHip);
    scores.hipRotation = getSubScore(hip, 140, 170);
  }

  // 4. Tempo (Leaving as is, assuming ratio logic holds true for pros)
  if (analysis.tempo?.swing_rhythm_ratio !== undefined) {
    const ratio = analysis.tempo.swing_rhythm_ratio;
    if (ratio >= 2.5 && ratio <= 3.1) { // Slight relaxation on upper bound
        scores.tempo = 100;
    } else {
        const diff = Math.min(Math.abs(ratio - 2.5), Math.abs(ratio - 3.1));
        scores.tempo = Math.max(0, 100 - (diff * 20)); 
    }
  }

  // Calculate weighted average
  scores.total = Math.round(
    scores.separation * 0.3 + 
    scores.shoulderRotation * 0.2 + 
    scores.hipRotation * 0.2 +
    scores.tempo * 0.3
  );

  return scores;
}