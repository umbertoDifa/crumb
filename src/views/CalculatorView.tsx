import { motion } from 'framer-motion';
import { Wheat, Hand, Cog, Refrigerator, Home, Clock } from 'lucide-react';
import { useRecipeStore } from '../store/useRecipeStore';
import { MethodSelector } from '../components/MethodSelector';
import { KnobSlider } from '../components/KnobSlider';
import { NumberInput } from '../components/NumberInput';
import { Toggle } from '../components/Toggle';
import { TempWidget } from '../components/TempWidget';
import { IngredientRow } from '../components/IngredientRow';
import { HYDRATION_CONFIG, SPEED_CONFIG, TEMP_CONFIG, FLOUR_CONFIG } from '../utils/constants';
import { getHydrationLabel, getSpeedLabel, formatDuration } from '../utils/breadMath';
import type { MixerType, PrefermentStorage } from '../types';

/**
 * Calculate the "Ready By" time if starting now
 */
function getReadyByTime(totalMinutes: number): string {
  const now = new Date();
  const readyTime = new Date(now.getTime() + totalMinutes * 60 * 1000);
  
  // Get date-only values for comparison (handles month/year boundaries)
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const readyDate = new Date(readyTime.getFullYear(), readyTime.getMonth(), readyTime.getDate());
  const tomorrowDate = new Date(nowDate.getTime() + 24 * 60 * 60 * 1000);
  
  const timeStr = readyTime.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  // Compare dates properly
  const isToday = readyDate.getTime() === nowDate.getTime();
  const isTomorrow = readyDate.getTime() === tomorrowDate.getTime();
  
  if (isToday) {
    return timeStr;
  } else if (isTomorrow) {
    return `Tomorrow ${timeStr}`;
  } else {
    // For dates further out, show the day name
    return readyTime.toLocaleDateString('en-US', { 
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
}

export function CalculatorView() {
  const { inputs, output, unit, setInputs, startBake } = useRecipeStore();
  
  const isIndirect = inputs.method !== 'DIRECT';
  
  return (
    <div className="min-h-screen bg-cream-50">
      {/* Configuration Section */}
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        
        {/* Method Selection */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-semibold text-crust-500 uppercase tracking-wide">
            Method
          </h2>
          <MethodSelector
            value={inputs.method}
            onChange={(method) => setInputs({ method })}
          />
          {isIndirect && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-xs text-crust-500 bg-cream-200 p-3 rounded-lg"
            >
              {inputs.method === 'BIGA' 
                ? '🥖 Biga: A stiff Italian preferment (50% hydration) that develops complex flavors and a chewy texture over 8-16 hours.'
                : '🥐 Poolish: A liquid French preferment (100% hydration) that adds extensibility and a mild, slightly sweet flavor.'}
            </motion.p>
          )}
        </motion.section>
        
        {/* Primary Input - Flour Weight */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <NumberInput
            label="Total Flour"
            value={inputs.totalFlour}
            min={FLOUR_CONFIG.min}
            max={FLOUR_CONFIG.max}
            step={FLOUR_CONFIG.step}
            onChange={(totalFlour) => setInputs({ totalFlour })}
            unit="g"
            size="lg"
          />
        </motion.section>
        
        {/* Hydration Slider */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-4 bg-cream-100 rounded-xl border border-cream-300"
        >
          <KnobSlider
            label="Hydration"
            value={inputs.targetHydration}
            min={HYDRATION_CONFIG.min}
            max={HYDRATION_CONFIG.max}
            step={HYDRATION_CONFIG.step}
            onChange={(targetHydration) => setInputs({ targetHydration })}
            formatValue={(v) => `${v}%`}
            leftLabel="Stiff"
            rightLabel="Wet"
          />
          <motion.div
            key={inputs.targetHydration}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-center"
          >
            <span className="inline-block px-3 py-1 text-xs font-medium bg-wheat-500/10 text-wheat-600 rounded-full">
              {getHydrationLabel(inputs.targetHydration)}
            </span>
            {inputs.targetHydration > 75 && (
              <p className="text-xs text-crust-500 mt-2">
                ✨ High hydration: Recipe will include Autolyse & Bassinage steps
              </p>
            )}
          </motion.div>
        </motion.section>
        
        {/* Environment Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-cream-100 rounded-xl border border-cream-300 space-y-4"
        >
          <h2 className="text-sm font-semibold text-crust-500 uppercase tracking-wide flex items-center gap-2">
            <Cog className="w-4 h-4" />
            Environment
          </h2>
          
          {/* Room Temperature */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-crust-600">Room Temp</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setInputs({ roomTemp: Math.max(TEMP_CONFIG.min, inputs.roomTemp - TEMP_CONFIG.step) })}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-cream-200 text-crust-600 hover:bg-cream-300"
              >
                −
              </button>
              <span className="tabular-nums text-lg font-semibold text-crust-800 w-12 text-center">
                {inputs.roomTemp}°C
              </span>
              <button
                onClick={() => setInputs({ roomTemp: Math.min(TEMP_CONFIG.max, inputs.roomTemp + TEMP_CONFIG.step) })}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-cream-200 text-crust-600 hover:bg-cream-300"
              >
                +
              </button>
            </div>
          </div>
          
          {/* Mixer Type */}
          <div className="space-y-2">
            <span className="text-sm text-crust-600">Mixing Method</span>
            <Toggle<MixerType>
              options={[
                { value: 'HAND', label: 'By Hand', icon: <Hand className="w-4 h-4" /> },
                { value: 'KITCHENAID', label: 'Stand Mixer', icon: <Cog className="w-4 h-4" /> },
              ]}
              value={inputs.mixer}
              onChange={(mixer) => setInputs({ mixer })}
            />
          </div>
          
          {/* Fermentation Speed */}
          <KnobSlider
            label="Fermentation Speed"
            value={inputs.fermentationSpeed}
            min={SPEED_CONFIG.min}
            max={SPEED_CONFIG.max}
            step={SPEED_CONFIG.step}
            onChange={(fermentationSpeed) => setInputs({ fermentationSpeed })}
            formatValue={(v) => getSpeedLabel(v)}
            leftLabel="Overnight"
            rightLabel="Rush"
            accentColor="crust"
          />
          
          {/* Preferment Storage (Conditional) */}
          {isIndirect && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 pt-2 border-t border-cream-300"
            >
              <span className="text-sm text-crust-600">Preferment Storage</span>
              <Toggle<PrefermentStorage>
                options={[
                  { value: 'ROOM', label: 'Room Temp', icon: <Home className="w-4 h-4" /> },
                  { value: 'FRIDGE', label: 'Refrigerator', icon: <Refrigerator className="w-4 h-4" /> },
                ]}
                value={inputs.prefermentStorage}
                onChange={(prefermentStorage) => setInputs({ prefermentStorage })}
              />
            </motion.div>
          )}
        </motion.section>
        
        {/* BLUEPRINT OUTPUT */}
        {output && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-4"
          >
            <h2 className="text-sm font-semibold text-crust-500 uppercase tracking-wide flex items-center gap-2">
              <Wheat className="w-4 h-4" />
              Recipe Blueprint
            </h2>
            
            {/* Ready By - Hero Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-crust-800 to-crust-900 p-5 text-cream-50"
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-8 -top-8 w-32 h-32">
                  <Clock className="w-full h-full" />
                </div>
              </div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-cream-300 mb-1">Ready By</p>
                  <motion.p
                    key={output.totalTime}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold"
                  >
                    {getReadyByTime(output.totalTime)}
                  </motion.p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-cream-400">Total Time</p>
                  <p className="tabular-nums text-xl font-semibold text-cream-200">
                    {formatDuration(output.totalTime)}
                  </p>
                </div>
              </div>
            </motion.div>
            
            {/* Key Timings - Compact Row */}
            <div className="grid grid-cols-3 gap-3">
              {/* Water Temperature */}
              <TempWidget temp={output.calculatedWaterTemp} unit={unit} compact />
              
              {/* Bulk Time */}
              <div className="flex items-center justify-between rounded-xl border border-cream-300 bg-cream-100 p-3">
                <span className="text-sm font-medium text-crust-600">Bulk</span>
                <span className="tabular-nums text-xl font-bold text-crust-800">
                  {formatDuration(output.estimatedBulkTime)}
                </span>
              </div>
              
              {/* Proof Time */}
              <div className="flex items-center justify-between rounded-xl border border-cream-300 bg-cream-100 p-3">
                <span className="text-sm font-medium text-crust-600">Proof</span>
                <span className="tabular-nums text-xl font-bold text-crust-800">
                  {formatDuration(output.estimatedProofTime)}
                </span>
              </div>
            </div>
            
            {/* Ingredient List */}
            <div className="bg-cream-100 rounded-xl border border-cream-300 p-4">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-cream-300">
                <span className="text-sm font-semibold text-crust-700">Ingredients</span>
                <span className="text-xs text-crust-500">Baker's %</span>
              </div>
              
              {/* Preferment Section */}
              {output.preferment && (
                <div className="mb-4 pb-4 border-b border-dashed border-cream-300">
                  <p className="text-xs font-semibold text-crust-500 uppercase mb-2">
                    {inputs.method === 'BIGA' ? '🥖 Biga (50%)' : '🥐 Poolish (100%)'}
                  </p>
                  <IngredientRow 
                    label="Flour" 
                    weight={output.preferment.flour} 
                    percentage={(output.preferment.flour / output.flourTotal) * 100}
                    unit={unit}
                    indent
                  />
                  <IngredientRow 
                    label="Water" 
                    weight={output.preferment.water}
                    unit={unit}
                    indent
                  />
                  <IngredientRow 
                    label="Yeast" 
                    weight={output.preferment.yeast}
                    unit={unit}
                    indent
                  />
                </div>
              )}
              
              {/* Final Dough Section */}
              <div>
                {output.preferment && (
                  <p className="text-xs font-semibold text-crust-500 uppercase mb-2">
                    Final Dough
                  </p>
                )}
                <IngredientRow 
                  label="Flour" 
                  weight={output.preferment ? output.finalDough.flour : output.flourTotal} 
                  percentage={output.preferment ? (output.finalDough.flour / output.flourTotal) * 100 : 100}
                  unit={unit}
                  highlight={!output.preferment}
                />
                <IngredientRow 
                  label="Water" 
                  weight={output.preferment ? output.finalDough.water : output.waterTotal}
                  percentage={(output.preferment ? output.finalDough.water : output.waterTotal) / output.flourTotal * 100}
                  unit={unit}
                />
                <IngredientRow 
                  label="Salt" 
                  weight={output.salt}
                  percentage={2.0}
                  unit={unit}
                />
                <IngredientRow 
                  label="Fresh Yeast" 
                  weight={output.preferment ? output.finalDough.yeast : output.yeast}
                  unit={unit}
                />
              </div>
              
              {/* Totals */}
              <div className="mt-4 pt-4 border-t border-cream-300">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-crust-700">Total Dough Weight</span>
                  <span className="tabular-nums text-lg font-bold text-crust-900">
                    {output.flourTotal + output.waterTotal + output.salt + output.yeast}g
                  </span>
                </div>
              </div>
            </div>
            
            {/* Start Bake Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startBake}
              className="w-full py-4 bg-crust-800 hover:bg-crust-900 text-cream-50 font-semibold text-lg rounded-xl shadow-bread-lg transition-colors"
            >
              Start Bake →
            </motion.button>
          </motion.section>
        )}
      </div>
    </div>
  );
}
