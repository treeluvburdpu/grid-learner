import React, { useRef, useLayoutEffect } from 'react';
import type { GridMode } from '../types';

interface SquareCellProps {
  actualValue: number | string;
  className?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onCellMouseDown?: (event: React.MouseEvent) => void;
  onCellMouseUp?: (event: React.MouseEvent) => void;
  onTouchStart?: (event: React.TouchEvent) => void;
  onTouchEnd?: (event: React.TouchEvent) => void;
  isHeader?: boolean;
  isSelected?: boolean;
  isHighlightedGreen?: boolean;
  isChangeHighlightedYellow?: boolean;
  borderClasses: string;
  mode: GridMode;
  style?: React.CSSProperties;
  isLeftHeader?: boolean;
  isMaxValueCell?: boolean;
  adderColor?: 'red' | 'green' | 'blue' | 'darkgrey' | 'mixed';
  subContent?: React.ReactNode; // New prop for sub-content (e.g., small number in corner)
  row?: number; // New prop
  col?: number; // New prop
  onMeasure?: (row: number, col: number, rect: DOMRect) => void; // New prop
}

const getDataFontSize = (val: number | string) => {
  const strVal = String(val);
  const len = strVal.length;

  if (len <= 1) {
    return 'text-4xl sm:text-5xl';
  } else if (len === 2) {
    return 'text-2xl sm:text-4xl';
  } else if (len === 3) {
    return 'text-lg sm:text-3xl';
  } else {
    return 'text-xs sm:text-xl';
  }
};

export const SquareCellComponent: React.FC<SquareCellProps> = React.memo(
  ({
    actualValue,
    className,
    onClick,
    onMouseEnter,
    onMouseLeave,
    onCellMouseDown,
    onCellMouseUp,
    onTouchStart,
    onTouchEnd,
    isHeader,
    isSelected,
    isHighlightedGreen,
    isChangeHighlightedYellow,
    borderClasses,
    mode,
    style,
    isLeftHeader,
    isMaxValueCell,
    adderColor,
    subContent, // Destructure new prop
    row, // Destructure new prop
    col, // Destructure new prop
    onMeasure, // Destructure new prop
  }) => {
    const cellRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
      if (cellRef.current && onMeasure && row !== undefined && col !== undefined) {
        onMeasure(row, col, cellRef.current.getBoundingClientRect());
      }
    }, [onMeasure, row, col]);

    const appliedClasses: string[] = ['grid-cell-base', 'relative', 'flex', 'items-center', 'justify-center'];
    let effectiveDisplayContent: React.ReactNode = '';
    const interactiveClasses = onClick ? 'cursor-pointer' : '';
    let ariaLabel = '';

    const dynamicTextSize = getDataFontSize(actualValue);
    appliedClasses.push(dynamicTextSize);
    appliedClasses.push('font-bold', 'leading-none'); // Apply default font-bold and leading-none for all content

    if (isHeader) {
      appliedClasses.push('cell-header-text');

      effectiveDisplayContent = actualValue;

      if (isLeftHeader && mode === 'adder') {
        appliedClasses.push('cell-content-transparent');
        ariaLabel = 'Hidden left header cell';
      }

      if (isSelected) {
        appliedClasses.push('cell-selected-bg');
        if (mode !== 'adder') {
          // Keep default blue highlight for non-adder modes
          appliedClasses.push('cell-selected-outline');
        }
      } else {
        appliedClasses.push('cell-hover-bg');
      }
      ariaLabel = actualValue === '0' ? `Reset selection` : `Select ${actualValue}`;
    } else {
      // Data cell
      if (adderColor) {
        effectiveDisplayContent = actualValue;
        appliedClasses.push('border'); // Adder cells always have a border
        if (adderColor === 'red') {
          appliedClasses.push('cell-mode-adder-red-bg', 'cell-mode-adder-red-text');
        } else if (adderColor === 'green') {
          appliedClasses.push('cell-mode-adder-green-bg', 'cell-mode-adder-green-text');
        } else if (adderColor === 'blue') {
          appliedClasses.push('cell-mode-adder-blue-bg', 'cell-mode-adder-blue-text');
        } else if (adderColor === 'mixed') {
          appliedClasses.push('cell-mode-adder-mixed-bg', 'cell-mode-adder-mixed-text');
        } else if (adderColor === 'darkgrey') {
          appliedClasses.push('cell-mode-adder-darkgrey-text');
        }
        // Remove existing border classes that start with 'border-' from borderClasses prop
        borderClasses = borderClasses
          .split(' ')
          .filter((c) => !c.startsWith('border-'))
          .join(' ');
      } else if (mode === 'diff') {
        effectiveDisplayContent = actualValue;
        appliedClasses.push('cell-mode-diff-text');
        ariaLabel = 'Grid cell';
      } else if (mode === 'counting' && actualValue !== '') {
        effectiveDisplayContent = actualValue;
        // Text color and aria-label will be handled by CountGrid via className
      } else if (isChangeHighlightedYellow) {
        effectiveDisplayContent = actualValue;
        appliedClasses.push('cell-highlight-yellow-text');
        if (isHighlightedGreen) {
          appliedClasses.push('cell-highlight-green-bg');
        } else {
          appliedClasses.push('cell-highlight-yellow-bg');
        }
        ariaLabel = `Value ${actualValue}, changing`;
      } else if (isHighlightedGreen) {
        appliedClasses.push('cell-highlight-green-bg', 'cell-highlight-green-text');
        ariaLabel = `Value ${actualValue}`;
        effectiveDisplayContent = actualValue;
      } else {
        effectiveDisplayContent = '';
        appliedClasses.push('cell-content-transparent');
        ariaLabel = 'Grid cell';
      }
    }

    if (isMaxValueCell) {
      appliedClasses.push('cell-max-value-outline');
    }

    // Combine all classes
    const finalClasses = [...appliedClasses, borderClasses, interactiveClasses, className || '']
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={cellRef} // Attach ref here
        className={finalClasses}
        style={style}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseDown={onCellMouseDown}
        onMouseUp={onCellMouseUp}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role={onClick ? 'button' : 'gridcell'}
        tabIndex={onClick ? 0 : -1}
        aria-pressed={isHeader && isSelected ? true : undefined}
        aria-label={
          isHeader
            ? ariaLabel
            : isHighlightedGreen || isChangeHighlightedYellow || adderColor
              ? `Value ${actualValue}`
              : `Cell`
        }
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
      >
        {subContent && (
          <div className="absolute top-0 right-0 cell-superscript font-bold px-0 py-0 leading-none">{subContent}</div>
        )}
        {effectiveDisplayContent !== '' && effectiveDisplayContent !== null ? (
          String(effectiveDisplayContent)
        ) : (
          <span className="sr-only">Empty</span>
        )}
      </div>
    );
  }
);
SquareCellComponent.displayName = 'SquareCellComponent';
