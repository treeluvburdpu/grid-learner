import React from 'react';
import type { GridMode } from '../types';

interface CurrentMultiplicationDisplayProps {
  selectedLeft: number | null;
  selectedTop: number | null;
  showZeroResult: boolean;
  gridMode: GridMode;
  adderValues?: { red: number | null; green: number | null; blue: number | null };
  diffValues?: { green: number | null; red: number | null }; // Added diffValues
}

export const CurrentMultiplicationDisplay: React.FC<CurrentMultiplicationDisplayProps> = ({
  selectedLeft,
  selectedTop,
  showZeroResult,
  gridMode,
  adderValues,
  diffValues, // Destructure diffValues
}) => {
  if (gridMode === 'adder' && adderValues) {
    const r = adderValues.red || 0;
    const g = adderValues.green || 0;
    const b = adderValues.blue || 0;
    const sum = r + g + b;

    if (sum === 0 && !showZeroResult) return null;

    return (
      <span className="font-mono font-bold text-lg sm:text-2xl md:text-3xl ml-2 whitespace-nowrap flex gap-2">
        <span className="text-red-400">{r}</span>
        <span className="text-gray-400">+</span>
        <span className="text-green-400">{g}</span>
        <span className="text-gray-400">+</span>
        <span className="text-blue-400">{b}</span>
        <span className="text-gray-300">= {sum}</span>
      </span>
    );
  } else if (gridMode === 'diff' && diffValues) {
    // New block for Diff mode
    const g = diffValues.green || 0; // Minuend (green)
    const r = diffValues.red || 0; // Subtrahend (red)
    const diff = g - r;

    if (g === 0 && r === 0 && !showZeroResult) return null;

    return (
      <span className="font-mono font-bold text-lg sm:text-2xl md:text-3xl ml-2 whitespace-nowrap flex gap-2">
        <span className="text-green-400">{g}</span>
        <span className="text-gray-400">-</span>
        <span className="text-red-400">{r}</span>
        <span className="text-gray-300">= {diff}</span>
      </span>
    );
  }

  let displayString = '';
  let result: number | string | null = null;

  const formatNumber = (num: number) => {
    if (gridMode === 'decimal') {
      // Headers are formatted as num/10 (e.g. 1 -> 0.1)
      return (num / 10).toFixed(1);
    }
    return num.toString();
  };

  const formatResult = (left: number, top: number) => {
    if (gridMode === 'decimal') {
      // Matching grid calculation: (Left Index * Top Index) / 100
      // This represents 0.01 per cell.
      const val = (left * top) / 100;
      return parseFloat(val.toFixed(2));
    }
    return (left * top).toString();
  };

  if (showZeroResult) {
    const zeroVal = gridMode === 'decimal' ? formatNumber(0) : 0;
    displayString = `${zeroVal} x ${zeroVal}`;
    result = gridMode === 'decimal' ? formatResult(0, 0) : 0;
  } else if (selectedLeft !== null && selectedTop !== null) {
    displayString = `${formatNumber(selectedLeft)} x ${formatNumber(selectedTop)}`;
    result = formatResult(selectedLeft, selectedTop);
  } else if (selectedLeft !== null) {
    displayString = `${formatNumber(selectedLeft)} x ${gridMode === 'decimal' ? formatNumber(0) : 0}`;
    result = 0;
  } else if (selectedTop !== null) {
    displayString = `${gridMode === 'decimal' ? formatNumber(0) : 0} x ${formatNumber(selectedTop)}`;
    result = 0;
  }

  if (displayString === '') {
    return null;
  }

  return (
    <span className="font-mono font-bold text-lg sm:text-2xl md:text-3xl ml-2 whitespace-nowrap">
      <span className="text-green-400">{displayString}</span>
      {result !== null && (
        <span className="text-gray-300">
          = {gridMode === 'decimal' && typeof result === 'number' ? result.toFixed(2) : result}
        </span>
      )}
    </span>
  );
};
