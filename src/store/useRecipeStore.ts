import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, RecipeInputs, Unit, TimerState } from '../types';
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
      timerStates: {},
      hasActiveBake: false,

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
        
        // Initialize timer states for all steps with duration
        const timerStates: Record<string, TimerState> = {};
        steps.forEach(step => {
          if (step.duration) {
            timerStates[step.id] = {
              stepId: step.id,
              remainingSeconds: step.duration * 60,
              isRunning: false,
              lastUpdated: Date.now(),
            };
          }
        });
        
        set({
          view: 'process',
          output,
          steps,
          currentStepIndex: 0,
          bakeStartTime: new Date(),
          timerStates,
          hasActiveBake: true,
        });
        
        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      
      resumeBake: () => {
        // Calculate elapsed time for any running timers
        const { timerStates, steps } = get();
        const now = Date.now();
        
        const updatedTimerStates: Record<string, TimerState> = {};
        
        Object.entries(timerStates).forEach(([stepId, state]) => {
          if (state.isRunning) {
            // Calculate how much time has passed since last update
            const elapsedSeconds = Math.floor((now - state.lastUpdated) / 1000);
            const newRemaining = Math.max(0, state.remainingSeconds - elapsedSeconds);
            
            updatedTimerStates[stepId] = {
              ...state,
              remainingSeconds: newRemaining,
              lastUpdated: now,
            };
          } else {
            updatedTimerStates[stepId] = state;
          }
        });
        
        // Recalculate step start times based on when bake started
        set({
          view: 'process',
          timerStates: updatedTimerStates,
          steps: steps, // Keep existing steps
        });
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      
      completeStep: () => {
        const { currentStepIndex, steps } = get();
        if (currentStepIndex < steps.length - 1) {
          set({ currentStepIndex: currentStepIndex + 1 });
        } else {
          // Bake complete
          set({ hasActiveBake: false });
        }
      },
      
      resetBake: () => {
        set({
          view: 'calculator',
          currentStepIndex: 0,
          bakeStartTime: null,
          timerStates: {},
          hasActiveBake: false,
        });
      },
      
      pauseBake: () => {
        // Go back to calculator without losing progress
        set({ view: 'calculator' });
      },
      
      updateTimerState: (stepId: string, state: Partial<TimerState>) => {
        const { timerStates } = get();
        const existingState = timerStates[stepId];
        
        if (existingState) {
          set({
            timerStates: {
              ...timerStates,
              [stepId]: {
                ...existingState,
                ...state,
                lastUpdated: Date.now(),
              },
            },
          });
        }
      },
    }),
    {
      name: 'crumb-recipe-storage',
      partialize: (state) => ({
        // Persist these fields for cross-session continuity
        unit: state.unit,
        inputs: state.inputs,
        // Bake progress persistence
        view: state.view,
        steps: state.steps,
        currentStepIndex: state.currentStepIndex,
        bakeStartTime: state.bakeStartTime,
        timerStates: state.timerStates,
        hasActiveBake: state.hasActiveBake,
        output: state.output,
      }),
      // Handle date serialization for bakeStartTime
      onRehydrateStorage: () => (state) => {
        if (state?.bakeStartTime) {
          state.bakeStartTime = new Date(state.bakeStartTime);
        }
      },
    }
  )
);

// Initialize calculations on store creation
useRecipeStore.getState().calculateRecipe();
