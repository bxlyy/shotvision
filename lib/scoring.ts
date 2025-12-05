// lib/scoring.ts

// Helper to normalize angles to -180 to 180
function normalizeAngle(angle: number) {
  let a = angle % 360;
  if (a > 180) a -= 360;
  if (a < -180) a += 360;
  return Math.abs(a);
}

// Helper to calculate a score based on ranges. Gemini helped come up with how to design logic to calculate scores outside of range
function getSubScore(value: number, min: number, max: number): number {
  if (value >= min && value <= max) return 100;

  // Decay logic (implemented by Gemini): 10 points lost for every unit outside the range (adjust as needed)
  const diff = Math.min(Math.abs(value - min), Math.abs(value - max));
  return Math.max(0, 100 - diff * 2);
}

export function calculateSwingScore(analysis: any) {
  if (!analysis) return null;

  const scores = {
    separation: 0,
    rotation: 0,
    kineticChain: 0,
    total: 0,
  };

  // Hip-shoulder separation (ideal: 20-40 degrees (from Eddie's sheet))
  if (analysis.engine?.hip_shoulder_separation?.max_value) {
    const rawSep = analysis.engine.hip_shoulder_separation.max_value;
    const sep = normalizeAngle(rawSep);
    scores.separation = getSubScore(sep, 20, 40);
  }

  // Max shoulder rotation (ideal: 90-110 degrees (from Eddie's sheet))
  if (analysis.engine?.max_shoulder_rotation?.value) {
    const rawRot = analysis.engine.max_shoulder_rotation.value;
    const rot = normalizeAngle(rawRot);
    scores.rotation = getSubScore(rot, 90, 110);
  }

  // 3. Kinetic chain sequence (boolean sequence)
  const seq = analysis.kinetic_chain?.peak_velocity_sequence;
  if (seq) {
    const isCorrectOrder =
      seq.hip.timestamp < seq.shoulder.timestamp &&
      seq.shoulder.timestamp < seq.elbow.timestamp &&
      seq.elbow.timestamp < seq.wrist.timestamp;

    scores.kineticChain = isCorrectOrder ? 100 : 50;
  }

  // Calculate weighted average
  scores.total = Math.round(
    scores.separation * 0.4 + scores.kineticChain * 0.3 + scores.rotation * 0.3
  );

  return scores;
}
