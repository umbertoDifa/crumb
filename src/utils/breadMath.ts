// Core Bread Math Calculations
// Professional Baker's Math with DDT calculations

import { CONSTANTS } from './constants';
import type { RecipeInputs, RecipeOutput, Preferment, FinalDough, Step } from '../types';

/**
 * Calculate the friction factor based on mixer type and hydration
 */
export function calculateFriction(mixer: RecipeInputs['mixer'], hydration: number): number {
  const baseFriction = mixer === 'HAND' ? CONSTANTS.FRICTION_HAND : CONSTANTS.FRICTION_MIXER;
  
  // High hydration reduces friction (less resistance in wet doughs)
  if (hydration > CONSTANTS.HIGH_HYDRATION_THRESHOLD) {
    return Math.max(0, baseFriction - CONSTANTS.HIGH_HYDRATION_FRICTION_REDUCTION);
  }
  
  return baseFriction;
}

/**
 * Calculate the required water temperature using Rule of 3 (Direct) or Rule of 4 (Indirect)
 * 
 * Direct Method (Rule of 3):
 * Water Temp = (Target DDT × 3) - Room Temp - Flour Temp - Friction
 * 
 * Indirect Method (Rule of 4):
 * Water Temp = (Target DDT × 4) - Room Temp - Flour Temp - Friction - Preferment Temp
 */
export function calculateWaterTemp(inputs: RecipeInputs): number {
  const { method, mixer, roomTemp, prefermentStorage, targetHydration } = inputs;
  
  const friction = calculateFriction(mixer, targetHydration);
  const flourTemp = roomTemp; // Assume flour temp equals room temp
  
  let waterTemp: number;
  
  if (method === 'DIRECT') {
    // Rule of 3
    waterTemp = (CONSTANTS.TARGET_DDT * 3) - roomTemp - flourTemp - friction;
  } else {
    // Rule of 4 (BIGA or POOLISH)
    const prefermentTemp = prefermentStorage === 'FRIDGE' 
      ? CONSTANTS.FRIDGE_TEMP 
      : roomTemp;
    
    waterTemp = (CONSTANTS.TARGET_DDT * 4) - roomTemp - flourTemp - friction - prefermentTemp;
  }
  
  // Clamp water temp to reasonable bounds (0°C to 40°C)
  return Math.round(Math.max(0, Math.min(40, waterTemp)));
}

/**
 * Calculate yeast amount based on fermentation speed and hydration
 */
export function calculateYeast(
  totalFlour: number, 
  fermentationSpeed: number, 
  hydration: number
): number {
  // Base yeast percentage adjusted by fermentation speed
  // Speed 1.0 = 1.5%, Speed 0.5 = 0.75%, Speed 2.0 = 3.0%
  let yeastPercent = CONSTANTS.FRESH_YEAST_BASE * fermentationSpeed;
  
  // High hydration doughs ferment faster, reduce yeast
  if (hydration > CONSTANTS.HIGH_HYDRATION_THRESHOLD) {
    yeastPercent *= (1 - CONSTANTS.HIGH_HYDRATION_YEAST_REDUCTION);
  }
  
  return Math.round((totalFlour * yeastPercent / 100) * 10) / 10;
}

/**
 * Calculate preferment (Biga or Poolish) composition
 */
export function calculatePreferment(
  method: RecipeInputs['method'],
  totalFlour: number
): Preferment | undefined {
  if (method === 'DIRECT') return undefined;
  
  const flourRatio = method === 'BIGA' 
    ? CONSTANTS.BIGA_FLOUR_RATIO 
    : CONSTANTS.POOLISH_FLOUR_RATIO;
  
  const hydration = method === 'BIGA' 
    ? CONSTANTS.BIGA_HYDRATION 
    : CONSTANTS.POOLISH_HYDRATION;
  
  const yeastPercent = method === 'BIGA' 
    ? CONSTANTS.BIGA_YEAST_PERCENT 
    : CONSTANTS.POOLISH_YEAST_PERCENT;
  
  const prefermentFlour = Math.round(totalFlour * flourRatio);
  const prefermentWater = Math.round(prefermentFlour * hydration);
  const prefermentYeast = Math.round((prefermentFlour * yeastPercent / 100) * 10) / 10;
  
  return {
    flour: prefermentFlour,
    water: prefermentWater,
    yeast: prefermentYeast,
  };
}

/**
 * Calculate hydration factor for fermentation time
 * 
 * Scientific basis:
 * - Water activity (aw) increases with hydration, improving enzyme mobility
 * - Effect is approximately linear within bread-making range (60-90%)
 * - Approximately 15-25% faster fermentation at 80% vs 65% hydration
 * 
 * Formula: factor = 1 - min(maxEffect, coefficient * (hydration - baseline))
 * This gives ~1.5% time reduction per 1% hydration above baseline
 */
export function calculateHydrationFactor(hydration: number): number {
  const { HYDRATION_BASELINE, HYDRATION_EFFECT_COEFFICIENT, MAX_HYDRATION_EFFECT } = CONSTANTS;
  
  const hydrationDiff = hydration - HYDRATION_BASELINE;
  
  if (hydrationDiff <= 0) {
    // Below baseline: slower fermentation (up to 15% slower at very low hydration)
    return 1 + Math.min(0.15, Math.abs(hydrationDiff) * 0.01);
  }
  
  // Above baseline: faster fermentation (capped at MAX_HYDRATION_EFFECT)
  const reduction = Math.min(MAX_HYDRATION_EFFECT, hydrationDiff * HYDRATION_EFFECT_COEFFICIENT);
  return 1 - reduction;
}

/**
 * Calculate estimated bulk fermentation time based on temperature AND hydration
 * 
 * Combined formula:
 * Time = BaseTime × TempFactor × HydrationFactor × SpeedFactor
 * 
 * Scientific basis:
 * - Temperature: Q10 rule (enzyme kinetics) - every 8°C doubles/halves rate
 * - Hydration: Water activity effect on yeast metabolism
 */
export function calculateBulkTime(
  roomTemp: number, 
  fermentationSpeed: number,
  hydration: number
): number {
  const tempDiff = roomTemp - CONSTANTS.TARGET_DDT;
  const tempFactor = Math.pow(2, -tempDiff / CONSTANTS.TEMP_COEFFICIENT);
  const speedFactor = 1 / fermentationSpeed;
  const hydrationFactor = calculateHydrationFactor(hydration);
  
  return Math.round(CONSTANTS.BASE_BULK_TIME * tempFactor * hydrationFactor * speedFactor);
}

/**
 * Calculate final proof time based on bulk time
 * 
 * Scientific basis:
 * - Final proof follows the SAME fermentation kinetics as bulk fermentation
 * - Both are affected by: temperature (Q10 rule), yeast quantity (speed), and hydration
 * - The only difference: proof is shorter because dough is already partially fermented
 * - Professional ratio: Final proof ≈ 40-60% of bulk time
 * 
 * This means proof time automatically scales with:
 * - Temperature (warmer = shorter)
 * - Yeast/Speed (more yeast = shorter)
 * - Hydration (higher = shorter)
 */
export function calculateProofTime(bulkTime: number): number {
  const { PROOF_TO_BULK_RATIO, MIN_PROOF_TIME, MAX_PROOF_TIME } = CONSTANTS;
  
  const proofTime = Math.round(bulkTime * PROOF_TO_BULK_RATIO);
  
  // Clamp to reasonable bounds
  return Math.max(MIN_PROOF_TIME, Math.min(MAX_PROOF_TIME, proofTime));
}

/**
 * Calculate preferment (Biga/Poolish) fermentation time
 * 
 * Scientific basis:
 * - Follows Q10 temperature kinetics for room temperature storage
 * - Cold storage (fridge) uses capped factor based on professional practice
 * - Yeast quantity affects time: less yeast = longer fermentation
 * 
 * Professional reality:
 * - Biga at room temp: 8-12 hours
 * - Biga in fridge: 12-16 hours  
 * - Poolish at room temp: 12-16 hours
 * - Poolish in fridge: 16-24 hours
 * 
 * Variables:
 * - roomTemp: User's actual room temperature (used for room storage)
 * - prefermentStorage: ROOM uses roomTemp, FRIDGE uses capped factor
 * - method: BIGA (1% yeast, faster) vs POOLISH (0.1% yeast, slower)
 */
export function calculatePrefermentTime(
  method: 'BIGA' | 'POOLISH',
  roomTemp: number,
  prefermentStorage: 'ROOM' | 'FRIDGE'
): number {
  const { 
    TARGET_DDT, 
    TEMP_COEFFICIENT, 
    FRIDGE_TEMP,
    BASE_PREFERMENT_TIME,
    BIGA_YEAST_PERCENT,
    POOLISH_YEAST_PERCENT
  } = CONSTANTS;
  
  // Actual storage temperature
  const storageTemp = prefermentStorage === 'FRIDGE' ? FRIDGE_TEMP : roomTemp;
  
  // Temperature factor based on Q10 rule
  const tempDiff = storageTemp - TARGET_DDT;
  let tempFactor = Math.pow(2, -tempDiff / TEMP_COEFFICIENT);
  
  // Yeast factor: less yeast = longer time
  // Poolish has 10x less yeast, but doesn't take 10x longer
  // Using log scale for realistic relationship: ~1.5x longer for Poolish
  const yeastPercent = method === 'BIGA' ? BIGA_YEAST_PERCENT : POOLISH_YEAST_PERCENT;
  const yeastRatio = BIGA_YEAST_PERCENT / yeastPercent;
  const yeastFactor = 1 + Math.log10(yeastRatio) * 0.5;
  // For Biga (1% yeast): 1 + log10(1) * 0.5 = 1 + 0 = 1x
  // For Poolish (0.1% yeast): 1 + log10(10) * 0.5 = 1 + 0.5 = 1.5x
  
  // Calculate base time with factors
  let prefermentTime = BASE_PREFERMENT_TIME * tempFactor * yeastFactor;
  
  // Cap total preferment time for cold storage to match professional practice
  // Fridge preferments: 12-24 hours max (not 40+ hours)
  if (prefermentStorage === 'FRIDGE') {
    const maxFridgeTime = method === 'BIGA' ? 16 * 60 : 24 * 60; // 16h Biga, 24h Poolish
    prefermentTime = Math.min(prefermentTime, maxFridgeTime);
  }
  
  return Math.round(prefermentTime);
}

/**
 * Calculate total time from start to bread ready
 * 
 * Includes: preferment (if indirect), mixing, bulk, shaping, proofing, baking, cooling
 * Note: Preheat overlaps with proof, so not added separately
 */
export function calculateTotalTime(
  bulkTime: number,
  proofTime: number,
  prefermentTime: number,
  mixer: 'HAND' | 'KITCHENAID',
  isHighHydration: boolean,
  isIndirect: boolean
): number {
  const { STEP_DURATIONS } = CONSTANTS;
  
  let total = 0;
  
  // Preferment time (for Biga/Poolish methods)
  if (isIndirect) {
    total += prefermentTime;
  }
  
  // Autolyse (only for high hydration)
  if (isHighHydration) {
    total += STEP_DURATIONS.AUTOLYSE;
  }
  
  // Mixing
  total += mixer === 'HAND' ? STEP_DURATIONS.MIX_HAND : STEP_DURATIONS.MIX_MACHINE;
  
  // Bulk fermentation
  total += bulkTime;
  
  // Shaping
  total += STEP_DURATIONS.PRESHAPE_REST;
  total += STEP_DURATIONS.FINAL_SHAPE;
  
  // Proof (preheat happens during this, so no extra time)
  total += proofTime;
  
  // Baking
  total += STEP_DURATIONS.BAKE_COVERED;
  total += STEP_DURATIONS.BAKE_UNCOVERED;
  
  // Cooling
  total += STEP_DURATIONS.COOL;
  
  return total;
}

/**
 * Main recipe calculation function
 */
export function calculateRecipe(inputs: RecipeInputs): RecipeOutput {
  const { method, totalFlour, targetHydration, mixer, roomTemp, fermentationSpeed } = inputs;
  
  // Total ingredients using baker's math
  const waterTotal = Math.round(totalFlour * (targetHydration / 100));
  const salt = Math.round(totalFlour * (CONSTANTS.SALT_PERCENT / 100));
  const totalYeast = calculateYeast(totalFlour, fermentationSpeed, targetHydration);
  
  // Calculate preferment if indirect method
  const preferment = calculatePreferment(method, totalFlour);
  
  // Calculate final dough components
  let finalDough: FinalDough;
  
  if (preferment) {
    // Subtract preferment from totals
    const remainingFlour = totalFlour - preferment.flour;
    const remainingWater = waterTotal - preferment.water;
    const kickYeast = Math.max(0, Math.round((totalYeast - preferment.yeast) * 10) / 10);
    
    finalDough = {
      flour: remainingFlour,
      water: remainingWater,
      salt: salt,
      yeast: kickYeast,
    };
  } else {
    finalDough = {
      flour: totalFlour,
      water: waterTotal,
      salt: salt,
      yeast: totalYeast,
    };
  }
  
  // Calculate water temperature
  const calculatedWaterTemp = calculateWaterTemp(inputs);
  
  // Calculate bulk fermentation time (with hydration factor)
  const estimatedBulkTime = calculateBulkTime(roomTemp, fermentationSpeed, targetHydration);
  
  // Calculate proof time (based on bulk time - same fermentation kinetics)
  const estimatedProofTime = calculateProofTime(estimatedBulkTime);
  
  // Calculate preferment time (for indirect methods)
  const isIndirect = method !== 'DIRECT';
  const prefermentTime = isIndirect 
    ? calculatePrefermentTime(method as 'BIGA' | 'POOLISH', roomTemp, inputs.prefermentStorage)
    : 0;
  
  // Calculate total time from start to bread ready
  const isHighHydration = targetHydration > CONSTANTS.HIGH_HYDRATION_THRESHOLD;
  const totalTime = calculateTotalTime(
    estimatedBulkTime, 
    estimatedProofTime, 
    prefermentTime,
    mixer, 
    isHighHydration,
    isIndirect
  );
  
  return {
    flourTotal: totalFlour,
    waterTotal,
    salt,
    yeast: totalYeast,
    preferment,
    finalDough,
    calculatedWaterTemp,
    estimatedBulkTime,
    estimatedProofTime,
    prefermentTime,
    totalTime,
  };
}

/**
 * Generate step-by-step instructions based on recipe
 */
export function generateSteps(inputs: RecipeInputs, output: RecipeOutput): Step[] {
  const { method, targetHydration, mixer } = inputs;
  const isHighHydration = targetHydration > CONSTANTS.HIGH_HYDRATION_THRESHOLD;
  const isIndirect = method !== 'DIRECT';
  
  const steps: Step[] = [];
  let stepId = 1;
  
  // Helper to add steps
  const addStep = (
    title: string, 
    description: string, 
    category: Step['category'], 
    critical = false,
    duration?: number
  ) => {
    steps.push({
      id: `step-${stepId++}`,
      time: '', // Will be calculated when bake starts
      title,
      description,
      critical,
      duration,
      category,
    });
  };
  
  // === PREFERMENT PREPARATION (If Indirect) ===
  if (isIndirect && output.preferment) {
    const prefermentName = method === 'BIGA' ? 'Biga' : 'Poolish';
    const prefermentHydration = method === 'BIGA' ? '50%' : '100%';
    
    addStep(
      `Prepare ${prefermentName}`,
      `Mix ${output.preferment.flour}g flour with ${output.preferment.water}g water (${prefermentHydration} hydration) and ${output.preferment.yeast}g yeast. Cover and let ferment for 8-16 hours.`,
      'prep',
      true
    );
  }
  
  // === MIXING PHASE ===
  if (isHighHydration) {
    // High hydration workflow with autolyse
    addStep(
      'Autolyse',
      `Mix ${output.finalDough.flour}g flour with ${Math.round(output.finalDough.water * 0.9)}g water (reserve 10% for bassinage). Let rest for 30-60 minutes.`,
      'mix',
      false,
      45
    );
    
    addStep(
      'Add Salt & Yeast',
      `Sprinkle ${output.finalDough.salt}g salt and ${output.finalDough.yeast}g yeast over the dough. Pinch and fold to incorporate.`,
      'mix',
      false
    );
    
    addStep(
      'Bassinage',
      `Gradually incorporate the reserved ${Math.round(output.finalDough.water * 0.1)}g water using the slap and fold technique.`,
      'mix',
      true
    );
  } else {
    // Standard hydration mixing
    if (isIndirect) {
      addStep(
        'Combine Final Dough',
        `Add the mature ${method === 'BIGA' ? 'Biga' : 'Poolish'} to ${output.finalDough.flour}g flour. Mix in ${output.finalDough.water}g water at ${output.calculatedWaterTemp}°C.`,
        'mix'
      );
    } else {
      addStep(
        'Mix Ingredients',
        `Combine ${output.flourTotal}g flour with ${output.waterTotal}g water at ${output.calculatedWaterTemp}°C. Add ${output.salt}g salt and ${output.yeast}g yeast.`,
        'mix'
      );
    }
    
    if (mixer === 'KITCHENAID') {
      addStep(
        'Machine Knead',
        'Mix on low speed (1-2) for 3 minutes to combine. Increase to medium (4) and knead for 8-10 minutes until smooth and elastic.',
        'mix',
        false,
        12
      );
    } else {
      addStep(
        'Hand Knead',
        'Turn out onto a clean surface. Knead using stretch and fold technique for 10-15 minutes until the dough passes the windowpane test.',
        'mix',
        false,
        15
      );
    }
  }
  
  // === BULK FERMENTATION ===
  const bulkTime = output.estimatedBulkTime;
  
  if (isHighHydration) {
    // Coil folds for high hydration
    const foldCount = 4;
    const foldInterval = Math.round(bulkTime / (foldCount + 1));
    
    addStep(
      'Begin Bulk Fermentation',
      `Place dough in a lightly oiled container. Cover and rest at room temperature.`,
      'bulk',
      false
    );
    
    for (let i = 1; i <= foldCount; i++) {
      addStep(
        `Coil Fold ${i}`,
        `Gently lift dough from center, letting edges fold underneath. Rotate 90° and repeat. Cover and rest.`,
        'bulk',
        i === 1,
        foldInterval
      );
    }
    
    addStep(
      'Complete Bulk Fermentation',
      `Let dough rest undisturbed until increased by 50-75%. Look for bubbles and a domed surface.`,
      'bulk',
      true,
      foldInterval
    );
  } else {
    // Standard bulk
    addStep(
      'Bulk Fermentation',
      `Cover dough and let rise at room temperature for approximately ${bulkTime} minutes until doubled in size.`,
      'bulk',
      true,
      bulkTime
    );
    
    addStep(
      'Stretch & Fold (Optional)',
      'Perform one set of stretch and folds halfway through bulk if desired for additional strength.',
      'bulk',
      false
    );
  }
  
  // === SHAPING ===
  addStep(
    'Pre-shape',
    'Gently turn dough onto a lightly floured surface. Pre-shape into a round using a bench scraper. Rest 15-20 minutes.',
    'shape',
    false,
    20
  );
  
  addStep(
    'Final Shape',
    'Shape into your desired form (boule, batard, or loaf). Create surface tension by pulling dough towards you.',
    'shape',
    true
  );
  
  // === PROOF ===
  addStep(
    'Final Proof',
    `Place shaped dough in a banneton or loaf pan. Proof at room temperature for approximately ${output.estimatedProofTime} minutes. Watch for 50-75% size increase.`,
    'proof',
    false,
    output.estimatedProofTime
  );
  
  addStep(
    'Preheat Oven',
    'Preheat oven to 250°C (480°F) with a Dutch oven or baking stone inside for at least 45 minutes.',
    'proof',
    true,
    45
  );
  
  // === BAKE ===
  addStep(
    'Score & Load',
    'Score the top of your loaf with a sharp blade or lame. Carefully transfer to the preheated Dutch oven or stone.',
    'bake',
    true
  );
  
  addStep(
    'Bake (Covered)',
    'Bake covered at 250°C for 20-25 minutes to create steam for oven spring.',
    'bake',
    false,
    22
  );
  
  addStep(
    'Bake (Uncovered)',
    'Remove lid and reduce temp to 230°C (445°F). Bake for 20-25 more minutes until deep golden brown.',
    'bake',
    false,
    22
  );
  
  addStep(
    'Cool',
    'Remove from oven and let cool on a wire rack for at least 1 hour before slicing. Listen for the "singing" crust!',
    'bake',
    true,
    60
  );
  
  return steps;
}

/**
 * Get hydration description label
 */
export function getHydrationLabel(hydration: number): string {
  if (hydration < 65) return 'Stiff';
  if (hydration < 70) return 'Standard';
  if (hydration < 75) return 'Supple';
  if (hydration < 80) return 'Wet';
  return 'Very Wet';
}

/**
 * Get speed description label
 */
export function getSpeedLabel(speed: number): string {
  if (speed <= 0.6) return 'Overnight';
  if (speed <= 0.8) return 'Slow';
  if (speed <= 1.2) return 'Standard';
  if (speed <= 1.5) return 'Quick';
  return 'Rush';
}

/**
 * Get water temperature advice
 */
export function getWaterTempAdvice(temp: number): { label: string; icon: 'ice' | 'fridge' | 'tap' | 'warm' } {
  if (temp <= 5) return { label: 'Ice Water', icon: 'ice' };
  if (temp <= 12) return { label: 'Refrigerated', icon: 'fridge' };
  if (temp <= 22) return { label: 'Cool Tap', icon: 'tap' };
  return { label: 'Warm', icon: 'warm' };
}

/**
 * Format time in minutes to human readable
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Convert grams to ounces
 */
export function gramsToOunces(grams: number): number {
  return Math.round(grams * 0.03527396 * 10) / 10;
}

/**
 * Convert Celsius to Fahrenheit
 */
export function celsiusToFahrenheit(celsius: number): number {
  return Math.round((celsius * 9/5) + 32);
}
