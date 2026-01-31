import { useRecipeStore } from './store/useRecipeStore';
import { Header } from './components/Header';
import { CalculatorView } from './views/CalculatorView';
import { ProcessView } from './views/ProcessView';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const view = useRecipeStore((state) => state.view);

  return (
    <div className="min-h-screen bg-cream-50">
      <Header />
      
      <AnimatePresence mode="wait">
        {view === 'calculator' ? (
          <motion.div
            key="calculator"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <CalculatorView />
          </motion.div>
        ) : (
          <motion.div
            key="process"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <ProcessView />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
