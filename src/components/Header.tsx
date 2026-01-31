import { Settings } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecipeStore } from '../store/useRecipeStore';
import { Toggle } from './Toggle';
import type { Unit } from '../types';

export function Header() {
  const { unit, setUnit, view } = useRecipeStore();
  const [showSettings, setShowSettings] = useState(false);
  
  if (view === 'process') return null;
  
  return (
    <header className="sticky top-0 z-30 bg-cream-50/80 backdrop-blur-md border-b border-cream-300">
      <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-crust-800 flex items-center justify-center">
            <span className="text-xl">🍞</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-crust-900 tracking-tight">Crumb</h1>
            <p className="text-xs text-crust-500">Bread Calculator</p>
          </div>
        </div>
        
        {/* Settings */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-lg hover:bg-cream-200 text-crust-600 hover:text-crust-800 transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
      
      {/* Settings Dropdown */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-cream-300 overflow-hidden"
          >
            <div className="max-w-2xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-crust-600">Units</span>
                <Toggle<Unit>
                  options={[
                    { value: 'METRIC', label: 'Metric (g/°C)' },
                    { value: 'IMPERIAL', label: 'Imperial (oz/°F)' },
                  ]}
                  value={unit}
                  onChange={setUnit}
                  size="sm"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
