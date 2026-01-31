import { motion } from 'framer-motion';
import { Snowflake, Refrigerator, Droplets, Flame } from 'lucide-react';
import { getWaterTempAdvice, celsiusToFahrenheit } from '../utils/breadMath';
import { cn } from '../utils/cn';
import type { Unit } from '../types';

interface TempWidgetProps {
  temp: number;
  unit: Unit;
  compact?: boolean;
}

const icons = {
  ice: Snowflake,
  fridge: Refrigerator,
  tap: Droplets,
  warm: Flame,
};

const colors = {
  ice: {
    bg: 'bg-info-500/10',
    text: 'text-info-600',
    border: 'border-info-400',
  },
  fridge: {
    bg: 'bg-info-500/10',
    text: 'text-info-500',
    border: 'border-info-300',
  },
  tap: {
    bg: 'bg-cream-100',
    text: 'text-crust-600',
    border: 'border-cream-300',
  },
  warm: {
    bg: 'bg-wheat-500/10',
    text: 'text-wheat-600',
    border: 'border-wheat-400',
  },
};

export function TempWidget({ temp, unit, compact = false }: TempWidgetProps) {
  const { label, icon } = getWaterTempAdvice(temp);
  const Icon = icons[icon];
  const color = colors[icon];
  
  const displayTemp = unit === 'IMPERIAL' ? celsiusToFahrenheit(temp) : temp;
  const tempUnit = unit === 'IMPERIAL' ? '°F' : '°C';
  
  if (compact) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'flex items-center justify-between rounded-xl border p-3',
          color.bg,
          color.border
        )}
      >
        <div className="flex items-center gap-2">
          <Icon className={cn('w-5 h-5', color.text)} />
          <span className="text-sm font-medium text-crust-600">Water Temp</span>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.span
            key={temp}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn('tabular-nums text-2xl font-bold', color.text)}
          >
            {displayTemp}{tempUnit}
          </motion.span>
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', color.bg, color.text)}>
            {label}
          </span>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border-2 p-6',
        color.bg,
        color.border
      )}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute -right-10 -top-10 w-40 h-40">
          <Icon className="w-full h-full" />
        </div>
      </div>
      
      <div className="relative">
        <p className="text-sm font-medium text-crust-500 mb-1">Water Temperature</p>
        
        <div className="flex items-center gap-4">
          <motion.div
            key={temp}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-baseline"
          >
            <span className={cn('tabular-nums text-5xl font-bold', color.text)}>
              {displayTemp}
            </span>
            <span className={cn('text-2xl font-medium ml-1', color.text)}>
              {tempUnit}
            </span>
          </motion.div>
          
          <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full', color.bg)}>
            <Icon className={cn('w-4 h-4', color.text)} />
            <span className={cn('text-sm font-medium', color.text)}>{label}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
