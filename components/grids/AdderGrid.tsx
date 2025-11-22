import React, { useState, useRef, useCallback } from 'react';
import { SquareCellComponent } from '../CellComponent';
import { HEADER_DIM } from '../../utils/constants'; // Import constant

interface AdderGridProps {
  mode: 'adder'; // This component only handles adder mode
  onReset: () => void;
  adderValues?: { red: number | null; green: number | null; blue: number | null };
  onAdderChange?: (color: 'red' | 'green' | 'blue', value: number) => void;
}

export const AdderGrid: React.FC<AdderGridProps> = ({ mode, onReset, adderValues, onAdderChange }) => {
  const maxX = 10;
  const maxY = 30; // Adder mode always has maxY = 30

  const [hoveredCellKey, setHoveredCellKey] = useState<string | null>(null);
  const [isSumColumnShifted, setIsSumColumnShifted] = useState(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback((key: string) => setHoveredCellKey(key), []);
  const handleMouseLeaveGrid = useCallback(() => setHoveredCellKey(null), []);

  const handleMouseDownSumCol = useCallback(() => {
    holdTimerRef.current = setTimeout(() => {
      setIsSumColumnShifted(true);
    }, 500);
  }, []);

  const handleMouseUpSumCol = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (isSumColumnShifted) {
      setIsSumColumnShifted(false);
    }
  }, [isSumColumnShifted]);

  const isOdd = (n: number) => n % 2 !== 0;
  const RED_COL = 2;
  const GREEN_COL = 4;
  const BLUE_COL = 6;
  const SUM_COL = 10;

  const rowElements = [];
  for (let r = maxY; r >= 1; r--) {
    const headerKey = `header-left-${r}`;
    const headerVal = r; // Left header is just row number for adder mode

    rowElements.push(
      <SquareCellComponent
        key={headerKey}
        content={headerVal}
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
      let cellAdderColor: 'red' | 'green' | 'blue' | undefined = undefined;
      let onClickHandler: (() => void) | undefined = undefined;

      const rVal = adderValues?.red || 0;
      const gVal = adderValues?.green || 0;
      const bVal = adderValues?.blue || 0;

      if (c === RED_COL) {
        if (r <= 10) {
          if (r <= rVal) {
            cellContent = r;
            cellAdderColor = 'red';
          }
          onClickHandler = () => onAdderChange && onAdderChange('red', r);
        }
      } else if (c === GREEN_COL) {
        if (r <= 10) {
          if (r <= gVal) {
            cellContent = r;
            cellAdderColor = 'green';
          }
          onClickHandler = () => onAdderChange && onAdderChange('green', r);
        }
      } else if (c === BLUE_COL) {
        if (r <= 10) {
          if (r <= bVal) {
            cellContent = r;
            cellAdderColor = 'blue';
          }
          onClickHandler = () => onAdderChange && onAdderChange('blue', r);
        }
      } else if (c === SUM_COL) {
        const total = rVal + gVal + bVal;
        if (r <= total) {
          cellContent = r;
          if (r <= rVal) {
            cellAdderColor = 'red';
          } else if (r <= rVal + gVal) {
            cellAdderColor = 'green';
          } else {
            cellAdderColor = 'blue';
          }
        } else if (r <= maxY) {
          cellContent = r;
          cellAdderColor = 'darkgrey';
        }
      }

      if (isOdd(c) || c === 8) {
        rowElements.push(
          <SquareCellComponent
            key={cellKey}
            content=""
            actualValue=""
            isHovered={false}
            borderClasses=""
            mode={mode}
            baseSizeClasses="aspect-square"
            className="adder-cell-no-border"
          />
        );
      } else {
        const isInputSlot = (c === RED_COL || c === GREEN_COL || c === BLUE_COL) && r <= 10;
        const border = isInputSlot || c === SUM_COL ? 'adder-cell-border' : 'border-none';

        const cellStyle: React.CSSProperties = {};
        if (isSumColumnShifted) {
          if (c === GREEN_COL && r <= gVal) {
            cellStyle.transform = `translate3d(0, calc(-1 * ${rVal} * 105%), 0)`;
          } else if (c === BLUE_COL && r <= bVal) {
            cellStyle.transform = `translate3d(0, calc(-1 * ${rVal + gVal} * 105%), 0)`;
          }
        }

        rowElements.push(
          <SquareCellComponent
            key={cellKey}
            content={cellContent}
            actualValue={cellContent as string}
            isHovered={isInputSlot && hoveredCellKey === cellKey}
            onMouseEnter={() => isInputSlot && handleMouseEnter(cellKey)}
            onClick={onClickHandler}
            onCellMouseDown={c === SUM_COL ? handleMouseDownSumCol : undefined}
            onCellMouseUp={c === SUM_COL ? handleMouseUpSumCol : undefined}
            onTouchStart={c === SUM_COL ? handleMouseDownSumCol : undefined}
            onTouchEnd={c === SUM_COL ? handleMouseUpSumCol : undefined}
            adderColor={cellAdderColor}
            borderClasses={border}
            mode={mode}
            baseSizeClasses="aspect-square"
            className={`row-${r} col-${c} ${isInputSlot ? 'hover:bg-gray-800' : ''}`}
            style={cellStyle}
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
        content="0"
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

      {Array.from({ length: maxX }, (_, i) => i + 1).map((num) => {
        const cellKey = `header-bottom-${num}`;
        let content: string | number = '';
        let color: 'red' | 'green' | 'blue' | 'darkgrey' | undefined = undefined;
        if ([3, 5].includes(num)) {
          content = '+';
          color = 'darkgrey';
        }
        if (num === 9) {
          content = '=';
          color = 'darkgrey';
        }
        if (num === RED_COL) {
          content = adderValues?.red || 0;
          color = 'red';
        } else if (num === GREEN_COL) {
          content = adderValues?.green || 0;
          color = 'green';
        } else if (num === BLUE_COL) {
          content = adderValues?.blue || 0;
          color = 'blue';
        } else if (num === SUM_COL) {
          content = (adderValues?.red || 0) + (adderValues?.green || 0) + (adderValues?.blue || 0);
        }

        return (
          <SquareCellComponent
            key={cellKey}
            content={content}
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
