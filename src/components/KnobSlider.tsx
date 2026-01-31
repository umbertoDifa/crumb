import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

interface KnobSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  leftLabel?: string;
  rightLabel?: string;
  showTicks?: boolean;
  accentColor?: 'wheat' | 'info' | 'crust';
}

export function KnobSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatValue = (v) => v.toString(),
  leftLabel,
  rightLabel,
  showTicks = false,
  accentColor = 'wheat',
}: KnobSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  
  const trackColors = {
    wheat: 'bg-wheat-500',
    info: 'bg-info-500',
    crust: 'bg-crust-600',
  };
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-crust-700">{label}</span>
        <motion.span 
          key={value}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="tabular-nums text-lg font-semibold text-crust-900"
        >
          {formatValue(value)}
        </motion.span>
      </div>
      
      <div className="relative h-8 flex items-center">
        {/* Track background with fill */}
        <div className="absolute left-0 right-0 h-2 rounded-full bg-cream-300 overflow-hidden">
          <motion.div 
            className={cn('h-full rounded-full', trackColors[accentColor])}
            initial={false}
            animate={{ width: `${percentage}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>
        
        {/* Native range input - styled to align with track */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative z-10 w-full h-8 cursor-pointer appearance-none bg-transparent
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-6
            [&::-webkit-slider-thumb]:h-6
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-crust-300
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-webkit-slider-runnable-track]:bg-transparent
            [&::-webkit-slider-runnable-track]:h-2
            [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:w-6
            [&::-moz-range-thumb]:h-6
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-crust-300
            [&::-moz-range-thumb]:shadow-md
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-track]:bg-transparent
            [&::-moz-range-track]:h-2"
        />
      </div>
      
      {/* Labels */}
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between text-xs text-crust-500">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}
      
      {/* Tick marks */}
      {showTicks && (
        <div className="flex justify-between px-3">
          {Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => {
            const tickValue = min + i * step;
            const isActive = tickValue <= value;
            return (
              <div
                key={i}
                className={cn(
                  'w-1 h-1 rounded-full transition-colors',
                  isActive ? trackColors[accentColor] : 'bg-cream-300'
                )}
              />
            );
          }).slice(0, 11)} {/* Limit to 11 ticks max */}
        </div>
      )}
    </div>
  );
}
