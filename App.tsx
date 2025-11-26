import React, { useState, useCallback } from 'react';
import { GridControls } from './components/GridControls';
import { MultiplicationGrid } from './components/MultiplicationGrid';
import { CurrentMultiplicationDisplay } from './components/CurrentMultiplicationDisplay';
import type { GridMode, Fruit } from './types';

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
      return [
        { id: '1', type: { name: 'Apple', icon: '🍎' }, row: 1, col: 1, isCounted: false },
        { id: '2', type: { name: 'Banana', icon: '🍌' }, row: 1, col: 2, isCounted: false },
        { id: '3', type: { name: 'Orange', icon: '🍊' }, row: 1, col: 3, isCounted: false },
        { id: '4', type: { name: 'Grapes', icon: '🍇' }, row: 1, col: 4, isCounted: false },
        { id: '5', type: { name: 'Watermelon', icon: '🍉' }, row: 1, col: 5, isCounted: false },
        { id: '6', type: { name: 'Strawberry', icon: '🍓' }, row: 2, col: 1, isCounted: false },
        { id: '7', type: { name: 'Peach', icon: '🍑' }, row: 2, col: 2, isCounted: false },
        { id: '8', type: { name: 'Kiwi', icon: '🥝' }, row: 2, col: 3, isCounted: false },
        { id: '9', type: { name: 'Pineapple', icon: '🍍' }, row: 2, col: 4, isCounted: false },
        { id: '10', type: { name: 'Mango', icon: '🥭' }, row: 2, col: 5, isCounted: false },
      ];
    }
    return [];
  });
  const [selectedFruitId, setSelectedFruitId] = useState<string | null>(null);
  const [nextNumberToHighlight, setNextNumberToHighlight] = useState<number | null>(null);
  const [currentCount, setCurrentCount] = useState<number>(0);

  const [showZeroResult, setShowZeroResult] = useState(false);

  const handleGridModeChange = useCallback((mode: GridMode) => {
    setGridMode(mode);
    localStorage.setItem('gridMode', mode); // Save to localStorage
    setSelectedTop(null);
    setSelectedLeft(null);
    setAdderValues({ red: null, green: null, blue: null });
    setDiffValues({ green: null, red: null });
    // Reset count-specific state
    setFruits([]);
    setSelectedFruitId(null);
    setNextNumberToHighlight(null);
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
      prevFruits.map((fruit) => (fruit.id === id ? { ...fruit, isCounted: true } : fruit))
    );
    setSelectedFruitId(id);
    setCurrentCount(value); // This is the count AFTER clicking the fruit
    setNextNumberToHighlight(value + 1); // Set the next number to be highlighted
    setShowZeroResult(false);
  }, []);

  const handleNumberHighlight = useCallback((value: number) => {
    // This callback is triggered after the animation in CountGrid completes
    // It confirms that the number has been successfully "counted" and animated to.
    // We can potentially add more logic here if needed, but for now,
    // the state updates mainly happen in handleFruitClick.
    // Ensure nextNumberToHighlight is correctly updated if the animation completes
    // and currentCount has just been updated.
    setNextNumberToHighlight(value + 1);
  }, []);

  const handleReset = useCallback(() => {
    if (gridMode === 'adder') {
      setAdderValues({ red: null, green: null, blue: null });
    } else if (gridMode === 'diff') {
      setDiffValues({ green: null, red: null });
    } else if (gridMode === 'counting') {
      // Reset count-specific state
      setFruits([]);
      setSelectedFruitId(null);
      setNextNumberToHighlight(null);
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
              nextNumberToHighlight={nextNumberToHighlight}
              currentCount={currentCount}
              onFruitClick={handleFruitClick}
              onNumberHighlight={handleNumberHighlight}
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
