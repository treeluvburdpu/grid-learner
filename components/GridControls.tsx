import React from 'react';
import type { GridMode } from '../types';

interface GridControlsProps {
  currentMode: GridMode;
  onModeChange: (mode: GridMode) => void;
}

export const GridControls: React.FC<GridControlsProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="flex space-x-1 sm:space-x-2">
      <button
        onClick={() => onModeChange('adder')}
        className={`px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors
                    ${
                      currentMode === 'adder'
                        ? 'bg-purple-500 hover:bg-purple-400 text-white ring-2 ring-purple-300 ring-offset-2 ring-offset-black'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
      >
        Sum
      </button>
      <button
        onClick={() => onModeChange('diff')}
        className={`px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors
                    ${
                      currentMode === 'diff'
                        ? 'bg-orange-500 hover:bg-orange-400 text-white ring-2 ring-orange-300 ring-offset-2 ring-offset-black'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
      >
        Diff
      </button>
      <button
        onClick={() => onModeChange('10')}
        className={`px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors
                  ${
                    currentMode === '10'
                      ? 'bg-blue-500 hover:bg-blue-400 text-white ring-2 ring-blue-300 ring-offset-2 ring-offset-black'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
      >
        10x20
      </button>
      <button
        onClick={() => onModeChange('decimal')}
        className={`px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors
                  ${
                    currentMode === 'decimal'
                      ? 'bg-blue-500 hover:bg-blue-400 text-white ring-2 ring-blue-300 ring-offset-2 ring-offset-black'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
      >
        1.0x2.0
      </button>
    </div>
  );
};
