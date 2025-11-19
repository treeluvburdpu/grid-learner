import React from 'react';
import type { GridMode } from '../types';

interface GridControlsProps {
  currentMode: GridMode;
  onModeChange: (mode: GridMode) => void;
}

export const GridControls: React.FC<GridControlsProps> = ({ currentMode, onModeChange }) => {
  const modes: GridMode[] = ['10', '100'];

  return (
    <div className="flex space-x-1 sm:space-x-2">
      {modes.map(mode => (
        <button
          key={mode}
          onClick={() => onModeChange(mode)}
          className={`px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors
            ${currentMode === mode
              ? 'bg-blue-500 hover:bg-blue-400 text-white ring-2 ring-blue-300 ring-offset-2 ring-offset-black'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
        >
          {mode}x{mode === '10' ? 20 : 200}
        </button>
      ))}
    </div>
  );
};