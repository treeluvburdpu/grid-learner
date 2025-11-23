import React, { useState, useCallback } from 'react';
import { SquareCellComponent } from '../CellComponent';
import { HEADER_DIM } from '../../utils/constants';

interface DiffGridProps {
  mode: 'diff'; // This component only handles diff mode
  onReset: () => void;
  diffValues?: { green: number | null; red: number | null };
  onDiffChange?: (color: 'green' | 'red', value: number) => void;
}

export const DiffGrid: React.FC<DiffGridProps> = ({ mode, onReset, diffValues, onDiffChange }) => {
  const maxX = 10;
  const maxY = 10; // Max difference or input value is 10

  const [hoveredCellKey, setHoveredCellKey] = useState<string | null>(null);

  const handleMouseEnter = useCallback((key: string) => setHoveredCellKey(key), []);
  const handleMouseLeaveGrid = useCallback(() => setHoveredCellKey(null), []);

  const isOdd = (n: number) => n % 2 !== 0;
  const GREEN_COL = 2; // Minuend
  const RED_COL = 4; // Subtrahend
  const DIFF_COL = 10; // Result

  const rowElements = [];
  for (let r = maxY; r >= 1; r--) {
    const headerKey = `header-left-${r}`;
    const headerVal = r; // Left header is just row number for diff mode

    rowElements.push(
      <SquareCellComponent
        key={headerKey}
        actualValue={headerVal}
        isHovered={hoveredCellKey === headerKey}
        onMouseEnter={() => handleMouseEnter(headerKey)}
        isHeader
        isLeftHeader
        mode={mode}
        borderClasses=""
        baseSizeClasses="w-full h-full"
        className="text-transparent"
      />
    );

    for (let c = 1; c <= maxX; c++) {
      const cellKey = `cell-${r}-${c}`;

      let cellContent: React.ReactNode = '';
      let cellDiffColor: 'green' | 'red' | 'darkgrey' | undefined = undefined; // Using green/red for diff visualization
      let onClickHandler: (() => void) | undefined = undefined;

      const gVal = diffValues?.green || 0;
      const rVal = diffValues?.red || 0;
      const diffResult = gVal - rVal; // Minuend - Subtrahend

      if (c === GREEN_COL) {
        if (r <= 10) {
          if (r <= gVal) {
            cellContent = r;
            cellDiffColor = 'green';
          }
          onClickHandler = () => onDiffChange && onDiffChange('green', r);
        }
      } else if (c === RED_COL) {
        if (r <= 10) {
          if (r <= rVal) {
            cellContent = r;
            cellDiffColor = 'red';
          }
          onClickHandler = () => onDiffChange && onDiffChange('red', r);
        }
      } else if (c === DIFF_COL) {
        if (diffResult >= 0) {
          // Positive difference: fill with green blocks
          if (r <= diffResult) {
            cellContent = r;
            cellDiffColor = 'green';
          }
        } else {
          // Negative difference: fill with red blocks (representing "debt")
          if (r <= Math.abs(diffResult)) {
            cellContent = r;
            cellDiffColor = 'red';
          }
        }
      }

      if (isOdd(c) || c === 6 || c === 8) {
        // Odd columns and spacer col 6, 8 are blank
        rowElements.push(
          <SquareCellComponent
            key={cellKey}
            actualValue=""
            isHovered={false}
            borderClasses=""
            mode={mode}
            baseSizeClasses="aspect-square"
            className="adder-cell-no-border" // Reusing adder's no-border class
          />
        );
      } else {
        const isInputSlot = (c === GREEN_COL || c === RED_COL) && r <= 10;
        const border = isInputSlot || c === DIFF_COL ? 'adder-cell-border' : 'border-none'; // Reusing adder's border class

        rowElements.push(
          <SquareCellComponent
            key={cellKey}
            actualValue={cellContent as string}
            isHovered={isInputSlot && hoveredCellKey === cellKey}
            onMouseEnter={() => isInputSlot && handleMouseEnter(cellKey)}
            onClick={onClickHandler}
            adderColor={cellDiffColor} // Reusing adderColor prop for diff visualization
            borderClasses={border}
            mode={mode}
            baseSizeClasses="aspect-square"
            className={`row-${r} col-${c} ${isInputSlot ? 'hover:bg-gray-800' : ''}`}
          />
        );
      }
    }
  }

  return (
    <div
      className="grid bg-black/60 select-none w-full grid-no-gap"
      style={{
        gridTemplateColumns: `${HEADER_DIM} repeat(${maxX}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${maxY}, auto) ${HEADER_DIM}`,
      }}
      role="grid"
      aria-rowcount={maxY + 1}
      aria-colcount={maxX + 1}
      onMouseLeave={handleMouseLeaveGrid}
    >
      {rowElements}

      <SquareCellComponent
        actualValue="0"
        isHovered={hoveredCellKey === 'header-corner-0'}
        onMouseEnter={() => handleMouseEnter('header-corner-0')}
        onClick={onReset}
        isHeader={true}
        mode={mode}
        borderClasses="bg-black/10"
        baseSizeClasses="w-full h-full"
        className="text-transparent"
        style={{ width: HEADER_DIM, height: HEADER_DIM }}
      />

      {/* Bottom Headers */}
      {Array.from({ length: maxX }, (_, i) => i + 1).map((num) => {
        const cellKey = `header-bottom-${num}`;
        let content: string | number = '';
        let color: 'green' | 'red' | 'darkgrey' | undefined = undefined;

        if (num === GREEN_COL) {
          content = diffValues?.green || 0;
          color = 'green';
        } else if (num === RED_COL) {
          content = diffValues?.red || 0;
          color = 'red';
        } else if (num === 3) {
          content = '-';
          color = 'darkgrey';
        } else if (num === 9) {
          content = '=';
          color = 'darkgrey';
        } else if (num === DIFF_COL) {
          const gVal = diffValues?.green || 0;
          const rVal = diffValues?.red || 0;
          content = gVal - rVal;
          color = content >= 0 ? 'green' : 'red'; // Color the total based on sign
        }

        return (
          <SquareCellComponent
            key={cellKey}
            actualValue={content}
            isHovered={false}
            isHeader
            isBottomHeader
            mode={mode}
            adderColor={color}
            borderClasses="border-t border-white/30"
            baseSizeClasses="w-full h-full"
          />
        );
      })}
    </div>
  );
};
