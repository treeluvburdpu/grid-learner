import React, { useState, useCallback } from 'react';
import { GridControls } from './components/GridControls';
import { MultiplicationGrid } from './components/MultiplicationGrid';
import { CurrentMultiplicationDisplay } from './components/CurrentMultiplicationDisplay';
import type { GridMode } from './types';

const App: React.FC = () => {
  const [gridMode, setGridMode] = useState<GridMode>('10');
  const [selectedTop, setSelectedTop] = useState<number | null>(null);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [showZeroResult, setShowZeroResult] = useState(false);

  const handleGridModeChange = useCallback((mode: GridMode) => {
    setGridMode(mode);
    setSelectedTop(null);
    setSelectedLeft(null);
    setShowZeroResult(false);
  }, []);

  const handleSelectTop = useCallback((num: number) => {
    setSelectedTop(prev => (prev === num ? null : num));
    setShowZeroResult(false);
  }, []);

  const handleSelectLeft = useCallback((num: number) => {
    setSelectedLeft(prev => (prev === num ? null : num));
    setShowZeroResult(false);
  }, []);

  const handleReset = useCallback(() => {
    setSelectedTop(null);
    setSelectedLeft(null);
    setShowZeroResult(true);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-1 sm:p-2 md:p-4 overflow-hidden"> {/* Added overflow-hidden to prevent body scroll with virtualized grid */}
      <div className="w-full max-w-full xl:max-w-7xl flex flex-col flex-grow">
        <header className="flex justify-between items-center py-2 sm:py-3 md:py-4 sticky top-0 bg-black z-20 px-1 md:px-2 border-b border-gray-700/50">
          <h1 className="text-base sm:text-xl md:text-2xl font-bold text-gray-300 truncate flex items-baseline">
            Lucia's multiplier
            <CurrentMultiplicationDisplay selectedLeft={selectedLeft} selectedTop={selectedTop} showZeroResult={showZeroResult} />
          </h1>
          <GridControls currentMode={gridMode} onModeChange={handleGridModeChange} />
        </header>
        <main className="w-full flex-grow flex flex-col items-center justify-start py-2 sm:py-4">
          {/* Wrapper to control grid max width and centering. For 100x mode, this allows MultiplicationGrid to manage its own height for scrolling. */}
          <div className="w-full flex-grow flex"> {/* Added flex-grow flex */}
             <MultiplicationGrid
              mode={gridMode}
              selectedTop={selectedTop}
              selectedLeft={selectedLeft}
              onSelectTop={handleSelectTop}
              onSelectLeft={handleSelectLeft}
              onReset={handleReset}
            />
          </div>
        </main>
         <footer className="text-center py-2 text-xs text-gray-500 sticky bottom-0 bg-black z-20 border-t border-gray-700/50">
          Select numbers. {gridMode === '100' ? 'Grid is scrollable.' : 'Grid is scrollable.'} {gridMode === '100' ? 'Hover headers/cells for numbers.' : '100x mode: hover headers/cells for numbers.'}
        </footer>
      </div>
    </div>
  );
};

export default App;