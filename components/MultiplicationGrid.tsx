import React from 'react';
import type { GridMode, Fruit, Line } from '../types'; // Import Fruit type, Line
import { AdderGrid } from './grids/AdderGrid';
import { MultiplicationGridCore } from './grids/MultiplicationGridCore';
import { DiffGrid } from './grids/DiffGrid'; // Import DiffGrid
import { CountGrid } from './grids/CountGrid'; // Import CountGrid

interface MultiplicationGridProps {
  mode: GridMode;
  selectedTop: number | null;
  selectedLeft: number | null;
  onSelectTop: (num: number) => void;
  onSelectLeft: (num: number) => void;
  onReset: () => void;
  adderValues?: { red: number | null; green: number | null; blue: number | null };
  onAdderChange?: (color: 'red' | 'green' | 'blue', value: number) => void;
  diffValues?: { green: number | null; red: number | null }; // New prop for DiffGrid
  onDiffChange?: (color: 'green' | 'red', value: number) => void; // New prop for DiffGrid
  // Count Mode Placeholder Props
  fruits: Fruit[]; // Use Fruit type
  selectedFruitId: string | null;
  nextNumberToHighlight: number | null;
  currentCount: number;
  onFruitClick: (id: string, value: number) => void;
  onLineComplete: (line: Line, highlightedNumber: number) => void; // New prop for completed lines
  completedLines: Line[]; // New prop to pass completed lines
}

export const MultiplicationGrid: React.FC<MultiplicationGridProps> = ({
  mode,
  selectedTop,
  selectedLeft,
  onSelectTop,
  onSelectLeft,
  onReset,
  adderValues,
  onAdderChange,
  diffValues, // Destructure diffValues
  onDiffChange, // Destructure onDiffChange
  // Destructure Count Mode Placeholder Props
  fruits,
  selectedFruitId,
  nextNumberToHighlight,
  currentCount,
  onFruitClick,
  onLineComplete, // Destructure onLineComplete
  completedLines, // Destructure completedLines
}) => {
  switch (mode) {
    case 'adder':
      return <AdderGrid mode={mode} onReset={onReset} adderValues={adderValues} onAdderChange={onAdderChange} />;
    case 'diff': // Add case for diff mode
      return (
        <DiffGrid
          mode={mode}
          onReset={onReset}
          diffValues={diffValues} // Pass diffValues
          onDiffChange={onDiffChange} // Pass onDiffChange
        />
      );
    case 'counting': // Add case for count mode
      return (
        <CountGrid
          mode={mode}
          onReset={onReset}
          fruits={fruits}
          selectedFruitId={selectedFruitId}
          nextNumberToHighlight={nextNumberToHighlight}
          currentCount={currentCount}
          onFruitClick={onFruitClick}
          onLineComplete={onLineComplete} // Pass onLineComplete
          completedLines={completedLines} // Pass completedLines
        />
      );
    case '10':
    case 'decimal':
      return (
        <MultiplicationGridCore
          mode={mode}
          selectedTop={selectedTop}
          selectedLeft={selectedLeft}
          onSelectTop={onSelectTop}
          onSelectLeft={onSelectLeft}
          onReset={onReset}
        />
      );
    default:
      return <div>Unsupported Grid Mode</div>;
  }
};
