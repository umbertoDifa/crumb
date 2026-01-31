import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

interface ToggleProps<T extends string> {
  options: { value: T; label: string; icon?: React.ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
}

export function Toggle<T extends string>({ 
  options, 
  value, 
  onChange,
  size = 'md',
}: ToggleProps<T>) {
  const selectedIndex = options.findIndex((o) => o.value === value);
  
  const sizes = {
    sm: 'text-xs py-1.5 px-3',
    md: 'text-sm py-2 px-4',
  };
  
  return (
    <div className="relative flex rounded-lg bg-cream-200 p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'relative z-10 flex items-center justify-center gap-2 flex-1 font-medium transition-colors',
            sizes[size],
            value === option.value ? 'text-crust-900' : 'text-crust-500 hover:text-crust-700'
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
      
      {/* Animated background */}
      <motion.div
        className="absolute inset-y-0.5 rounded-md bg-cream-50 shadow-sm"
        layout
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 35,
        }}
        style={{
          width: `calc(${100 / options.length}%)`,
          left: `calc(${(selectedIndex * 100) / options.length}%)`,
        }}
      />
    </div>
  );
}
