import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { GridMode } from '../../types';
import { SquareCellComponent } from '../CellComponent';
import { HEADER_DIM, YELLOW_HIGHLIGHT_DURATION_MS } from '../../utils/constants';

interface DiffGridProps {
  mode: '10' | 'decimal'; // This component only handles these modes for now
  selectedTop: number | null;
  selectedLeft: number | null;
  onSelectTop: (num: number) => void;
  onSelectLeft: (num: number) => void;
  onReset: () => void;
}

export const DiffGrid: React.FC<DiffGridProps> = ({
  mode,
  selectedTop,
  selectedLeft,
  onSelectTop,
  onSelectLeft,
  onReset,
}) => {
  const maxX = 10;
  const maxY = 20;

  const prevSelectedTopRef = useRef<number | null>(null);
  const prevSelectedLeftRef = useRef<number | null>(null);
  const [yellowHighlightedCells, setYellowHighlightedCells] = useState<Set<string>>(new Set());
  const yellowHighlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hoveredCellKey, setHoveredCellKey] = useState<string | null>(null);

  const handleMouseEnter = useCallback((key: string) => setHoveredCellKey(key), []);
  const handleMouseLeaveGrid = useCallback(() => setHoveredCellKey(null), []);

  const formatValue = useCallback(
    (val: number, operand1: number, operand2: number) => {
      let result;
      if (mode === 'decimal') {
        const decOperand1 = operand1 / 10; // Convert index to 0.x
        const decOperand2 = operand2 / 10; // Convert index to 0.x
        result = Math.abs(decOperand1 - decOperand2);
        return parseFloat(result.toFixed(2));
      }
      result = Math.abs(operand1 - operand2);
      return result;
    },
    [mode]
  );

  const formatHeader = useCallback(
    (val: number) => {
      if (mode === 'decimal') {
        return (val / 10).toFixed(1);
      }
      return val;
    },
    [mode]
  );

  useEffect(() => {
    if (yellowHighlightTimerRef.current) clearTimeout(yellowHighlightTimerRef.current);
    const newYellowCells = new Set<string>();
    let hasNewYellowCells = false;
    if (selectedTop !== null && selectedLeft !== null) {
      const prevTop = prevSelectedTopRef.current;
      const prevLeft = prevSelectedLeftRef.current;

      // The logic for highlighting is slightly different for diff as it's not a block
      // We will highlight cells that match either selectedTop or selectedLeft
      for (let r = 1; r <= maxY; r++) {
        for (let c = 1; c <= maxX; c++) {
          const cellKey = `cell-${r}-${c}`;

          const isCurrentlyActive = (r === selectedLeft || c === selectedTop);

          let wasPreviouslyActive = false;
          if (prevTop !== null && prevLeft !== null) {
              wasPreviouslyActive = (r === prevLeft || c === prevTop);
          }

          if (isCurrentlyActive && !wasPreviouslyActive) {
            newYellowCells.add(cellKey);
            hasNewYellowCells = true;
          }
        }
      }
    }
    if (hasNewYellowCells) {
      setYellowHighlightedCells(newYellowCells);
      yellowHighlightTimerRef.current = setTimeout(
        () => setYellowHighlightedCells(new Set()),
        YELLOW_HIGHLIGHT_DURATION_MS
      );
    } else if (selectedTop === null && selectedLeft === null) {
      setYellowHighlightedCells(new Set());
    }
    prevSelectedTopRef.current = selectedTop;
    prevSelectedLeftRef.current = selectedLeft;
    return () => {
      if (yellowHighlightTimerRef.current) clearTimeout(yellowHighlightTimerRef.current);
    };
  }, [selectedTop, selectedLeft, mode, maxX, maxY]);

  // Effect to reset yellow highlight and hovered state when mode changes
  useEffect(() => {
    prevSelectedTopRef.current = null;
    prevSelectedLeftRef.current = null;
    setYellowHighlightedCells(new Set());
    if (yellowHighlightTimerRef.current) clearTimeout(yellowHighlightTimerRef.current);
    setHoveredCellKey(null);
  }, [mode]);

  const getCellBorderClasses = useCallback((rowNum: number, colNum: number, isYellow: boolean): string => {
    if (rowNum === 0 || colNum === 0) return '';
    if (isYellow) return 'border-t border-l border-yellow-500/80';

    const baseBorderColor = 'border-white';
    const topBorderClass = `border-t ${baseBorderColor}/30`;
    const leftBorderClass = `border-l ${baseBorderColor}/30`;
    return `${topBorderClass} ${leftBorderClass}`.trim();
  }, []);

  const isSelectionActive = selectedTop !== null || selectedLeft !== null;
  const cornerCellKey = 'header-corner-0';

  const rowElements = [];
  for (let r = maxY; r >= 1; r--) {
    const headerKey = `header-left-${r}`;
    const headerVal = formatHeader(r);

    const isHeaderDimmed = isSelectionActive;

    rowElements.push(
      <SquareCellComponent
        key={headerKey}
        actualValue={headerVal}
        isHovered={hoveredCellKey === headerKey}
        onMouseEnter={() => handleMouseEnter(headerKey)}
        onClick={() => onSelectLeft(r)}
        isHeader
        isLeftHeader
        isSelected={selectedLeft === r}
        mode={mode}
        borderClasses=""
        baseSizeClasses="w-full h-full"
        isDimmed={isHeaderDimmed}
      />
    );

    for (let c = 1; c <= maxX; c++) {
      const cellKey = `cell-${r}-${c}`;

      const isGreenHighlighted = selectedTop !== null && selectedLeft !== null && (r === selectedLeft || c === selectedTop);
      const isYellow = yellowHighlightedCells.has(cellKey);
      const isMaxValueCell = (selectedTop !== null && c === selectedTop) && (selectedLeft !== null && r === selectedLeft);
      const isDimmed = isSelectionActive && !isGreenHighlighted && !isMaxValueCell;


      let cellValue: string | number = '';
      if (isGreenHighlighted || isYellow) {
        cellValue = formatValue(0, r, c); // 0 is dummy value
      }

      const isFirstSelRow = selectedLeft !== null && r === selectedLeft;
      const isLastSelRow = selectedLeft !== null && r === selectedLeft; // For diff, only highlight the exact row/col
      const isFirstSelCol = selectedTop !== null && c === selectedTop;
      const isLastSelCol = selectedTop !== null && c === selectedTop; // For diff, only highlight the exact row/col


      let borderClasses = getCellBorderClasses(r, c, isYellow);
      if (isFirstSelRow && isGreenHighlighted) {
        borderClasses = `${borderClasses} border-t border-green-400`.trim();
      }
      if (isFirstSelCol && isGreenHighlighted) {
          borderClasses = `${borderClasses} border-l border-green-400`.trim();
      }
      if (isLastSelRow && isGreenHighlighted) {
        borderClasses = `${borderClasses} border-b border-green-400`.trim();
      }
      if (isLastSelCol && isGreenHighlighted) {
        borderClasses = `${borderClasses} border-r border-green-400`.trim();
      }


      rowElements.push(
        <SquareCellComponent
          key={cellKey}
          actualValue={cellValue}
          isHovered={hoveredCellKey === cellKey}
          onMouseEnter={() => handleMouseEnter(cellKey)}
          isHighlightedGreen={isGreenHighlighted}
          isChangeHighlightedYellow={isYellow}
          borderClasses={borderClasses}
          mode={mode}
          baseSizeClasses="aspect-square"
          className={`row-${r} col-${c}`}
          isFirstSelectedRow={isFirstSelRow}
          isLastSelRow={isLastSelRow}
          isFirstSelectedCol={isFirstSelCol}
          isLastSelCol={isLastSelCol}
          isMaxValueCell={isMaxValueCell}
          isDimmed={isDimmed}
        />
      );
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
        isHovered={hoveredCellKey === cornerCellKey}
        onMouseEnter={() => handleMouseEnter(cornerCellKey)}
        onClick={onReset}
        isHeader={true}
        mode={mode}
        borderClasses="bg-black/10"
        baseSizeClasses="w-full h-full"
        style={{ width: HEADER_DIM, height: HEADER_DIM }}
        isDimmed={isSelectionActive}
      />

      {/* Bottom Headers */}
      {Array.from({ length: maxX }, (_, i) => i + 1).map((num) => {
        const cellKey = `header-bottom-${num}`;
        const isDimmed = isSelectionActive;
        const borderClasses = 'border-t border-white/30';
        const headerVal = formatHeader(num);
        return (
          <SquareCellComponent
            key={cellKey}
            actualValue={headerVal}
            isHovered={hoveredCellKey === cellKey}
            onMouseEnter={() => handleMouseEnter(cellKey)}
            onClick={() => onSelectTop(num)}
            isHeader
            isBottomHeader
            isSelected={selectedTop === num}
            mode={mode}
            borderClasses={borderClasses}
            baseSizeClasses="w-full h-full"
            isDimmed={isDimmed}
          />
        );
      })}
    </div>
  );
};