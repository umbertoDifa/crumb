import { Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

interface NumberInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function NumberInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit = 'g',
  size = 'md',
}: NumberInputProps) {
  const increment = () => onChange(Math.min(max, value + step));
  const decrement = () => onChange(Math.max(min, value - step));
  
  const sizes = {
    sm: {
      container: 'p-3',
      value: 'text-2xl',
      buttons: 'w-8 h-8',
    },
    md: {
      container: 'p-4',
      value: 'text-4xl',
      buttons: 'w-10 h-10',
    },
    lg: {
      container: 'p-6',
      value: 'text-5xl',
      buttons: 'w-12 h-12',
    },
  };
  
  return (
    <div className={cn('rounded-xl bg-cream-100 border border-cream-300', sizes[size].container)}>
      <label className="block text-sm font-medium text-crust-600 mb-2">
        {label}
      </label>
      
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={decrement}
          disabled={value <= min}
          className={cn(
            'flex items-center justify-center rounded-full bg-cream-200 text-crust-700',
            'hover:bg-cream-300 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed',
            sizes[size].buttons
          )}
        >
          <Minus className="w-5 h-5" />
        </button>
        
        <div className="flex items-baseline gap-1">
          <motion.span
            key={value}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn('tabular-nums font-bold text-crust-900', sizes[size].value)}
          >
            {value}
          </motion.span>
          <span className="text-lg text-crust-500 font-medium">{unit}</span>
        </div>
        
        <button
          onClick={increment}
          disabled={value >= max}
          className={cn(
            'flex items-center justify-center rounded-full bg-cream-200 text-crust-700',
            'hover:bg-cream-300 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed',
            sizes[size].buttons
          )}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
