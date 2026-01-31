import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, RecipeInputs, Unit } from '../types';
import { calculateRecipe, generateSteps } from '../utils/breadMath';
import { FLOUR_CONFIG, HYDRATION_CONFIG, TEMP_CONFIG, SPEED_CONFIG } from '../utils/constants';

const DEFAULT_INPUTS: RecipeInputs = {
  method: 'DIRECT',
  totalFlour: FLOUR_CONFIG.default,
  targetHydration: HYDRATION_CONFIG.default,
  mixer: 'HAND',
  roomTemp: TEMP_CONFIG.default,
  fermentationSpeed: SPEED_CONFIG.default,
  prefermentStorage: 'ROOM',
};

export const useRecipeStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      view: 'calculator',
      unit: 'METRIC' as Unit,
      inputs: DEFAULT_INPUTS,
      output: null,
      steps: [],
      currentStepIndex: 0,
      bakeStartTime: null,

      // Actions
      setView: (view) => set({ view }),
      
      setUnit: (unit) => set({ unit }),
      
      setInputs: (newInputs) => {
        const updatedInputs = { ...get().inputs, ...newInputs };
        set({ inputs: updatedInputs });
        // Auto-recalculate when inputs change
        get().calculateRecipe();
      },
      
      calculateRecipe: () => {
        const { inputs } = get();
        const output = calculateRecipe(inputs);
        const steps = generateSteps(inputs, output);
        set({ output, steps });
      },
      
      startBake: () => {
        const { inputs } = get();
        const output = calculateRecipe(inputs);
        const steps = generateSteps(inputs, output);
        
        set({
          view: 'process',
          output,
          steps,
          currentStepIndex: 0,
          bakeStartTime: new Date(),
        });
      },
      
      completeStep: () => {
        const { currentStepIndex, steps } = get();
        if (currentStepIndex < steps.length - 1) {
          set({ currentStepIndex: currentStepIndex + 1 });
        }
      },
      
      resetBake: () => {
        set({
          view: 'calculator',
          currentStepIndex: 0,
          bakeStartTime: null,
        });
      },
    }),
    {
      name: 'crumb-recipe-storage',
      partialize: (state) => ({
        // Only persist these fields
        unit: state.unit,
        inputs: state.inputs,
      }),
    }
  )
);

// Initialize calculations on store creation
useRecipeStore.getState().calculateRecipe();
