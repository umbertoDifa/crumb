# 🍞 Crumb - Professional Bread Calculator

A beautiful, mobile-first bread baking calculator that uses professional Baker's Math to calculate exact recipes, determine required water temperature, and provide step-by-step instructions.

**Live Demo:** [bread-virid-one.vercel.app](https://bread-virid-one.vercel.app)

![Crumb Screenshot](https://via.placeholder.com/800x400?text=Crumb+Bread+Calculator)

## Features

### 📐 Baker's Math Calculations
- **Water Temperature Calculation**: Uses Rule of 3 (Direct) and Rule of 4 (Indirect) methods with friction factors for accurate dough temperature targeting
- **Dynamic Fermentation Times**: Bulk and proof times adjust based on room temperature, hydration, and fermentation speed using Q10 enzyme kinetics
- **High Hydration Workflow**: Automatically includes Autolyse and Bassinage steps when hydration > 75%

### 🥖 Baking Methods
- **Direct**: Standard same-day bread
- **Biga**: Italian stiff preferment (50% hydration) for complex flavors and chewy texture
- **Poolish**: French liquid preferment (100% hydration) for extensibility and mild flavor

### ⏱️ Smart Timing
- **"Ready By" Time**: Shows exactly when your bread will be ready if you start now
- **Persistent Timers**: Timers continue running even if you close the app - come back later and see your progress
- **Step-by-Step Process**: Guided instructions with duration estimates for each step

### 📱 Mobile-First Design
- Optimized for small screens (down to 320px)
- Touch-friendly controls
- Responsive layout that works on all devices

## Tech Stack

- **React 19** + **TypeScript** - Modern React with strict typing
- **Vite 7** - Fast build tooling
- **Tailwind CSS 4** - Utility-first styling
- **Zustand 5** - Lightweight state management with persistence
- **Framer Motion** - Smooth animations
- **Lucide Icons** - Beautiful icons
- **Vitest** - Fast unit testing

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/umbertoDifa/crumb.git
cd crumb

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run test       # Run tests in watch mode
npm run test:run   # Run tests once
npm run test:coverage  # Run tests with coverage report
npm run lint       # Run ESLint
```

## Architecture

### Directory Structure

```
src/
├── components/     # Reusable UI components
│   ├── Header.tsx
│   ├── IngredientRow.tsx
│   ├── KnobSlider.tsx
│   ├── MethodSelector.tsx
│   ├── NumberInput.tsx
│   ├── StepCard.tsx
│   ├── TempWidget.tsx
│   └── Toggle.tsx
├── store/          # Zustand state management
│   └── useRecipeStore.ts
├── types/          # TypeScript interfaces
│   └── index.ts
├── utils/          # Business logic
│   ├── breadMath.ts      # Core calculations
│   ├── breadMath.test.ts # 114 unit tests
│   ├── constants.ts      # Configuration
│   └── cn.ts             # Utility functions
├── views/          # Page components
│   ├── CalculatorView.tsx
│   └── ProcessView.tsx
├── App.tsx
├── main.tsx
└── index.css       # Global styles & theme
```

### Core Logic (`breadMath.ts`)

The bread math engine implements professional baking formulas:

#### Water Temperature Calculation

```typescript
// Direct Method (Rule of 3)
waterTemp = (DDT × 3) - roomTemp - flourTemp - friction

// Indirect Method (Rule of 4)
waterTemp = (DDT × 4) - roomTemp - flourTemp - friction - prefermentTemp
```

#### Fermentation Time

Uses Q10 rule for temperature-dependent enzyme kinetics:

```typescript
// Temperature factor: doubles/halves rate every 8°C
tempFactor = 2^(-tempDiff / 8)

// Hydration factor: higher hydration = faster fermentation
hydrationFactor = 1 - min(0.30, (hydration - 65) × 0.015)

// Combined
bulkTime = baseTime × tempFactor × hydrationFactor × speedFactor
```

#### Preferment Timing

Realistic caps based on professional practice:
- **Biga (room temp)**: 8-12 hours
- **Biga (fridge)**: max 16 hours
- **Poolish (room temp)**: 12-16 hours
- **Poolish (fridge)**: max 24 hours

### State Persistence

The app uses Zustand with localStorage persistence to:
- Remember your preferred settings
- Keep track of active bakes across browser sessions
- Persist timer states (continue running even when app is closed)

## Testing

The `breadMath.ts` module has comprehensive test coverage (114 tests):

```bash
npm run test:run

# Output:
# ✓ src/utils/breadMath.test.ts (114 tests) 8ms
# Test Files  1 passed (1)
# Tests  114 passed (114)
```

Tests cover:
- Friction calculations (mixer type, hydration effects)
- Water temperature (Rule of 3, Rule of 4, edge cases)
- Yeast calculations (speed, hydration, scaling)
- Preferment composition (Biga, Poolish)
- Hydration factor calculations
- Bulk and proof time calculations
- Preferment time with realistic caps
- Total time aggregation
- Step generation for all workflows
- Utility functions (formatDuration, gramsToOunces, etc.)

## Configuration Constants

Key baking constants in `constants.ts`:

| Constant | Value | Description |
|----------|-------|-------------|
| `TARGET_DDT` | 24°C | Target dough temperature |
| `FRICTION_HAND` | 2°C | Friction factor for hand mixing |
| `FRICTION_MIXER` | 12°C | Friction factor for stand mixer |
| `BASE_BULK_TIME` | 120 min | Base bulk fermentation at 24°C |
| `PROOF_TO_BULK_RATIO` | 0.50 | Proof time as ratio of bulk |
| `HIGH_HYDRATION_THRESHOLD` | 75% | Triggers autolyse workflow |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - feel free to use this for your own baking adventures! 🥖

## Acknowledgments

Built with love for bread bakers everywhere. The fermentation calculations are based on:
- Professional baking literature on DDT and preferment management
- Q10 enzyme kinetics for temperature effects
- Water activity principles for hydration effects

---

Made with 🍞 by [umbertoDifa](https://github.com/umbertoDifa)
