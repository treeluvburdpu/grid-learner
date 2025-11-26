import React, { useState, useCallback, useEffect, useRef } from 'react';
import { SquareCellComponent } from '../CellComponent';
import { HEADER_DIM } from '../../utils/constants';
import type { GridMode, Fruit } from '../../types';

interface CountGridProps {
  mode: GridMode;
  onReset: () => void;
  fruits: Fruit[];
  selectedFruitId: string | null;
  nextNumberToHighlight: number | null;
  currentCount: number;
  onFruitClick: (id: string, value: number) => void;
  onNumberHighlight: (value: number) => void;
}

export const CountGrid: React.FC<CountGridProps> = ({
  mode,
  onReset,
  fruits,
  selectedFruitId,
  nextNumberToHighlight,
  currentCount,
  onFruitClick,
  onNumberHighlight,
}) => {
  const maxX = 20; // Max X for grid content (excluding left header, including right number line)
  const maxY = 20; // Max Y for grid content

  const [animatingLine, setAnimatingLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [animationProgress, setAnimationProgress] = useState<number>(0); // 0 to 1 for line animation
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null); // New ref for the grid container

  // Constants for animation
  const ANIMATION_DURATION = 500; // 0.5 seconds

  // Function to get absolute pixel coordinates of a cell
  const getCellCoordinates = useCallback(
    (r: number, c: number) => {
      const gridRect = gridRef.current?.getBoundingClientRect();
      if (!gridRect) return null;

      // Calculate actual pixel size of a dynamic cell
      const actualCellWidth = (gridRect.width - parseInt(HEADER_DIM)) / maxX;
      const actualCellHeight = (gridRect.height - parseInt(HEADER_DIM)) / maxY; // Adjusted for bottom header

      // Convert row/col to pixel coordinates (center of the cell)
      // Adjust for left header (HEADER_DIM) and bottom-up rendering (maxY - r)
      const x = gridRect.left + parseInt(HEADER_DIM) + (c - 1) * actualCellWidth + actualCellWidth / 2;
      const y =
        gridRect.top + gridRect.height - parseInt(HEADER_DIM) - (maxY - r) * actualCellHeight - actualCellHeight / 2;

      return { x, y };
    },
    [maxX, maxY] // Depend on maxX, maxY as they are constants defined within component scope
  );

  const rowElements = [];
  for (let r = maxY; r >= 1; r--) {
    // Loop from top to bottom
    // Left header (empty for counting mode initially)
    const headerKey = `header-left-${r}`;
    rowElements.push(
      <SquareCellComponent
        key={headerKey}
        actualValue=""
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
      let onClickHandler: (() => void) | undefined = undefined;
      let cellClassName = `row-${r} col-${c} `;

      // Find if there's a fruit in this cell
      const fruitInCell = fruits.find((fruit) => fruit.row === r && fruit.col === c);

      if (c === maxX) {
        // Right hand vertical number line
        cellContent = r; // Display the row number
        if (nextNumberToHighlight !== null && r <= nextNumberToHighlight) {
          // Highlight up to currentCount, and the next one
          cellClassName += ' text-green-400 font-bold'; // Highlight next to count
        } else {
          cellClassName += ' text-gray-700'; // Uncounted numbers
        }
        console.log(`CountGrid (num line): r=${r}, c=${c}, cellContent=${cellContent}, cellClassName=${cellClassName}`);
      } else {
        // Grid area for fruits
        if (fruitInCell) {
          console.log(
            `CountGrid (fruit): r=${r}, c=${c}, fruit=${fruitInCell.type}, isCounted=${fruitInCell.isCounted}, selected=${selectedFruitId === fruitInCell.id}`
          );
          cellContent = fruitInCell.type.icon;
          cellClassName += ` text-4xl sm:text-5xl `; // Styling for fruit emoji
          if (fruitInCell.id === selectedFruitId) {
            // Highlight the currently selected fruit
            cellClassName += ' ring-2 ring-blue-400 ring-offset-2 ring-offset-black '; // Example highlight style
          } else if (fruitInCell.isCounted) {
            cellClassName += ' opacity-50 '; // Dim counted fruits
          } else {
            onClickHandler = () => onFruitClick(fruitInCell.id, currentCount + 1); // Pass next expected count
            cellClassName += ' cursor-pointer hover:bg-gray-800 ';
          }
          console.log(`CountGrid (fruit): r=${r}, c=${c}, cellContent=${cellContent}, cellClassName=${cellClassName}`);
        } else {
          // Empty cell in fruit area
          console.log(`CountGrid (empty): r=${r}, c=${c}, cellContent=${cellContent}, cellClassName=${cellClassName}`);
        }
      }

      // Border logic (no border for fruit cells, border for number line)
      const border = c === maxX ? 'adder-cell-border' : 'border-none';

      rowElements.push(
        <SquareCellComponent
          key={cellKey}
          actualValue={cellContent as string}
          onClick={onClickHandler}
          borderClasses={border} // Use defined border logic
          mode={mode}
          baseSizeClasses="aspect-square"
          className={cellClassName} // Use the constructed className
        />
      );
    }
  }

  // useEffect for animation trigger
  useEffect(() => {
    if (selectedFruitId) {
      // Simplified condition for animation trigger
      const selectedFruit = fruits.find((f) => f.id === selectedFruitId);
      if (!selectedFruit) return;

      const fruitCoords = getCellCoordinates(selectedFruit.row, selectedFruit.col);
      // Target number is currentCount, in the maxX column
      const targetNumberCoords = getCellCoordinates(currentCount, maxX);

      if (fruitCoords && targetNumberCoords) {
        setAnimatingLine({
          x1: fruitCoords.x,
          y1: fruitCoords.y,
          x2: targetNumberCoords.x,
          y2: targetNumberCoords.y,
        });
        setAnimationProgress(0); // Reset animation

        startTimeRef.current = performance.now();
        const animate = (currentTime: DOMHighResTimeStamp) => {
          if (!startTimeRef.current) startTimeRef.current = currentTime;
          const elapsedTime = currentTime - startTimeRef.current;
          const progress = Math.min(elapsedTime / ANIMATION_DURATION, 1);
          setAnimationProgress(progress);

          if (progress < 1) {
            animationRef.current = requestAnimationFrame(animate);
          } else {
            // Animation complete
            setAnimatingLine(null); // Clear line
            onNumberHighlight(currentCount); // Highlight the number
            startTimeRef.current = null; // Reset startTime
          }
        };
        animationRef.current = requestAnimationFrame(animate);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [selectedFruitId, fruits, getCellCoordinates, onNumberHighlight, maxX, maxY, currentCount]);

  return (
    <div
      ref={gridRef} // Attach ref here
      className="grid bg-black/60 select-none w-full grid-no-gap"
      style={{
        gridTemplateColumns: `${HEADER_DIM} repeat(${maxX}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${maxY}, auto) ${HEADER_DIM}`,
      }}
      role="grid"
      aria-rowcount={maxY + 1}
      aria-colcount={maxX + 1}
    >
      {rowElements}
      {/* SVG for animation */}
      {animatingLine && (
        <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
          <line
            x1={animatingLine.x1}
            y1={animatingLine.y1}
            x2={animatingLine.x1 + (animatingLine.x2 - animatingLine.x1) * animationProgress}
            y2={animatingLine.y1 + (animatingLine.y2 - animatingLine.y1) * animationProgress}
            stroke="green"
            strokeWidth="2"
          />
        </svg>
      )}

      <SquareCellComponent
        actualValue="0"
        onClick={onReset}
        isHeader={true}
        mode={mode}
        borderClasses="bg-black/10"
        baseSizeClasses="w-full h-full"
        className="text-transparent"
        style={{ width: HEADER_DIM, height: HEADER_DIM }}
      />

      {/* Bottom Headers (mostly empty for counting) */}
      {Array.from({ length: maxX }, (_, i) => i + 1).map((num) => {
        const cellKey = `header-bottom-${num}`;
        return (
          <SquareCellComponent
            key={cellKey}
            actualValue=""
            isHeader
            isBottomHeader
            mode={mode}
            borderClasses="border-t border-white/30"
            baseSizeClasses="w-full h-full"
          />
        );
      })}
    </div>
  );
};
