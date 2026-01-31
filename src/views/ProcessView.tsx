import { motion } from 'framer-motion';
import { ArrowLeft, Wheat } from 'lucide-react';
import { useRecipeStore } from '../store/useRecipeStore';
import { StepCard } from '../components/StepCard';
import { formatDuration } from '../utils/breadMath';

export function ProcessView() {
  const { 
    steps, 
    currentStepIndex, 
    output,
    inputs,
    completeStep, 
    resetBake,
  } = useRecipeStore();
  
  const completedSteps = currentStepIndex;
  const totalSteps = steps.length;
  const progressPercent = (completedSteps / totalSteps) * 100;
  
  // Calculate total remaining time
  const remainingTime = steps
    .slice(currentStepIndex)
    .reduce((acc, step) => acc + (step.duration || 5), 0);
  
  // Calculate start time for each step (cumulative from now)
  const stepStartTimes = steps.reduce<Date[]>((times, _step, index) => {
    if (index === 0) {
      times.push(new Date()); // First step starts now
    } else {
      const prevStepDuration = steps[index - 1].duration || 5;
      const prevTime = times[index - 1];
      times.push(new Date(prevTime.getTime() + prevStepDuration * 60 * 1000));
    }
    return times;
  }, []);
  
  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b bg-cream-50 border-cream-300">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={resetBake}
              className="flex items-center gap-2 text-sm font-medium text-crust-600 hover:text-crust-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Calculator
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-crust-500">
                Step {currentStepIndex + 1} of {totalSteps}
              </span>
              <span className="text-crust-500">
                ~{formatDuration(remainingTime)} remaining
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-cream-300">
              <motion.div
                className="h-full bg-wheat-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              />
            </div>
          </div>
        </div>
      </header>
      
      {/* Recipe Summary */}
      {output && (
        <div className="border-b bg-cream-100 border-cream-300">
          <div className="max-w-2xl mx-auto p-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Wheat className="w-4 h-4 text-wheat-600" />
                <span className="text-crust-600">
                  {output.flourTotal}g flour
                </span>
              </div>
              <span className="text-crust-300">•</span>
              <span className="text-crust-600">
                {inputs.targetHydration}% hydration
              </span>
              <span className="text-crust-300">•</span>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-cream-200 text-crust-600">
                {inputs.method}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Steps Timeline */}
      <main className="max-w-2xl mx-auto p-6 space-y-4">
        {steps.map((step, index) => (
          <StepCard
            key={step.id}
            step={step}
            index={index}
            isActive={index === currentStepIndex}
            isCompleted={index < currentStepIndex}
            onComplete={completeStep}
            scheduledTime={stepStartTimes[index]}
          />
        ))}
        
        {/* Completion Message */}
        {currentStepIndex >= totalSteps && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8 rounded-2xl bg-cream-100"
          >
            <span className="text-6xl mb-4 block">🍞</span>
            <h2 className="text-2xl font-bold mb-2 text-crust-900">
              Bread Complete!
            </h2>
            <p className="mb-6 text-crust-600">
              Let it cool completely before slicing. Enjoy your fresh bread!
            </p>
            <button
              onClick={resetBake}
              className="px-6 py-3 bg-wheat-500 hover:bg-wheat-600 text-white font-semibold rounded-xl transition-colors"
            >
              Start Another Bake
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
