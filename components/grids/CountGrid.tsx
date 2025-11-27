import React, { useState, useCallback, useEffect, useRef } from 'react';
import { SquareCellComponent } from '../CellComponent';
import { HEADER_DIM } from '../../utils/constants';
import type { GridMode, Fruit, Line } from '../../types'; // Import Line

interface CountGridProps {
  mode: GridMode;
  onReset: () => void;
  fruits: Fruit[];
  selectedFruitId: string | null;
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

  const [fruitRects, setFruitRects] = useState<{ [id: string]: DOMRect }>({});
  const [numberRects, setNumberRects] = useState<{ [row: number]: DOMRect }>({});

  // Constants for animation
  const ANIMATION_DURATION = 500; // 0.5 seconds

  const handleCellMeasure = useCallback(
    (row: number, col: number, rect: DOMRect) => {
      // For fruits (content cells)
      if (col < maxX) {
        // Find the fruit at this position
        const fruitInCell = fruits.find((f) => f.row === row && f.col === col);
        if (fruitInCell) {
          setFruitRects((prev) => ({ ...prev, [fruitInCell.id]: rect }));
        }
      } else if (col === maxX) {
        // For number line cells
        setNumberRects((prev) => ({ ...prev, [row]: rect }));
      }
    },
    [fruits, maxX]
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
        row={r} // Pass row
        col={0} // Left header column is 0
        onMeasure={handleCellMeasure}
      />
    );

    for (let c = 1; c <= maxX; c++) {
      const cellKey = `cell-${r}-${c}`;
      let cellContent: React.ReactNode = '';
      let subContent: React.ReactNode = null; // Declare subContent here
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
          cellClassName += ' text-gray-800 opacity-[0.2]'; // Uncounted numbers, 80% transparent
        }
      } else {
        // Grid area for fruits
                            if (fruitInCell) {
                              cellContent = fruitInCell.type.icon;
                              cellClassName += ` text-4xl sm:text-5xl `; // Styling for fruit emoji
                              onClickHandler = () => onFruitClick(fruitInCell.id, currentCount + 1); // Always clickable if not counted
                              cellClassName += ' cursor-pointer hover:bg-gray-800 '; // Always show hover if clickable
                  
                                          if (fruitInCell.isCounted) {
                                            // If fruit is counted, dim it and show its count value
                                            cellClassName += ' opacity-[0.2] '; // 80% transparent for counted
                                            subContent = fruitInCell.countValue;
                                          } else if (fruitInCell.id === selectedFruitId) {
                                            // If it's the currently selected fruit and not yet counted, it should be bright and highlighted
                                            // It's already bright by default (no opacity-50 applied in this branch)
                                            cellClassName += ' ring-2 ring-blue-400 ring-offset-2 ring-offset-black ';
                                            subContent = currentCount;
                                          } else {
                                            // This fruit is NOT selected, and NOT counted. It should be dim.
                                            cellClassName += ' opacity-[0.2] '; // 80% transparent for unselected/uncounted
                                          }                            } else {          // Empty cell in fruit area
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
          subContent={subContent} // Pass subContent here
          row={r} // Pass row
          col={c} // Pass col
          onMeasure={handleCellMeasure}
        />
      );
    }
  }

  // useEffect for animation trigger
  useEffect(() => {
    if (selectedFruitId && currentCount > 0) {
      // Ensure currentCount is updated before animating
      const selectedFruit = fruits.find((f) => f.id === selectedFruitId);
      if (!selectedFruit) return;

      const fruitRect = fruitRects[selectedFruit.id];
      const numberRect = numberRects[currentCount];

      if (fruitRect && numberRect) {
        const newLine: Line = {
          x1: fruitRect.right, // Center of fruit
          y1: fruitRect.top - fruitRect.height / 2, // Center of fruit
          x2: numberRect.left - numberRect.width / 2, // Left edge of number cell
          y2: numberRect.top - numberRect.height / 2, // Center of number
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
  }, [selectedFruitId, fruits, onLineComplete, maxX, maxY, currentCount, fruitRects, numberRects, handleCellMeasure]); // Added rects to dependencies

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
            stroke="#0d05"
            strokeWidth="4"
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
        row={0}
        col={0} // Pass row and col for the 0 cell
        onMeasure={handleCellMeasure}
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
            row={0}
            col={num} // Pass row and col for bottom headers
            onMeasure={handleCellMeasure}
          />
        );
      })}
    </div>
  );
};
