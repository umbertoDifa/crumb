// Bread Baking Constants

export const CONSTANTS = {
  // Target Dough Temperature
  TARGET_DDT: 24, // Desired Dough Temp in Celsius

  // Friction Factors
  FRICTION_HAND: 2,
  FRICTION_MIXER: 12,

  // Preferment Ratios
  BIGA_FLOUR_RATIO: 0.30, // 30% of total flour
  BIGA_HYDRATION: 0.50, // 50% hydration (Stiff)
  POOLISH_FLOUR_RATIO: 0.30,
  POOLISH_HYDRATION: 1.00, // 100% hydration (Liquid)

  // Yeast Percentages (Fresh Yeast)
  FRESH_YEAST_BASE: 1.5, // % for direct method standard
  BIGA_YEAST_PERCENT: 1.0, // % of preferment flour
  POOLISH_YEAST_PERCENT: 0.1, // % of preferment flour

  // Salt
  SALT_PERCENT: 2.0, // % of total flour

  // Temperature
  TEMP_COEFFICIENT: 8, // Degrees to double fermentation rate
  FRIDGE_TEMP: 4, // Celsius

  // Fermentation
  BASE_BULK_TIME: 120, // Base bulk fermentation time in minutes at 24°C
  
  // Preferment Time
  // Scientific basis: Preferment fermentation follows same Q10 kinetics
  // Base time is for Biga (1% yeast) at TARGET_DDT (24°C)
  // Poolish uses 10x less yeast, so takes longer (yeast factor applies)
  BASE_PREFERMENT_TIME: 8 * 60, // 480 minutes (8 hours) for Biga at 24°C with 1% yeast
  
  // Hydration thresholds
  HIGH_HYDRATION_THRESHOLD: 75,
  HIGH_HYDRATION_FRICTION_REDUCTION: 2,
  HIGH_HYDRATION_YEAST_REDUCTION: 0.10, // 10% reduction

  // Hydration Fermentation Factors (based on food science principles)
  // Scientific basis: Water activity (aw) affects enzyme mobility and yeast metabolism
  HYDRATION_BASELINE: 65, // Reference hydration percentage
  HYDRATION_EFFECT_COEFFICIENT: 0.015, // ~1.5% time reduction per 1% hydration increase
  MAX_HYDRATION_EFFECT: 0.30, // Cap at 30% maximum time reduction
  
  // Proof Time
  // Scientific basis: Proof time follows same fermentation kinetics as bulk
  // but is typically shorter because dough is already partially fermented
  // Ratio: Final proof ≈ 40-60% of bulk time (we use 50% as baseline)
  PROOF_TO_BULK_RATIO: 0.50, // Proof time is ~50% of bulk time
  MIN_PROOF_TIME: 30, // Minimum 30 minutes
  MAX_PROOF_TIME: 120, // Maximum 2 hours

  // Step Durations (fixed times for total calculation)
  STEP_DURATIONS: {
    AUTOLYSE: 45,        // minutes
    MIX_HAND: 15,        // minutes
    MIX_MACHINE: 12,     // minutes
    PRESHAPE_REST: 20,   // minutes
    FINAL_SHAPE: 5,      // minutes
    PREHEAT_OVERLAP: 0,  // Preheat happens during proof, no added time
    BAKE_COVERED: 22,    // minutes
    BAKE_UNCOVERED: 22,  // minutes
    COOL: 60,            // minutes (minimum for slicing)
  },
} as const;

// Labels for display
export const METHOD_LABELS: Record<string, string> = {
  DIRECT: 'Direct',
  BIGA: 'Biga',
  POOLISH: 'Poolish',
};

export const MIXER_LABELS: Record<string, string> = {
  HAND: 'By Hand',
  KITCHENAID: 'Stand Mixer',
};

export const STORAGE_LABELS: Record<string, string> = {
  FRIDGE: 'Refrigerator',
  ROOM: 'Room Temp',
};

// Slider configuration
export const HYDRATION_CONFIG = {
  min: 60,
  max: 90,
  default: 70,
  step: 1,
};

export const SPEED_CONFIG = {
  min: 0.5,
  max: 2.0,
  default: 1.0,
  step: 0.1,
};

export const TEMP_CONFIG = {
  min: 15,
  max: 35,
  default: 22,
  step: 1,
};

export const FLOUR_CONFIG = {
  min: 100,
  max: 2000,
  default: 500,
  step: 50,
};
