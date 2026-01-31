// Domain Models & Types for Crumb Bread Calculator

export type Method = 'DIRECT' | 'BIGA' | 'POOLISH';
export type MixerType = 'HAND' | 'KITCHENAID';
export type PrefermentStorage = 'FRIDGE' | 'ROOM';
export type Unit = 'METRIC' | 'IMPERIAL';

export interface RecipeInputs {
  method: Method;
  totalFlour: number; // grams
  targetHydration: number; // percentage (e.g., 70)
  mixer: MixerType;
  roomTemp: number; // Celsius
  fermentationSpeed: number; // 0.5 (Slow) to 2.0 (Fast), standard 1.0
  prefermentStorage: PrefermentStorage; // Only relevant for Indirect methods
}

export interface Preferment {
  flour: number;
  water: number;
  yeast: number;
}

export interface FinalDough {
  flour: number;
  water: number;
  salt: number;
  yeast: number; // The "kick" yeast
}

export interface RecipeOutput {
  // Total Weights
  flourTotal: number;
  waterTotal: number;
  salt: number;
  yeast: number;

  // Component Breakdown (for display)
  preferment?: Preferment;
  finalDough: FinalDough;

  // Timing & Physics
  calculatedWaterTemp: number;
  estimatedBulkTime: number; // minutes
  estimatedProofTime: number; // minutes (derived from bulk time)
  prefermentTime: number; // minutes (0 for direct method)
  totalTime: number; // minutes - total time from start to bread ready
}

export interface Step {
  id: string;
  time: string; // Display time (e.g., "10:00 AM" or "+30 min")
  title: string;
  description: string;
  critical: boolean;
  duration?: number; // Duration in minutes for timer
  category: 'prep' | 'mix' | 'bulk' | 'shape' | 'proof' | 'bake';
}

export interface AppState {
  // Current View
  view: 'calculator' | 'process';
  
  // Settings
  unit: Unit;
  
  // Recipe State
  inputs: RecipeInputs;
  output: RecipeOutput | null;
  
  // Process State
  steps: Step[];
  currentStepIndex: number;
  bakeStartTime: Date | null;
  
  // Actions
  setView: (view: 'calculator' | 'process') => void;
  setUnit: (unit: Unit) => void;
  setInputs: (inputs: Partial<RecipeInputs>) => void;
  calculateRecipe: () => void;
  startBake: () => void;
  completeStep: () => void;
  resetBake: () => void;
}
