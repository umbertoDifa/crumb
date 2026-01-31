import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, ChevronDown, Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '../utils/cn';
import { useRecipeStore } from '../store/useRecipeStore';
import type { Step } from '../types';

interface StepCardProps {
  step: Step;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  onComplete: () => void;
  scheduledTime?: Date;
}

export function StepCard({ step, index, isActive, isCompleted, onComplete, scheduledTime }: StepCardProps) {
  const [isExpanded, setIsExpanded] = useState(isActive);
  
  // Get timer state from store for persistence
  const timerStates = useRecipeStore((state) => state.timerStates);
  const updateTimerState = useRecipeStore((state) => state.updateTimerState);
  
  const timerState = timerStates[step.id];
  const timerSeconds = timerState?.remainingSeconds ?? (step.duration ? step.duration * 60 : 0);
  const isTimerRunning = timerState?.isRunning ?? false;
  
  // Format scheduled time
  const formatScheduledTime = (date?: Date) => {
    if (!date) return '';
    const now = new Date();
    const isToday = date.getDate() === now.getDate() && 
                    date.getMonth() === now.getMonth() && 
                    date.getFullYear() === now.getFullYear();
    const isTomorrow = date.getDate() === now.getDate() + 1 &&
                       date.getMonth() === now.getMonth() &&
                       date.getFullYear() === now.getFullYear();
    
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    if (isToday) {
      return timeStr;
    } else if (isTomorrow) {
      return `Tomorrow ${timeStr}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };
  
  useEffect(() => {
    setIsExpanded(isActive);
  }, [isActive]);
  
  // Timer countdown effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        updateTimerState(step.id, { 
          remainingSeconds: timerSeconds - 1,
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, step.id, updateTimerState]);
  
  const toggleTimer = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    updateTimerState(step.id, { isRunning: !isTimerRunning });
  }, [step.id, isTimerRunning, updateTimerState]);
  
  const resetTimer = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    updateTimerState(step.id, { 
      remainingSeconds: (step.duration ?? 0) * 60,
      isRunning: false,
    });
  }, [step.id, step.duration, updateTimerState]);
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'relative rounded-xl border transition-all',
        isActive 
          ? 'bg-cream-50 border-wheat-400 shadow-bread-lg' 
          : isCompleted
            ? 'bg-cream-100/50 border-cream-200'
            : 'bg-cream-100 border-cream-300'
      )}
    >
      {/* Timeline connector */}
      <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-cream-300" />
      
      {/* Step indicator */}
      <div className={cn(
        'absolute left-4 top-4 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold z-10',
        isCompleted 
          ? 'bg-green-500 text-white' 
          : isActive 
            ? 'bg-wheat-500 text-white'
            : 'bg-cream-300 text-crust-600'
      )}>
        {isCompleted ? <Check className="w-3 h-3" /> : index + 1}
      </div>
      
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4 pl-12 pr-12"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className={cn(
                'font-semibold text-sm sm:text-base',
                isCompleted ? 'text-crust-400 line-through' : 'text-crust-800'
              )}>
                {step.title}
              </h3>
              {scheduledTime && (
                <span className={cn(
                  'tabular-nums text-xs sm:text-sm font-medium shrink-0',
                  isCompleted ? 'text-crust-300' : 'text-crust-500'
                )}>
                  {formatScheduledTime(scheduledTime)}
                </span>
              )}
            </div>
          </div>
          
          <ChevronDown 
            className={cn(
              'w-5 h-5 text-crust-400 transition-transform shrink-0 ml-2',
              isExpanded && 'rotate-180'
            )} 
          />
        </div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pl-12 pb-4 space-y-4">
              <p className="text-sm text-crust-600 leading-relaxed">
                {step.description}
              </p>
              
              {/* Timer */}
              {step.duration && isActive && (
                <div className="flex items-center gap-3 p-3 bg-cream-200 rounded-lg">
                  <Clock className="w-5 h-5 text-crust-500 shrink-0" />
                  <span className={cn(
                    'tabular-nums text-xl sm:text-2xl font-bold flex-1',
                    timerSeconds === 0 ? 'text-green-600' : 'text-crust-800'
                  )}>
                    {timerSeconds === 0 ? 'Done!' : formatTime(timerSeconds)}
                  </span>
                  <div className="flex gap-2">
                    {timerSeconds > 0 && (
                      <button
                        onClick={toggleTimer}
                        className={cn(
                          'p-2 rounded-full transition-colors touch-target',
                          isTimerRunning 
                            ? 'bg-alert-500 text-white' 
                            : 'bg-wheat-500 text-white'
                        )}
                      >
                        {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                    )}
                    <button
                      onClick={resetTimer}
                      className="p-2 rounded-full bg-crust-400 text-white transition-colors touch-target"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Complete button */}
              {isActive && (
                <button
                  onClick={onComplete}
                  className="w-full py-3 bg-wheat-500 hover:bg-wheat-600 text-white font-semibold rounded-lg transition-colors active:scale-[0.98] touch-target"
                >
                  Mark Complete
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
