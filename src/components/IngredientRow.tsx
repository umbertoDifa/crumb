import { motion } from 'framer-motion';
import { cn } from '../utils/cn';
import { gramsToOunces } from '../utils/breadMath';
import type { Unit } from '../types';

interface IngredientRowProps {
  label: string;
  weight: number;
  percentage?: number;
  unit: Unit;
  highlight?: boolean;
  indent?: boolean;
}

export function IngredientRow({ 
  label, 
  weight, 
  percentage, 
  unit,
  highlight = false,
  indent = false,
}: IngredientRowProps) {
  const displayWeight = unit === 'IMPERIAL' ? gramsToOunces(weight) : weight;
  const weightUnit = unit === 'IMPERIAL' ? 'oz' : 'g';
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'flex items-center justify-between py-2 border-b border-dashed border-cream-300 last:border-b-0',
        highlight && 'bg-wheat-500/5 -mx-3 px-3 rounded',
        indent && 'ml-4'
      )}
    >
      <span className={cn(
        'text-sm',
        highlight ? 'font-semibold text-crust-800' : 'text-crust-600',
        indent && 'text-crust-500'
      )}>
        {indent && '└ '}{label}
      </span>
      
      <div className="flex items-center gap-3">
        {percentage !== undefined && (
          <span className="tabular-nums text-xs text-crust-400 bg-cream-200 px-2 py-0.5 rounded">
            {percentage.toFixed(1)}%
          </span>
        )}
        <motion.span 
          key={weight}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            'tabular-nums font-mono',
            highlight ? 'text-base font-semibold text-crust-900' : 'text-sm text-crust-700'
          )}
        >
          {displayWeight}{weightUnit}
        </motion.span>
      </div>
    </motion.div>
  );
}
