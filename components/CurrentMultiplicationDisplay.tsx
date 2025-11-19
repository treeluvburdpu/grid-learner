import React from 'react';

interface CurrentMultiplicationDisplayProps {
  selectedLeft: number | null;
  selectedTop: number | null;
  showZeroResult: boolean;
}

export const CurrentMultiplicationDisplay: React.FC<CurrentMultiplicationDisplayProps> = ({ selectedLeft, selectedTop, showZeroResult }) => {
  let displayString = "";
  let result: number | null = null;

  if (showZeroResult) {
    displayString = "0 x 0";
    result = 0;
  } else if (selectedLeft !== null && selectedTop !== null) {
    displayString = `${selectedLeft} x ${selectedTop}`;
    result = selectedLeft * selectedTop;
  } else if (selectedLeft !== null) {
    displayString = `${selectedLeft} x 0`;
    result = 0;
  } else if (selectedTop !== null) {
    displayString = `0 x ${selectedTop}`;
    result = 0;
  }

  if (displayString === "") {
    return null;
  }

  // h1 sizes are: text-base sm:text-xl md:text-2xl
  // These sizes are one step larger for each breakpoint.
  return (
    <span className="font-mono font-bold text-lg sm:text-2xl md:text-3xl ml-2 whitespace-nowrap">
      <span className="text-green-400">{displayString}</span>
      {result !== null && <span className="text-gray-300"> = {result}</span>}
    </span>
  );
};
