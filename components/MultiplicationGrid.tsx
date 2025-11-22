import React from 'react';
import type { GridMode } from '../types';
import { AdderGrid } from './grids/AdderGrid';
import { MultiplicationGridCore } from './grids/MultiplicationGridCore';

interface MultiplicationGridProps {
  mode: GridMode;
  selectedTop: number | null;
  selectedLeft: number | null;
  onSelectTop: (num: number) => void;
  onSelectLeft: (num: number) => void;
  onReset: () => void;
  adderValues?: { red: number | null; green: number | null; blue: number | null };
  onAdderChange?: (color: 'red' | 'green' | 'blue', value: number) => void;
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
}) => {
  switch (mode) {
    case 'adder':
      return <AdderGrid mode={mode} onReset={onReset} adderValues={adderValues} onAdderChange={onAdderChange} />;
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
