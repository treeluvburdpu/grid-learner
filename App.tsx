import React, { useState, useCallback } from 'react';
import { GridControls } from './components/GridControls';
import { MultiplicationGrid } from './components/MultiplicationGrid';
import { CurrentMultiplicationDisplay } from './components/CurrentMultiplicationDisplay';
import type { GridMode, Fruit, FruitType, Line } from './types'; // Import FruitType, Line

const FRUIT_TYPES: FruitType[] = [
  { name: 'Apple', icon: '🍎' },
  { name: 'Banana', icon: '🍌' },
  { name: 'Orange', icon: '🍊' },
  { name: 'Grapes', icon: '🍇' },
  { name: 'Watermelon', icon: '🍉' },
  { name: 'Strawberry', icon: '🍓' },
  { name: 'Peach', icon: '🍑' },
  { name: 'Kiwi', icon: '🥝' },
  { name: 'Pineapple', icon: '🍍' },
  { name: 'Mango', icon: '🥭' },
];

const MAX_X_FRUIT = 19; // Max X for fruit placement (CountGrid maxX is 20, last column for numbers)
const MAX_Y_FRUIT = 20; // Max Y for fruit placement (CountGrid maxY is 20)

const generateRandomFruits = (numFruits: number): Fruit[] => {
  const generatedFruits: Fruit[] = [];
  const usedPositions = new Set<string>(); // To track occupied positions

  for (let i = 0; i < numFruits; i++) {
    let row: number, col: number;
    let positionKey: string;

    // Keep generating random positions until a unique one is found
    do {
      row = Math.floor(Math.random() * MAX_Y_FRUIT) + 1; // 1 to MAX_Y_FRUIT
      col = Math.floor(Math.random() * MAX_X_FRUIT) + 1; // 1 to MAX_X_FRUIT
      positionKey = `${row}-${col}`;
    } while (usedPositions.has(positionKey));

    usedPositions.add(positionKey);

    const randomFruitType = FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];

    generatedFruits.push({
      id: String(i + 1), // Simple ID for now
      type: randomFruitType,
      row,
      col,
      isCounted: false,
    });
  }
  return generatedFruits;
};

const App: React.FC = () => {
  const [gridMode, setGridMode] = useState<GridMode>(() => {
    const savedMode = localStorage.getItem('gridMode');
    return savedMode ? (savedMode as GridMode) : 'adder';
  });

  // Multiplication Mode State
  const [selectedTop, setSelectedTop] = useState<number | null>(null);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);

  // Adder Mode State
  const [adderValues, setAdderValues] = useState<{ red: number | null; green: number | null; blue: number | null }>({
    red: null,
    green: null,
    blue: null,
  });

  // Diff Mode State
  const [diffValues, setDiffValues] = useState<{ green: number | null; red: number | null }>({
    green: null,
    red: null,
  });

  // Count Mode Placeholder State
  const [fruits, setFruits] = useState<Fruit[]>(() => {
    if (localStorage.getItem('gridMode') === 'counting') {
      return generateRandomFruits(10); // Generate 10 random fruits
    }
    return [];
  });
  const [selectedFruitId, setSelectedFruitId] = useState<string | null>(null);
  const [currentCount, setCurrentCount] = useState<number>(0);
  const [completedLines, setCompletedLines] = useState<Line[]>([]); // New state for persistent lines

  const [showZeroResult, setShowZeroResult] = useState(false);

  const handleGridModeChange = useCallback((mode: GridMode) => {
    setGridMode(mode);
    localStorage.setItem('gridMode', mode); // Save to localStorage
    setSelectedTop(null);
    setSelectedLeft(null);
    setAdderValues({ red: null, green: null, blue: null });
    setDiffValues({ green: null, red: null });
    // Reset count-specific state
    if (mode === 'counting') {
      setFruits(generateRandomFruits(10)); // Generate new random fruits
    } else {
      setFruits([]);
    }
    setCompletedLines([]); // Clear completed lines
    setSelectedFruitId(null);
    setCurrentCount(0);
    setShowZeroResult(false);
  }, []);

  // Multiplication Handlers
  const handleSelectTop = useCallback((num: number) => {
    setSelectedTop((prev) => (prev === num ? null : num));
    setShowZeroResult(false);
  }, []);

  const handleSelectLeft = useCallback((num: number) => {
    setSelectedLeft((prev) => (prev === num ? null : num));
    setShowZeroResult(false);
  }, []);

  // Adder Handlers
  const handleAdderChange = useCallback((color: 'red' | 'green' | 'blue', value: number) => {
    setAdderValues((prev) => {
      // Toggle off if clicking same number
      if (prev[color] === value) {
        return { ...prev, [color]: null };
      }
      return { ...prev, [color]: value };
    });
    setShowZeroResult(false);
  }, []);

  // Diff Handlers
  const handleDiffChange = useCallback((color: 'green' | 'red', value: number) => {
    setDiffValues((prev) => {
      // Toggle off if clicking same number
      if (prev[color] === value) {
        return { ...prev, [color]: null };
      }
      return { ...prev, [color]: value };
    });
    setShowZeroResult(false);
  }, []);

  // Count Handlers
  const handleFruitClick = useCallback((id: string, value: number) => {
    setFruits((prevFruits) =>
      prevFruits.map((fruit) => (fruit.id === id ? { ...fruit, isCounted: true, countValue: value } : fruit))
    );
    setSelectedFruitId(id);
    setCurrentCount(value); // This is the count AFTER clicking the fruit
    setShowZeroResult(false);
  }, []);

  // Renamed to onLineComplete to better reflect its purpose
  const handleLineComplete = useCallback((completedLine: Line) => {
    setCompletedLines((prevLines) => [...prevLines, completedLine]); // Add the completed line
    // The number highlighting is now solely controlled by currentCount in CountGrid
  }, []);

  const handleReset = useCallback(() => {
    if (gridMode === 'adder') {
      setAdderValues({ red: null, green: null, blue: null });
    } else if (gridMode === 'diff') {
      setDiffValues({ green: null, red: null });
    } else if (gridMode === 'counting') {
      // Reset count-specific state
      setFruits(generateRandomFruits(10)); // Generate new random fruits on reset
      setCompletedLines([]); // Clear completed lines
      setSelectedFruitId(null);
      setCurrentCount(0);
    } else {
      setSelectedTop(null);
      setSelectedLeft(null);
    }
    setShowZeroResult(true);
  }, [gridMode]);

  return (
    <div className="h-screen bg-black text-white flex flex-col items-center p-1 sm:p-2 md:p-4 overflow-hidden">
      <div className="w-full max-w-full xl:max-w-7xl flex flex-col h-full">
        {/* Top Header: Info Text */}
        <header className="text-center py-2 text-xs text-gray-500 sticky top-0 bg-black z-20 border-b border-gray-700/50 shrink-0">
          {gridMode === 'adder'
            ? 'Select height in colored columns to add.'
            : gridMode === 'diff'
              ? 'Select green column for minuend, red for subtrahend.'
              : gridMode === 'counting'
                ? 'Count the fruits by selecting them in order.'
                : 'Select numbers on edge. Grid is scrollable.'}
        </header>

        {/* Main Content: Grid - Flex Col Reverse for bottom-anchored scrolling */}
        <main className="w-full flex-grow flex flex-col-reverse overflow-y-auto items-center py-2 sm:py-4 relative">
          <div className="w-full flex justify-center">
            <MultiplicationGrid
              mode={gridMode}
              selectedTop={selectedTop}
              selectedLeft={selectedLeft}
              onSelectTop={handleSelectTop}
              onSelectLeft={handleSelectLeft}
              onReset={handleReset}
              adderValues={adderValues}
              onAdderChange={handleAdderChange}
              diffValues={diffValues} // Pass diffValues
              onDiffChange={handleDiffChange} // Pass onDiffChange
              // Count Mode Placeholder Props
              fruits={fruits}
              selectedFruitId={selectedFruitId}
              currentCount={currentCount}
              onFruitClick={handleFruitClick}
              onLineComplete={handleLineComplete} // Pass the new handler
              completedLines={completedLines} // Pass completed lines
            />
          </div>
        </main>

        {/* Bottom Footer: Controls & Title */}
        <footer className="flex justify-between items-center py-2 sm:py-3 md:py-4 sticky bottom-0 bg-black z-20 px-1 md:px-2 border-t border-gray-700/50 shrink-0">
          <h1 className="text-base sm:text-xl md:text-2xl font-bold text-gray-300 truncate flex items-baseline">
            <CurrentMultiplicationDisplay
              selectedLeft={selectedLeft}
              selectedTop={selectedTop}
              showZeroResult={showZeroResult}
              gridMode={gridMode}
              adderValues={adderValues}
            />
          </h1>
          <GridControls currentMode={gridMode} onModeChange={handleGridModeChange} />
        </footer>
      </div>
    </div>
  );
};

export default App;
