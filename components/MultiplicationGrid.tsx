import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { GridMode } from '../types';

// Shared constants for styling
const TEXT_SIZE_MODE_10_HEADER = "text-lg sm:text-xl";
const TEXT_SIZE_MODE_100_HEADER = "text-base";
const TEXT_SIZE_MODE_100_DATA = "text-xs";

const HEADER_DIM_MODE_10 = '3rem'; 
const HEADER_DIM_MODE_100 = '1.75rem'; 

const YELLOW_HIGHLIGHT_DURATION_MS = 2000;

interface CellProps {
  content: React.ReactNode;
  actualValue: number | string;
  isHovered: boolean;
  className?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isHeader?: boolean;
  isSelected?: boolean;
  isHighlightedGreen?: boolean;
  isChangeHighlightedYellow?: boolean;
  borderClasses: string;
  mode: GridMode;
  baseSizeClasses?: string;
  style?: React.CSSProperties;
  isBottomHeader?: boolean;
  isLeftHeader?: boolean;
  maxX?: number;
  maxY?: number;
  isFirstSelectedRow?: boolean;
  isLastSelectedRow?: boolean;
  isFirstSelectedCol?: boolean;
  isLastSelectedCol?: boolean;
  isMaxValueCell?: boolean;
  isDimmed?: boolean;
}

const CellComponent: React.FC<CellProps> = React.memo(({
  content, actualValue, isHovered,
  className, onClick, onMouseEnter, onMouseLeave,
  isHeader, isSelected, isHighlightedGreen, isChangeHighlightedYellow,
  borderClasses, mode, baseSizeClasses, style,
  isBottomHeader, isLeftHeader, maxX, maxY,
  isFirstSelectedRow, isLastSelectedRow, isFirstSelectedCol, isLastSelectedCol,
  isMaxValueCell, isDimmed
}) => {
  let effectiveDisplayContent: React.ReactNode = "";
  let textStyleClass = "";
  let bgClass = "bg-transparent";
  let interactiveClasses = onClick ? "cursor-pointer" : "";
  let ariaLabel = "";

  const headerTextSize = mode === '10' ? TEXT_SIZE_MODE_10_HEADER : TEXT_SIZE_MODE_100_HEADER;

  // Font size calculator for data cells
  const getDataFontSize = (val: number | string, currentMode: GridMode) => {
    if (currentMode === '100') return TEXT_SIZE_MODE_100_DATA;
    
    const numVal = Number(val);
    if (isNaN(numVal)) return "text-xs"; // Fallback

    if (numVal < 10) {
      return "text-4xl sm:text-5xl"; // Base size for 1 digit
    } else if (numVal < 100) {
      return "text-2xl sm:text-4xl"; // ~30% smaller for 2 digits
    } else {
      return "text-lg sm:text-2xl"; // Another ~30% smaller for 3 digits
    }
  };

  if (isHeader) {
    textStyleClass = `${headerTextSize} text-cyan-400 font-bold`;
    let displayHeaderValue: string | number = "";
    const num = Number(actualValue);

    if (mode === '10' || actualValue === "0") {
      displayHeaderValue = actualValue;
    } else { // mode === '100'
      const maxVal = isBottomHeader ? maxX! : maxY!;
      const shouldShowByDefault = num % 10 === 0 || num === 1 || num === maxVal;
      if (shouldShowByDefault || isSelected) {
        displayHeaderValue = actualValue;
      }
      if (isHovered && displayHeaderValue === "" && !isSelected) {
        displayHeaderValue = actualValue;
        textStyleClass = `${headerTextSize} text-cyan-300 font-bold`;
      }
    }
    effectiveDisplayContent = displayHeaderValue;
     if (isSelected && displayHeaderValue !== "") {
        textStyleClass = `${headerTextSize} text-cyan-400 font-bold`;
    }

    bgClass = isSelected ? "bg-gray-700/60" : "hover:bg-gray-700/50";
    if (isSelected) style = { ...style, boxShadow: '0 0 0 1px #60a5fa', outline: '1px solid #60a5fa' };
    ariaLabel = actualValue === "0" ? `Reset selection` : `Select ${actualValue}`;

  } else { // Data cell
    
    const dataTextSize = getDataFontSize(actualValue, mode);

    textStyleClass = `${dataTextSize} font-bold leading-none`;
    if (isChangeHighlightedYellow) {
      effectiveDisplayContent = actualValue;
      textStyleClass += ` text-yellow-500`;
      bgClass = isHighlightedGreen ? "bg-green-700/40" : "bg-yellow-800/30";
      ariaLabel = `Value ${actualValue}, changing`;
    } else if (isHighlightedGreen) {
      bgClass = "bg-green-700/40";
      ariaLabel = `Value ${actualValue}`;
      if (mode === '10') {
        effectiveDisplayContent = actualValue;
        textStyleClass += ` text-green-300`;
      } else {
        const showIn100xGreen = isHovered || isFirstSelectedCol || isLastSelectedCol || isFirstSelectedRow || isLastSelectedRow;
        if (showIn100xGreen) {
          effectiveDisplayContent = actualValue;
          textStyleClass += ` text-green-300`;
        } else {
          effectiveDisplayContent = "";
          textStyleClass += ` text-transparent`;
        }
      }
    } else {
      effectiveDisplayContent = "";
      textStyleClass += ` text-transparent`;
      ariaLabel = 'Grid cell';
    }
  }
  
  const cellFlexStyles = "flex items-center justify-center";
  const paddingClass = "p-0"; 

  const finalStyle = {...style};
  if (isMaxValueCell) {
    finalStyle.outline = '2px solid #22c55e';
    finalStyle.outlineOffset = '-2px';
  }

  const opacityClass = isDimmed ? 'opacity-75' : 'opacity-100';

  return (
    <div
      className={`${cellFlexStyles} ${baseSizeClasses || 'w-full h-full'} ${textStyleClass} ${bgClass} ${paddingClass} ${borderClasses} ${interactiveClasses} ${className || ''} overflow-visible transition-opacity duration-300 ${opacityClass}`}
      style={finalStyle}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role={onClick ? "button" : "gridcell"}
      tabIndex={onClick ? 0 : -1}
      aria-pressed={isHeader && isSelected ? true : undefined}
      aria-label={isHeader ? ariaLabel : (isHighlightedGreen || isChangeHighlightedYellow ? `Value ${actualValue}` : `Cell`)}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }} : undefined}
    >
      {effectiveDisplayContent !== "" && effectiveDisplayContent !== null ? String(effectiveDisplayContent) : <span className="sr-only">Empty</span>}
    </div>
  );
});
CellComponent.displayName = 'CellComponent';


interface MultiplicationGridProps {
  mode: GridMode;
  selectedTop: number | null;
  selectedLeft: number | null;
  onSelectTop: (num: number) => void;
  onSelectLeft: (num: number) => void;
  onReset: () => void;
}

export const MultiplicationGrid: React.FC<MultiplicationGridProps> = ({
  mode,
  selectedTop,
  selectedLeft,
  onSelectTop,
  onSelectLeft,
  onReset,
}) => {
  const maxX = mode === '10' ? 10 : 100;
  const maxY = mode === '10' ? 20 : (mode === '100' ? 100 : 200);

  const prevSelectedTopRef = useRef<number | null>(null);
  const prevSelectedLeftRef = useRef<number | null>(null);
  const [yellowHighlightedCells, setYellowHighlightedCells] = useState<Set<string>>(new Set());
  const yellowHighlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hoveredCellKey, setHoveredCellKey] = useState<string | null>(null);

  const handleMouseEnter = useCallback((key: string) => setHoveredCellKey(key), []);
  const handleMouseLeaveGrid = useCallback(() => setHoveredCellKey(null), []);

  useEffect(() => {
    if (yellowHighlightTimerRef.current) clearTimeout(yellowHighlightTimerRef.current);
    const newYellowCells = new Set<string>();
    let hasNewYellowCells = false;
    if (selectedTop !== null && selectedLeft !== null) {
      const prevTop = prevSelectedTopRef.current;
      const prevLeft = prevSelectedLeftRef.current;

      for (let r = 1; r <= selectedLeft; r++) {
        for (let c = 1; c <= selectedTop; c++) {
          const cellKey = `cell-${r}-${c}`;
          const currentValue = (r - 1) * selectedTop + c;
          
          let previousValue: number | null = null;
          if (prevTop !== null && prevLeft !== null && r <= prevLeft && c <= prevTop) {
            previousValue = (r - 1) * prevTop + c;
          }

          if (previousValue === null || currentValue !== previousValue) {
            newYellowCells.add(cellKey);
            hasNewYellowCells = true;
          }
        }
      }
    }
    if (hasNewYellowCells) {
      setYellowHighlightedCells(newYellowCells);
      yellowHighlightTimerRef.current = setTimeout(() => setYellowHighlightedCells(new Set()), YELLOW_HIGHLIGHT_DURATION_MS);
    } else if (selectedTop === null || selectedLeft === null) {
      setYellowHighlightedCells(new Set());
    }
    prevSelectedTopRef.current = selectedTop;
    prevSelectedLeftRef.current = selectedLeft;
    return () => { if (yellowHighlightTimerRef.current) clearTimeout(yellowHighlightTimerRef.current); };
  }, [selectedTop, selectedLeft]);

  useEffect(() => {
    prevSelectedTopRef.current = null;
    prevSelectedLeftRef.current = null;
    setYellowHighlightedCells(new Set());
    if (yellowHighlightTimerRef.current) clearTimeout(yellowHighlightTimerRef.current);
    setHoveredCellKey(null);
  }, [mode]);

  const getCellBorderClasses = (rowNum: number, colNum: number, currentMode: GridMode, isYellow: boolean): string => {
    if (currentMode === '100') return "";

    if (rowNum === 0 || colNum === 0) return ""; 
    if (isYellow) return "border-t border-l border-yellow-500/80";
    
    const baseBorderColor = "border-white";
    let topBorderClass = `border-t ${baseBorderColor}/30`;
    let leftBorderClass = `border-l ${baseBorderColor}/30`;
    return `${topBorderClass} ${leftBorderClass}`.trim();
  };

  const headerDim = mode === '10' ? HEADER_DIM_MODE_10 : HEADER_DIM_MODE_100;
  const isSelectionActive = selectedTop !== null && selectedLeft !== null;
  const cornerCellKey = "header-corner-0";
  
  // Loop for Rows: Render from maxY down to 1 to invert grid visually (Row 1 at bottom)
  const rowElements = [];
  for (let r = maxY; r >= 1; r--) {
    // Left Header for the current row
    const headerKey = `header-left-${r}`;
    const isHeaderDimmed = isSelectionActive;
    rowElements.push(
      <CellComponent key={headerKey} content={r} actualValue={r}
        isHovered={hoveredCellKey === headerKey} onMouseEnter={() => handleMouseEnter(headerKey)}
        onClick={() => onSelectLeft(r)} isHeader isLeftHeader maxY={maxY} isSelected={selectedLeft === r}
        mode={mode} borderClasses="" baseSizeClasses="w-full h-full" isDimmed={isHeaderDimmed} />
    );

    // Data Cells
    for (let c = 1; c <= maxX; c++) {
      const cellKey = `cell-${r}-${c}`;
      const isGreenHighlighted = selectedTop !== null && selectedLeft !== null && r <= selectedLeft && c <= selectedTop;
      const isYellow = yellowHighlightedCells.has(cellKey);
      const isMaxValueCell = selectedTop !== null && selectedLeft !== null && r === selectedLeft && c === selectedTop;
      const isDimmed = isSelectionActive && !isMaxValueCell;
      
      let cellValue: string | number = ""; 
      if ((isGreenHighlighted || isYellow) && selectedTop !== null) {
         cellValue = (r - 1) * selectedTop + c;
      }

      const isFirstSelRow = selectedLeft !== null && r === 1;
      const isLastSelRow = selectedLeft !== null && r === selectedLeft;
      const isFirstSelCol = selectedTop !== null && c === 1;
      const isLastSelCol = selectedTop !== null && c === selectedTop;

      let borderClasses = getCellBorderClasses(r, c, mode, isYellow);
      if (isLastSelCol && isGreenHighlighted) {
        borderClasses = `${borderClasses} border-r border-green-400`.trim();
      }

      rowElements.push(
        <CellComponent key={cellKey} content={cellValue} actualValue={cellValue}
          isHovered={hoveredCellKey === cellKey} onMouseEnter={() => handleMouseEnter(cellKey)}
          isHighlightedGreen={isGreenHighlighted} isChangeHighlightedYellow={isYellow}
          borderClasses={borderClasses}
          mode={mode} baseSizeClasses="aspect-square" 
          className={`row-${r} col-${c}`}
          isFirstSelectedRow={isFirstSelRow} isLastSelectedRow={isLastSelRow}
          isFirstSelectedCol={isFirstSelCol} isLastSelectedCol={isLastSelCol}
          isMaxValueCell={isMaxValueCell}
          isDimmed={isDimmed}
        />
      );
    }
  }

  return (
    <div
      className="grid bg-black/60 select-none w-full"
      style={{
        gridTemplateColumns: `${headerDim} repeat(${maxX}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${maxY}, auto) ${headerDim}`, // Rows first, then Header at bottom
      }}
      role="grid" aria-rowcount={maxY + 1} aria-colcount={maxX + 1}
      onMouseLeave={handleMouseLeaveGrid}
    >
      {/* Rows are pre-calculated to handle reverse order */}
      {rowElements}

      {/* Bottom Axis (was Top Headers) */}
      {/* Corner Cell */}
      <CellComponent 
          content="0" actualValue="0" isHovered={hoveredCellKey === cornerCellKey}
          onMouseEnter={() => handleMouseEnter(cornerCellKey)}
          onClick={onReset}
          isHeader={true}
          mode={mode}
          borderClasses={mode === '100' ? "" : "bg-black/10"}
          baseSizeClasses="w-full h-full"
          style={{width: headerDim, height: headerDim}}
          isDimmed={isSelectionActive}
      />
      
      {/* Bottom Headers */}
      {Array.from({ length: maxX }, (_, i) => i + 1).map(num => {
        const cellKey = `header-bottom-${num}`;
        const isDimmed = isSelectionActive;
        const borderClasses = mode === '10' ? "border-t border-white/30" : "";
        return <CellComponent key={cellKey} content={num} actualValue={num}
          isHovered={hoveredCellKey === cellKey} onMouseEnter={() => handleMouseEnter(cellKey)}
          onClick={() => onSelectTop(num)} isHeader isBottomHeader maxX={maxX} isSelected={selectedTop === num}
          mode={mode} borderClasses={borderClasses} baseSizeClasses="w-full h-full" isDimmed={isDimmed} />;
      })}

    </div>
  );
};