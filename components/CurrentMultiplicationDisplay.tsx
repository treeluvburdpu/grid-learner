import React from 'react';
import type { GridMode } from '../types';

interface CurrentMultiplicationDisplayProps {
  selectedLeft: number | null;
  selectedTop: number | null;
  showZeroResult: boolean;
  gridMode: GridMode;
}

export const CurrentMultiplicationDisplay: React.FC<CurrentMultiplicationDisplayProps> = ({ selectedLeft, selectedTop, showZeroResult, gridMode }) => {
  let displayString = "";
  let result: number | string | null = null;

  const formatNumber = (num: number) => {
    if (gridMode === 'decimal') {
      return (num / 10).toFixed(1);
    }
    return num.toString();
  };

  const formatResult = (left: number, top: number) => {
    if (gridMode === 'decimal') {
      return (left * top / 100).toFixed(2);
    }
    return (left * top).toString();
  };

  if (showZeroResult) {
    displayString = `0 x 0`;
    result = 0;
  } else if (selectedLeft !== null && selectedTop !== null) {
    displayString = `${formatNumber(selectedLeft)} x ${formatNumber(selectedTop)}`;
    result = formatResult(selectedLeft, selectedTop);
  } else if (selectedLeft !== null) {
    displayString = `${formatNumber(selectedLeft)} x 0`;
    result = 0;
  } else if (selectedTop !== null) {
    displayString = `0 x ${formatNumber(selectedTop)}`;
    result = 0;
  }

  if (displayString === "") {
    return null;
  }

  return (
    <span className="font-mono font-bold text-lg sm:text-2xl md:text-3xl ml-2 whitespace-nowrap">
      <span className="text-green-400">{displayString}</span>
      {result !== null && <span className="text-gray-300"> = {result}</span>}
    </span>
  );
};