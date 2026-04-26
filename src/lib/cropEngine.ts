export interface Crop {
  name: string;
  phRange: [number, number];
  rainRange: [number, number];
  tempRange: [number, number];
  tips: string;
  advice: string;
}

export interface CropInputs {
  ph: number;
  rainfall: number;
  temperature: number;
}

export interface Recommendation {
  crop: string | null;
  explanation: string;
  advice: string;
  confidence: number;
  tips: string;
}

export const CROP_LIBRARY: Crop[] = [
  { name: "Maize (Hybrid)", phRange: [5.5, 7.0], rainRange: [500, 1200], tempRange: [18, 30], tips: "Apply starter fertilizer, weed before V6 stage.", advice: "Use certified drought-tolerant varieties in erratic rainfall zones. Rotate with legumes." },
  { name: "Beans (High Iron)", phRange: [6.0, 7.5], rainRange: [300, 800], tempRange: [15, 28], tips: "Inoculate with rhizobium for nitrogen fixation.", advice: "Intercropping with maize boosts yield and soil health." },
  { name: "Cassava (Drought Pro)", phRange: [4.5, 6.5], rainRange: [600, 1500], tempRange: [20, 35], tips: "Tolerant to marginal soils; harvest at 12 months.", advice: "Use disease-free cuttings, plant on ridges." },
  { name: "Sweet Potato (Organic)", phRange: [5.5, 6.5], rainRange: [500, 1000], tempRange: [20, 30], tips: "Grows well in sandy loam; low fertilizer need.", advice: "Rotate with cereals to prevent nematodes." },
  { name: "Tomato (Gourmet)", phRange: [6.0, 6.8], rainRange: [400, 600], tempRange: [20, 27], tips: "Staking & mulching improve quality.", advice: "Calcium spray prevents blossom end rot." },
  { name: "Cabbage (Premium)", phRange: [6.0, 7.5], rainRange: [400, 800], tempRange: [15, 25], tips: "Transplant at 4-6 leaf stage.", advice: "Use BT for caterpillar control." },
  { name: "Sorghum (ClimateSmart)", phRange: [5.5, 7.5], rainRange: [350, 1000], tempRange: [22, 35], tips: "Excellent for dry areas.", advice: "Low water demand; ideal for semi-arid regions." },
  { name: "Groundnut (NutriRich)", phRange: [5.8, 7.0], rainRange: [500, 900], tempRange: [24, 30], tips: "Fix atmospheric nitrogen.", advice: "Apply gypsum at pegging stage." },
];

function evaluateCropMatch(crop: Crop, { ph, rainfall, temperature }: CropInputs) {
  let score = 0;
  const phInRange = ph >= crop.phRange[0] && ph <= crop.phRange[1];
  const rainInRange = rainfall >= crop.rainRange[0] && rainfall <= crop.rainRange[1];
  const tempInRange = temperature >= crop.tempRange[0] && temperature <= crop.tempRange[1];

  if (phInRange) score += 38;
  else {
    const mid = (crop.phRange[0] + crop.phRange[1]) / 2;
    const diff = Math.abs(ph - mid) / ((crop.phRange[1] - crop.phRange[0]) || 1);
    score += Math.max(0, 30 - diff * 30);
  }
  if (rainInRange) score += 32;
  else {
    const mid = (crop.rainRange[0] + crop.rainRange[1]) / 2;
    const diff = Math.abs(rainfall - mid) / ((crop.rainRange[1] - crop.rainRange[0]) || 1);
    score += Math.max(0, 25 - diff * 25);
  }
  if (tempInRange) score += 30;
  else {
    const mid = (crop.tempRange[0] + crop.tempRange[1]) / 2;
    const diff = Math.abs(temperature - mid) / ((crop.tempRange[1] - crop.tempRange[0]) || 1);
    score += Math.max(0, 22 - diff * 22);
  }
  const finalScore = Math.min(99, Math.floor(score + 8));
  const isRecommended = (phInRange && rainInRange && tempInRange) || finalScore >= 58;
  return { suitable: isRecommended, confidence: finalScore };
}

export async function getSmartRecommendation(inputs: CropInputs): Promise<Recommendation> {
  await new Promise((r) => setTimeout(r, 950));
  let best: Crop | null = null;
  let bestConfidence = -1;
  for (const crop of CROP_LIBRARY) {
    const { suitable, confidence } = evaluateCropMatch(crop, inputs);
    if (suitable && confidence > bestConfidence) {
      bestConfidence = confidence;
      best = crop;
    }
  }
  if (!best) {
    return {
      crop: null,
      explanation:
        "No crop meets optimal thresholds. Consider soil amendments (lime/sulfur) or adjust planting window.",
      advice: "Consult local agro-advisor for customized strategy. Try introducing organic matter.",
      confidence: 0,
      tips: "Soil pH adjustment or rainwater harvesting could expand options.",
    };
  }
  const { ph, rainfall, temperature } = inputs;
  const reasons: string[] = [];
  if (ph >= best.phRange[0] && ph <= best.phRange[1])
    reasons.push(`✅ pH ${ph} optimal (range ${best.phRange[0]}-${best.phRange[1]})`);
  else reasons.push(`🔄 pH ${ph} outside ideal ${best.phRange[0]}-${best.phRange[1]} — amend accordingly`);
  if (rainfall >= best.rainRange[0] && rainfall <= best.rainRange[1])
    reasons.push(`💧 Rainfall ${rainfall}mm aligns with ${best.name} requirements`);
  else
    reasons.push(`⚠️ Rainfall ${rainfall}mm — recommended ${best.rainRange[0]}-${best.rainRange[1]}mm`);
  if (temperature >= best.tempRange[0] && temperature <= best.tempRange[1])
    reasons.push(`🌡️ Temperature ${temperature}°C in ideal band`);
  else
    reasons.push(`🌿 Temperature ${temperature}°C — optimal range ${best.tempRange[0]}-${best.tempRange[1]}°C`);

  return {
    crop: best.name,
    explanation: reasons.join("<br>"),
    advice: best.advice,
    confidence: bestConfidence,
    tips: best.tips,
  };
}
