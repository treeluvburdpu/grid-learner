import React, { useState, useCallback, useEffect, useRef } from 'react';
import { SquareCellComponent } from '../CellComponent';
import { HEADER_DIM } from '../../utils/constants';
import type { GridMode, Fruit, Line } from '../../types'; // Import Line

interface CountGridProps {
  mode: GridMode;
  onReset: () => void;
  fruits: Fruit[];
  selectedFruitId: string | null;
  nextNumberToHighlight: number | null;
  currentCount: number;
  onFruitClick: (id: string, value: number) => void;
  onLineComplete: (line: Line, highlightedNumber: number) => void; // New prop
  completedLines: Line[]; // New prop
}

export const CountGrid: React.FC<CountGridProps> = ({
  mode,
  onReset,
  fruits,
  selectedFruitId,
  nextNumberToHighlight,
  currentCount,
  onFruitClick,
  onLineComplete, // Destructure new prop
  completedLines, // Destructure new prop
}) => {
  const maxX = 20; // Max X for grid content (excluding left header, including right number line)
  const maxY = 20; // Max Y for grid content

  const [animatingLine, setAnimatingLine] = useState<Line | null>(null); // Use Line type
  const [animationProgress, setAnimationProgress] = useState<number>(0); // 0 to 1 for line animation
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null); // New ref for the grid container

  // Constants for animation
  const ANIMATION_DURATION = 500; // 0.5 seconds

  // Utility to get HEADER_DIM in pixels
  const getHeaderDimInPx = useCallback(() => {
    // We assume HEADER_DIM is in 'rem'. Convert it to pixels using root font size.
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    return parseFloat(HEADER_DIM) * rootFontSize;
  }, []);

  // Function to get absolute pixel coordinates of a cell
  const getCellCoordinates = useCallback(
    (r: number, c: number) => {
      const gridRect = gridRef.current?.getBoundingClientRect();
      if (!gridRect) return null;

      const headerDimPx = getHeaderDimInPx();

      // Calculate actual pixel size of a dynamic cell
      const actualCellWidth = (gridRect.width - headerDimPx) / maxX;
      const actualCellHeight = (gridRect.height - headerDimPx) / maxY;

      // Convert row/col to pixel coordinates (center of the cell)
      // Adjust for left header (headerDimPx)
      const x = gridRect.left + headerDimPx + (c - 1) * actualCellWidth + actualCellWidth / 2;
      const y =
        gridRect.top + (maxY - r) * actualCellHeight + actualCellHeight / 2;

      return { x, y };
    },
    [maxX, maxY, getHeaderDimInPx] // Depend on maxX, maxY, and getHeaderDimInPx
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
        if (r <= currentCount) {
          cellClassName += ' text-green-400 font-bold'; // Highlight counted numbers
        } else {
          cellClassName += ' text-gray-700'; // Uncounted numbers
        }
      } else {
        // Grid area for fruits
        if (fruitInCell) {
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
        } else {
          // Empty cell in fruit area
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
    if (selectedFruitId && currentCount > 0) { // Ensure currentCount is updated before animating
      const selectedFruit = fruits.find((f) => f.id === selectedFruitId);
      if (!selectedFruit) return;

      const fruitCoords = getCellCoordinates(selectedFruit.row, selectedFruit.col);
      const targetNumberCoords = getCellCoordinates(currentCount, maxX); // Target is currentCount

      if (fruitCoords && targetNumberCoords) {
        const newLine: Line = {
          x1: fruitCoords.x,
          y1: fruitCoords.y,
          x2: targetNumberCoords.x,
          y2: targetNumberCoords.y,
        };
        setAnimatingLine(newLine);
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
            onLineComplete(newLine, currentCount); // Pass the completed line and the number it points to
            setAnimatingLine(null); // Clear the animating line
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
  }, [selectedFruitId, fruits, getCellCoordinates, onLineComplete, maxX, maxY, currentCount]); // Add onLineComplete to dependencies

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
      {/* SVG for completed lines */}
      <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
        {completedLines.map((line, index) => (
          <line
            key={`completed-line-${index}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="green"
            strokeWidth="2"
          />
        ))}
      </svg>
      {/* SVG for animating line */}
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
