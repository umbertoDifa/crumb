/**
 * Comprehensive unit tests for breadMath.ts
 * 
 * Tests all calculation functions including edge cases and 
 * "weird scenarios" (extreme temperatures, hydrations, etc.)
 */

import { describe, it, expect } from 'vitest';
import { CONSTANTS } from './constants';
import {
  calculateFriction,
  calculateWaterTemp,
  calculateYeast,
  calculatePreferment,
  calculateHydrationFactor,
  calculateBulkTime,
  calculateProofTime,
  calculatePrefermentTime,
  calculateTotalTime,
  calculateRecipe,
  generateSteps,
  getHydrationLabel,
  getSpeedLabel,
  getWaterTempAdvice,
  formatDuration,
  gramsToOunces,
  celsiusToFahrenheit,
} from './breadMath';
import type { RecipeInputs } from '../types';

// ====================
// HELPER: Default Inputs
// ====================
const defaultInputs: RecipeInputs = {
  method: 'DIRECT',
  totalFlour: 500,
  targetHydration: 70,
  roomTemp: 22,
  mixer: 'HAND',
  fermentationSpeed: 1.0,
  prefermentStorage: 'ROOM',
};

// ====================
// calculateFriction
// ====================
describe('calculateFriction', () => {
  it('returns correct friction for hand mixing at standard hydration', () => {
    expect(calculateFriction('HAND', 70)).toBe(CONSTANTS.FRICTION_HAND);
  });

  it('returns correct friction for machine mixing at standard hydration', () => {
    expect(calculateFriction('KITCHENAID', 70)).toBe(CONSTANTS.FRICTION_MIXER);
  });

  it('reduces friction for high hydration doughs (hand)', () => {
    const standardFriction = calculateFriction('HAND', 70);
    const highHydrationFriction = calculateFriction('HAND', 80);
    expect(highHydrationFriction).toBeLessThan(standardFriction);
    expect(highHydrationFriction).toBe(
      Math.max(0, CONSTANTS.FRICTION_HAND - CONSTANTS.HIGH_HYDRATION_FRICTION_REDUCTION)
    );
  });

  it('reduces friction for high hydration doughs (machine)', () => {
    const standardFriction = calculateFriction('KITCHENAID', 70);
    const highHydrationFriction = calculateFriction('KITCHENAID', 80);
    expect(highHydrationFriction).toBeLessThan(standardFriction);
  });

  it('does not go negative for friction', () => {
    expect(calculateFriction('HAND', 90)).toBeGreaterThanOrEqual(0);
  });

  it('handles boundary hydration (exactly 75%)', () => {
    // At exactly 75%, should NOT reduce friction (must be > 75)
    expect(calculateFriction('HAND', 75)).toBe(CONSTANTS.FRICTION_HAND);
  });

  it('handles just above threshold (76%)', () => {
    expect(calculateFriction('HAND', 76)).toBeLessThan(CONSTANTS.FRICTION_HAND);
  });
});

// ====================
// calculateWaterTemp
// ====================
describe('calculateWaterTemp', () => {
  describe('Direct Method (Rule of 3)', () => {
    it('calculates correct water temp at typical room temp', () => {
      const inputs: RecipeInputs = { ...defaultInputs, roomTemp: 22, mixer: 'HAND' };
      const waterTemp = calculateWaterTemp(inputs);
      // DDT=24, Rule of 3: (24*3) - 22 - 22 - 2 = 72 - 44 - 2 = 26
      expect(waterTemp).toBe(26);
    });

    it('calculates lower water temp for warm rooms', () => {
      const inputs: RecipeInputs = { ...defaultInputs, roomTemp: 30, mixer: 'HAND' };
      const waterTemp = calculateWaterTemp(inputs);
      // (24*3) - 30 - 30 - 2 = 72 - 62 = 10
      expect(waterTemp).toBe(10);
    });

    it('calculates higher water temp for cold rooms', () => {
      const inputs: RecipeInputs = { ...defaultInputs, roomTemp: 18, mixer: 'HAND' };
      const waterTemp = calculateWaterTemp(inputs);
      // (24*3) - 18 - 18 - 2 = 72 - 38 = 34
      expect(waterTemp).toBe(34);
    });

    it('clamps to minimum 0°C for very warm rooms', () => {
      const inputs: RecipeInputs = { ...defaultInputs, roomTemp: 35, mixer: 'HAND' };
      const waterTemp = calculateWaterTemp(inputs);
      // (24*3) - 35 - 35 - 2 = 72 - 72 = 0
      expect(waterTemp).toBeGreaterThanOrEqual(0);
    });

    it('clamps to maximum 40°C for very cold rooms', () => {
      const inputs: RecipeInputs = { ...defaultInputs, roomTemp: 10, mixer: 'HAND' };
      const waterTemp = calculateWaterTemp(inputs);
      // (24*3) - 10 - 10 - 2 = 72 - 22 = 50 → clamped to 40
      expect(waterTemp).toBeLessThanOrEqual(40);
    });

    it('uses higher friction for stand mixer', () => {
      const handInputs: RecipeInputs = { ...defaultInputs, mixer: 'HAND' };
      const mixerInputs: RecipeInputs = { ...defaultInputs, mixer: 'KITCHENAID' };
      const handTemp = calculateWaterTemp(handInputs);
      const mixerTemp = calculateWaterTemp(mixerInputs);
      // Higher friction = colder water needed
      expect(mixerTemp).toBeLessThan(handTemp);
    });
  });

  describe('Indirect Method (Rule of 4)', () => {
    it('calculates correct water temp for Biga at room storage', () => {
      const inputs: RecipeInputs = { 
        ...defaultInputs, 
        method: 'BIGA', 
        prefermentStorage: 'ROOM',
        roomTemp: 22,
        mixer: 'HAND'
      };
      const waterTemp = calculateWaterTemp(inputs);
      // Rule of 4: (24*4) - 22 - 22 - 2 - 22 = 96 - 68 = 28
      expect(waterTemp).toBe(28);
    });

    it('uses fridge temp for cold preferment', () => {
      const inputs: RecipeInputs = { 
        ...defaultInputs, 
        method: 'BIGA', 
        prefermentStorage: 'FRIDGE',
        roomTemp: 22,
        mixer: 'HAND'
      };
      const waterTemp = calculateWaterTemp(inputs);
      // Rule of 4: (24*4) - 22 - 22 - 2 - 4 = 96 - 50 = 46 → clamped to 40
      expect(waterTemp).toBeLessThanOrEqual(40);
    });

    it('works for Poolish method', () => {
      const inputs: RecipeInputs = { 
        ...defaultInputs, 
        method: 'POOLISH', 
        prefermentStorage: 'ROOM' 
      };
      const waterTemp = calculateWaterTemp(inputs);
      expect(waterTemp).toBeGreaterThan(0);
      expect(waterTemp).toBeLessThanOrEqual(40);
    });
  });

  describe('Edge Cases', () => {
    it('handles extremely cold room (15°C)', () => {
      const inputs: RecipeInputs = { ...defaultInputs, roomTemp: 15 };
      const waterTemp = calculateWaterTemp(inputs);
      expect(waterTemp).toBeLessThanOrEqual(40);
      expect(waterTemp).toBeGreaterThanOrEqual(0);
    });

    it('handles extremely warm room (35°C)', () => {
      const inputs: RecipeInputs = { ...defaultInputs, roomTemp: 35 };
      const waterTemp = calculateWaterTemp(inputs);
      expect(waterTemp).toBeGreaterThanOrEqual(0);
    });

    it('returns integer value', () => {
      const inputs: RecipeInputs = { ...defaultInputs, roomTemp: 21 };
      const waterTemp = calculateWaterTemp(inputs);
      expect(Number.isInteger(waterTemp)).toBe(true);
    });
  });
});

// ====================
// calculateYeast
// ====================
describe('calculateYeast', () => {
  it('calculates base yeast at standard speed', () => {
    const yeast = calculateYeast(500, 1.0, 70);
    // 500g flour × 1.5% = 7.5g
    expect(yeast).toBe(7.5);
  });

  it('increases yeast for faster fermentation', () => {
    const normalYeast = calculateYeast(500, 1.0, 70);
    const fastYeast = calculateYeast(500, 2.0, 70);
    expect(fastYeast).toBeGreaterThan(normalYeast);
    // Speed 2.0 = 3% yeast = 15g
    expect(fastYeast).toBe(15);
  });

  it('decreases yeast for slower fermentation', () => {
    const normalYeast = calculateYeast(500, 1.0, 70);
    const slowYeast = calculateYeast(500, 0.5, 70);
    expect(slowYeast).toBeLessThan(normalYeast);
  });

  it('reduces yeast for high hydration doughs', () => {
    const standardYeast = calculateYeast(500, 1.0, 70);
    const highHydrationYeast = calculateYeast(500, 1.0, 80);
    expect(highHydrationYeast).toBeLessThan(standardYeast);
  });

  it('does not reduce yeast at exactly 75% hydration', () => {
    const standardYeast = calculateYeast(500, 1.0, 70);
    const boundaryYeast = calculateYeast(500, 1.0, 75);
    expect(boundaryYeast).toBe(standardYeast);
  });

  it('scales proportionally with flour amount', () => {
    const smallBatch = calculateYeast(250, 1.0, 70);
    const largeBatch = calculateYeast(1000, 1.0, 70);
    // Due to rounding, check the ratio is approximately 4x
    expect(largeBatch / smallBatch).toBeCloseTo(4, 0);
  });

  it('rounds to one decimal place', () => {
    const yeast = calculateYeast(333, 1.0, 70);
    const decimalPlaces = (yeast.toString().split('.')[1] || '').length;
    expect(decimalPlaces).toBeLessThanOrEqual(1);
  });
});

// ====================
// calculatePreferment
// ====================
describe('calculatePreferment', () => {
  it('returns undefined for Direct method', () => {
    expect(calculatePreferment('DIRECT', 500)).toBeUndefined();
  });

  describe('Biga', () => {
    it('calculates correct flour (30% of total)', () => {
      const preferment = calculatePreferment('BIGA', 500);
      expect(preferment?.flour).toBe(150); // 500 × 0.30
    });

    it('calculates correct water (50% hydration)', () => {
      const preferment = calculatePreferment('BIGA', 500);
      expect(preferment?.water).toBe(75); // 150 × 0.50
    });

    it('calculates correct yeast (1% of preferment flour)', () => {
      const preferment = calculatePreferment('BIGA', 500);
      expect(preferment?.yeast).toBe(1.5); // 150 × 0.01
    });
  });

  describe('Poolish', () => {
    it('calculates correct flour (30% of total)', () => {
      const preferment = calculatePreferment('POOLISH', 500);
      expect(preferment?.flour).toBe(150);
    });

    it('calculates correct water (100% hydration)', () => {
      const preferment = calculatePreferment('POOLISH', 500);
      expect(preferment?.water).toBe(150); // 150 × 1.00
    });

    it('calculates correct yeast (0.1% of preferment flour)', () => {
      const preferment = calculatePreferment('POOLISH', 500);
      expect(preferment?.yeast).toBe(0.2); // 150 × 0.001, rounded
    });
  });

  it('scales correctly with flour amount', () => {
    const small = calculatePreferment('BIGA', 300);
    const large = calculatePreferment('BIGA', 900);
    expect(large?.flour).toBe(small!.flour * 3);
  });
});

// ====================
// calculateHydrationFactor
// ====================
describe('calculateHydrationFactor', () => {
  it('returns 1.0 at baseline hydration (65%)', () => {
    expect(calculateHydrationFactor(65)).toBe(1);
  });

  it('returns < 1 for high hydration (faster fermentation)', () => {
    expect(calculateHydrationFactor(80)).toBeLessThan(1);
  });

  it('returns > 1 for low hydration (slower fermentation)', () => {
    expect(calculateHydrationFactor(60)).toBeGreaterThan(1);
  });

  it('caps reduction at MAX_HYDRATION_EFFECT for extreme hydration', () => {
    const factor = calculateHydrationFactor(100); // Extremely high
    const minFactor = 1 - CONSTANTS.MAX_HYDRATION_EFFECT;
    expect(factor).toBeGreaterThanOrEqual(minFactor);
  });

  it('has gradual effect across range', () => {
    const h70 = calculateHydrationFactor(70);
    const h75 = calculateHydrationFactor(75);
    const h80 = calculateHydrationFactor(80);
    
    // Each higher hydration should be lower factor
    expect(h75).toBeLessThan(h70);
    expect(h80).toBeLessThan(h75);
  });

  it('handles boundary conditions gracefully', () => {
    expect(() => calculateHydrationFactor(0)).not.toThrow();
    expect(() => calculateHydrationFactor(100)).not.toThrow();
    expect(() => calculateHydrationFactor(65)).not.toThrow();
  });
});

// ====================
// calculateBulkTime
// ====================
describe('calculateBulkTime', () => {
  it('returns base time at target DDT (24°C) with standard speed and hydration', () => {
    const time = calculateBulkTime(24, 1.0, 65);
    expect(time).toBe(CONSTANTS.BASE_BULK_TIME);
  });

  it('decreases time for warmer temperatures', () => {
    const coolTime = calculateBulkTime(20, 1.0, 70);
    const warmTime = calculateBulkTime(28, 1.0, 70);
    expect(warmTime).toBeLessThan(coolTime);
  });

  it('increases time for cooler temperatures', () => {
    const time20 = calculateBulkTime(20, 1.0, 70);
    const time24 = calculateBulkTime(24, 1.0, 70);
    expect(time20).toBeGreaterThan(time24);
  });

  it('roughly doubles time for 8°C temperature drop', () => {
    const baseTime = calculateBulkTime(24, 1.0, 65);
    const coldTime = calculateBulkTime(16, 1.0, 65);
    // Should be approximately 2x (Q10 rule)
    expect(coldTime / baseTime).toBeCloseTo(2, 1);
  });

  it('decreases time for faster fermentation speed', () => {
    const normalTime = calculateBulkTime(22, 1.0, 70);
    const fastTime = calculateBulkTime(22, 2.0, 70);
    expect(fastTime).toBeLessThan(normalTime);
  });

  it('increases time for slower fermentation speed', () => {
    const normalTime = calculateBulkTime(22, 1.0, 70);
    const slowTime = calculateBulkTime(22, 0.5, 70);
    expect(slowTime).toBeGreaterThan(normalTime);
  });

  it('decreases time for higher hydration', () => {
    const lowHydration = calculateBulkTime(22, 1.0, 65);
    const highHydration = calculateBulkTime(22, 1.0, 85);
    expect(highHydration).toBeLessThan(lowHydration);
  });

  it('returns integer value', () => {
    const time = calculateBulkTime(21.5, 1.0, 72);
    expect(Number.isInteger(time)).toBe(true);
  });

  describe('Extreme Scenarios', () => {
    it('handles very cold room (15°C)', () => {
      const time = calculateBulkTime(15, 1.0, 70);
      expect(time).toBeGreaterThan(CONSTANTS.BASE_BULK_TIME * 1.5);
    });

    it('handles very warm room (35°C)', () => {
      const time = calculateBulkTime(35, 1.0, 70);
      expect(time).toBeLessThan(CONSTANTS.BASE_BULK_TIME * 0.5);
    });

    it('handles minimum speed (0.5)', () => {
      const time = calculateBulkTime(22, 0.5, 70);
      expect(time).toBeGreaterThan(0);
    });

    it('handles maximum speed (2.0)', () => {
      const time = calculateBulkTime(22, 2.0, 70);
      expect(time).toBeGreaterThan(0);
    });
  });
});

// ====================
// calculateProofTime
// ====================
describe('calculateProofTime', () => {
  it('returns ~50% of bulk time', () => {
    const proofTime = calculateProofTime(120);
    expect(proofTime).toBe(60);
  });

  it('respects minimum proof time', () => {
    const proofTime = calculateProofTime(30); // Would give 15 min
    expect(proofTime).toBe(CONSTANTS.MIN_PROOF_TIME);
  });

  it('respects maximum proof time', () => {
    const proofTime = calculateProofTime(300); // Would give 150 min
    expect(proofTime).toBe(CONSTANTS.MAX_PROOF_TIME);
  });

  it('scales proportionally within bounds', () => {
    const short = calculateProofTime(80);
    const long = calculateProofTime(160);
    expect(long).toBe(short * 2);
  });

  it('returns integer value', () => {
    const proofTime = calculateProofTime(111);
    expect(Number.isInteger(proofTime)).toBe(true);
  });
});

// ====================
// calculatePrefermentTime
// ====================
describe('calculatePrefermentTime', () => {
  describe('Biga', () => {
    it('returns base time at target DDT with room storage', () => {
      const time = calculatePrefermentTime('BIGA', 24, 'ROOM');
      expect(time).toBe(CONSTANTS.BASE_PREFERMENT_TIME);
    });

    it('increases time for cooler room temp', () => {
      const warm = calculatePrefermentTime('BIGA', 24, 'ROOM');
      const cool = calculatePrefermentTime('BIGA', 18, 'ROOM');
      expect(cool).toBeGreaterThan(warm);
    });

    it('caps fridge storage time at 16 hours', () => {
      const fridgeTime = calculatePrefermentTime('BIGA', 22, 'FRIDGE');
      expect(fridgeTime).toBeLessThanOrEqual(16 * 60);
    });

    it('room storage time is shorter than fridge', () => {
      const roomTime = calculatePrefermentTime('BIGA', 22, 'ROOM');
      const fridgeTime = calculatePrefermentTime('BIGA', 22, 'FRIDGE');
      expect(roomTime).toBeLessThan(fridgeTime);
    });
  });

  describe('Poolish', () => {
    it('takes longer than Biga due to less yeast', () => {
      const bigaTime = calculatePrefermentTime('BIGA', 22, 'ROOM');
      const poolishTime = calculatePrefermentTime('POOLISH', 22, 'ROOM');
      expect(poolishTime).toBeGreaterThan(bigaTime);
    });

    it('caps fridge storage time at 24 hours', () => {
      const fridgeTime = calculatePrefermentTime('POOLISH', 22, 'FRIDGE');
      expect(fridgeTime).toBeLessThanOrEqual(24 * 60);
    });

    it('returns realistic room temp time (8-16 hours)', () => {
      const time = calculatePrefermentTime('POOLISH', 22, 'ROOM');
      expect(time).toBeGreaterThanOrEqual(8 * 60);
      expect(time).toBeLessThanOrEqual(16 * 60);
    });
  });

  describe('Edge Cases', () => {
    it('handles very cold room (15°C)', () => {
      const time = calculatePrefermentTime('BIGA', 15, 'ROOM');
      expect(time).toBeGreaterThan(CONSTANTS.BASE_PREFERMENT_TIME);
    });

    it('handles very warm room (30°C)', () => {
      const time = calculatePrefermentTime('BIGA', 30, 'ROOM');
      expect(time).toBeLessThan(CONSTANTS.BASE_PREFERMENT_TIME);
    });

    it('returns integer value', () => {
      const time = calculatePrefermentTime('POOLISH', 21, 'ROOM');
      expect(Number.isInteger(time)).toBe(true);
    });
  });
});

// ====================
// calculateTotalTime
// ====================
describe('calculateTotalTime', () => {
  const { STEP_DURATIONS } = CONSTANTS;
  
  it('calculates direct method total correctly', () => {
    const total = calculateTotalTime(120, 60, 0, 'HAND', false, false);
    const expected = 
      STEP_DURATIONS.MIX_HAND +
      120 + // bulk
      STEP_DURATIONS.PRESHAPE_REST +
      STEP_DURATIONS.FINAL_SHAPE +
      60 + // proof
      STEP_DURATIONS.BAKE_COVERED +
      STEP_DURATIONS.BAKE_UNCOVERED +
      STEP_DURATIONS.COOL;
    expect(total).toBe(expected);
  });

  it('adds preferment time for indirect methods', () => {
    const direct = calculateTotalTime(120, 60, 0, 'HAND', false, false);
    const indirect = calculateTotalTime(120, 60, 480, 'HAND', false, true);
    expect(indirect).toBe(direct + 480);
  });

  it('adds autolyse for high hydration', () => {
    const standard = calculateTotalTime(120, 60, 0, 'HAND', false, false);
    const highHydration = calculateTotalTime(120, 60, 0, 'HAND', true, false);
    expect(highHydration).toBe(standard + STEP_DURATIONS.AUTOLYSE);
  });

  it('uses machine mix time for stand mixer', () => {
    const handTime = calculateTotalTime(120, 60, 0, 'HAND', false, false);
    const machineTime = calculateTotalTime(120, 60, 0, 'KITCHENAID', false, false);
    expect(machineTime).toBeLessThan(handTime); // Machine is faster
  });

  it('combines all factors correctly', () => {
    const total = calculateTotalTime(120, 60, 480, 'KITCHENAID', true, true);
    const expected = 
      480 + // preferment
      STEP_DURATIONS.AUTOLYSE +
      STEP_DURATIONS.MIX_MACHINE +
      120 + // bulk
      STEP_DURATIONS.PRESHAPE_REST +
      STEP_DURATIONS.FINAL_SHAPE +
      60 + // proof
      STEP_DURATIONS.BAKE_COVERED +
      STEP_DURATIONS.BAKE_UNCOVERED +
      STEP_DURATIONS.COOL;
    expect(total).toBe(expected);
  });
});

// ====================
// calculateRecipe (Integration)
// ====================
describe('calculateRecipe', () => {
  it('returns all required output fields', () => {
    const output = calculateRecipe(defaultInputs);
    
    expect(output).toHaveProperty('flourTotal');
    expect(output).toHaveProperty('waterTotal');
    expect(output).toHaveProperty('salt');
    expect(output).toHaveProperty('yeast');
    expect(output).toHaveProperty('finalDough');
    expect(output).toHaveProperty('calculatedWaterTemp');
    expect(output).toHaveProperty('estimatedBulkTime');
    expect(output).toHaveProperty('estimatedProofTime');
    expect(output).toHaveProperty('totalTime');
  });

  it('calculates correct baker\'s percentages', () => {
    const inputs: RecipeInputs = { ...defaultInputs, targetHydration: 70 };
    const output = calculateRecipe(inputs);
    
    // Water should be 70% of flour
    expect(output.waterTotal).toBe(Math.round(500 * 0.70));
    // Salt should be 2% of flour
    expect(output.salt).toBe(Math.round(500 * 0.02));
  });

  it('includes preferment for indirect methods', () => {
    const bigaInputs: RecipeInputs = { ...defaultInputs, method: 'BIGA' };
    const output = calculateRecipe(bigaInputs);
    
    expect(output.preferment).toBeDefined();
    expect(output.prefermentTime).toBeGreaterThan(0);
  });

  it('excludes preferment for direct method', () => {
    const output = calculateRecipe(defaultInputs);
    expect(output.preferment).toBeUndefined();
    expect(output.prefermentTime).toBe(0);
  });

  it('final dough + preferment = total flour', () => {
    const bigaInputs: RecipeInputs = { ...defaultInputs, method: 'BIGA' };
    const output = calculateRecipe(bigaInputs);
    
    expect(output.finalDough.flour + output.preferment!.flour).toBe(output.flourTotal);
  });

  describe('Edge Cases', () => {
    it('handles minimum flour (100g)', () => {
      const inputs: RecipeInputs = { ...defaultInputs, totalFlour: 100 };
      const output = calculateRecipe(inputs);
      expect(output.flourTotal).toBe(100);
    });

    it('handles maximum flour (2000g)', () => {
      const inputs: RecipeInputs = { ...defaultInputs, totalFlour: 2000 };
      const output = calculateRecipe(inputs);
      expect(output.flourTotal).toBe(2000);
    });

    it('handles low hydration (60%)', () => {
      const inputs: RecipeInputs = { ...defaultInputs, targetHydration: 60 };
      const output = calculateRecipe(inputs);
      expect(output.estimatedBulkTime).toBeGreaterThan(CONSTANTS.BASE_BULK_TIME);
    });

    it('handles high hydration (90%)', () => {
      const inputs: RecipeInputs = { ...defaultInputs, targetHydration: 90 };
      const output = calculateRecipe(inputs);
      expect(output.estimatedBulkTime).toBeLessThan(CONSTANTS.BASE_BULK_TIME);
    });

    it('handles cold room + fridge preferment', () => {
      const inputs: RecipeInputs = { 
        ...defaultInputs, 
        method: 'POOLISH',
        roomTemp: 15,
        prefermentStorage: 'FRIDGE'
      };
      const output = calculateRecipe(inputs);
      expect(output.totalTime).toBeGreaterThan(0);
      expect(output.prefermentTime).toBeLessThanOrEqual(24 * 60);
    });
  });
});

// ====================
// generateSteps
// ====================
describe('generateSteps', () => {
  it('generates steps for direct method', () => {
    const output = calculateRecipe(defaultInputs);
    const steps = generateSteps(defaultInputs, output);
    
    expect(steps.length).toBeGreaterThan(0);
    expect(steps.some(s => s.category === 'mix')).toBe(true);
    expect(steps.some(s => s.category === 'bulk')).toBe(true);
    expect(steps.some(s => s.category === 'bake')).toBe(true);
  });

  it('includes preferment step for indirect methods', () => {
    const bigaInputs: RecipeInputs = { ...defaultInputs, method: 'BIGA' };
    const output = calculateRecipe(bigaInputs);
    const steps = generateSteps(bigaInputs, output);
    
    expect(steps.some(s => s.title.includes('Biga'))).toBe(true);
    expect(steps.some(s => s.category === 'prep')).toBe(true);
  });

  it('includes autolyse for high hydration', () => {
    const highHydrationInputs: RecipeInputs = { ...defaultInputs, targetHydration: 80 };
    const output = calculateRecipe(highHydrationInputs);
    const steps = generateSteps(highHydrationInputs, output);
    
    expect(steps.some(s => s.title === 'Autolyse')).toBe(true);
    expect(steps.some(s => s.title === 'Bassinage')).toBe(true);
  });

  it('includes coil folds for high hydration', () => {
    const highHydrationInputs: RecipeInputs = { ...defaultInputs, targetHydration: 80 };
    const output = calculateRecipe(highHydrationInputs);
    const steps = generateSteps(highHydrationInputs, output);
    
    expect(steps.some(s => s.title.includes('Coil Fold'))).toBe(true);
  });

  it('uses machine knead step for stand mixer', () => {
    const mixerInputs: RecipeInputs = { ...defaultInputs, mixer: 'KITCHENAID' };
    const output = calculateRecipe(mixerInputs);
    const steps = generateSteps(mixerInputs, output);
    
    expect(steps.some(s => s.title === 'Machine Knead')).toBe(true);
  });

  it('uses hand knead step for hand mixing', () => {
    const output = calculateRecipe(defaultInputs);
    const steps = generateSteps(defaultInputs, output);
    
    expect(steps.some(s => s.title === 'Hand Knead')).toBe(true);
  });

  it('each step has required properties', () => {
    const output = calculateRecipe(defaultInputs);
    const steps = generateSteps(defaultInputs, output);
    
    steps.forEach(step => {
      expect(step).toHaveProperty('id');
      expect(step).toHaveProperty('title');
      expect(step).toHaveProperty('description');
      expect(step).toHaveProperty('category');
    });
  });
});

// ====================
// Utility Functions
// ====================
describe('getHydrationLabel', () => {
  it('returns "Stiff" for low hydration', () => {
    expect(getHydrationLabel(60)).toBe('Stiff');
  });

  it('returns "Standard" for 65-69%', () => {
    expect(getHydrationLabel(67)).toBe('Standard');
  });

  it('returns "Supple" for 70-74%', () => {
    expect(getHydrationLabel(72)).toBe('Supple');
  });

  it('returns "Wet" for 75-79%', () => {
    expect(getHydrationLabel(77)).toBe('Wet');
  });

  it('returns "Very Wet" for 80%+', () => {
    expect(getHydrationLabel(85)).toBe('Very Wet');
  });
});

describe('getSpeedLabel', () => {
  it('returns "Overnight" for very slow', () => {
    expect(getSpeedLabel(0.5)).toBe('Overnight');
  });

  it('returns "Slow" for 0.61-0.8', () => {
    expect(getSpeedLabel(0.7)).toBe('Slow');
  });

  it('returns "Standard" for 0.81-1.2', () => {
    expect(getSpeedLabel(1.0)).toBe('Standard');
  });

  it('returns "Quick" for 1.21-1.5', () => {
    expect(getSpeedLabel(1.3)).toBe('Quick');
  });

  it('returns "Rush" for 1.5+', () => {
    expect(getSpeedLabel(2.0)).toBe('Rush');
  });
});

describe('getWaterTempAdvice', () => {
  it('returns ice water for very cold temp', () => {
    const advice = getWaterTempAdvice(3);
    expect(advice.label).toBe('Ice Water');
    expect(advice.icon).toBe('ice');
  });

  it('returns refrigerated for cold temp', () => {
    const advice = getWaterTempAdvice(8);
    expect(advice.label).toBe('Refrigerated');
    expect(advice.icon).toBe('fridge');
  });

  it('returns cool tap for moderate temp', () => {
    const advice = getWaterTempAdvice(18);
    expect(advice.label).toBe('Cool Tap');
    expect(advice.icon).toBe('tap');
  });

  it('returns warm for high temp', () => {
    const advice = getWaterTempAdvice(30);
    expect(advice.label).toBe('Warm');
    expect(advice.icon).toBe('warm');
  });
});

describe('formatDuration', () => {
  it('formats minutes only', () => {
    expect(formatDuration(45)).toBe('45 min');
  });

  it('formats hours only', () => {
    expect(formatDuration(120)).toBe('2h');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(90)).toBe('1h 30m');
  });

  it('handles zero', () => {
    expect(formatDuration(0)).toBe('0 min');
  });

  it('handles large values', () => {
    expect(formatDuration(1440)).toBe('24h');
  });
});

describe('gramsToOunces', () => {
  it('converts correctly', () => {
    expect(gramsToOunces(28.35)).toBeCloseTo(1, 1);
  });

  it('rounds to one decimal', () => {
    const oz = gramsToOunces(100);
    const decimalPlaces = (oz.toString().split('.')[1] || '').length;
    expect(decimalPlaces).toBeLessThanOrEqual(1);
  });
});

describe('celsiusToFahrenheit', () => {
  it('converts 0°C to 32°F', () => {
    expect(celsiusToFahrenheit(0)).toBe(32);
  });

  it('converts 100°C to 212°F', () => {
    expect(celsiusToFahrenheit(100)).toBe(212);
  });

  it('converts 24°C correctly', () => {
    expect(celsiusToFahrenheit(24)).toBe(75);
  });

  it('returns integer value', () => {
    const result = celsiusToFahrenheit(21.5);
    expect(Number.isInteger(result)).toBe(true);
  });
});
