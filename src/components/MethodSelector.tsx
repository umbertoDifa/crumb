import { motion } from 'framer-motion';
import type { Method } from '../types';
import { METHOD_LABELS } from '../utils/constants';
import { cn } from '../utils/cn';

interface MethodSelectorProps {
  value: Method;
  onChange: (method: Method) => void;
}

const methods: Method[] = ['DIRECT', 'BIGA', 'POOLISH'];

export function MethodSelector({ value, onChange }: MethodSelectorProps) {
  return (
    <div className="relative flex rounded-lg bg-cream-200 p-1">
      {methods.map((method) => (
        <button
          key={method}
          onClick={() => onChange(method)}
          className={cn(
            'relative z-10 flex-1 px-4 py-2.5 text-sm font-medium transition-colors',
            value === method ? 'text-cream-50' : 'text-crust-600 hover:text-crust-800'
          )}
        >
          {METHOD_LABELS[method]}
        </button>
      ))}
      
      {/* Animated background pill */}
      <motion.div
        className="absolute inset-y-1 rounded-md bg-crust-800 shadow-bread"
        layout
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 35,
        }}
        style={{
          width: `calc(${100 / methods.length}% - 4px)`,
          left: `calc(${(methods.indexOf(value) * 100) / methods.length}% + 2px)`,
        }}
      />
    </div>
  );
}
