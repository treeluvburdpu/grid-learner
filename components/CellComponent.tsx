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
    baseSizeClasses?: string;
    style?: React.CSSProperties;
    isLeftHeader?: boolean;
    isMaxValueCell?: boolean;
    isDimmed?: boolean;
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
        baseSizeClasses,
        style,
        isLeftHeader,
        isMaxValueCell,
        isDimmed,
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

        let effectiveDisplayContent: React.ReactNode = '';
        let textStyleClass = '';
        let bgClass = 'bg-transparent';
        const interactiveClasses = onClick ? 'cursor-pointer' : '';
        let ariaLabel = '';

        const dynamicTextSize = getDataFontSize(actualValue);

        if (isHeader) {
            if (mode === 'adder' && adderColor) {
                if (adderColor === 'red') textStyleClass = `${dynamicTextSize} text-red-400 font-bold`;
                else if (adderColor === 'green') textStyleClass = `${dynamicTextSize} text-green-400 font-bold`;
                else if (adderColor === 'blue') textStyleClass = `${dynamicTextSize} text-blue-400 font-bold`;
                else if (adderColor === 'darkgrey') textStyleClass = `${dynamicTextSize} text-gray-700 font-bold`;
                else textStyleClass = `${dynamicTextSize} text-cyan-400 font-bold`;
            } else {
                textStyleClass = `${dynamicTextSize} text-cyan-400 font-bold`;
            }

            effectiveDisplayContent = actualValue;

            if (isLeftHeader && mode === 'adder') {
                textStyleClass += ' text-transparent';
                ariaLabel = 'Hidden left header cell';
            }

            if (isSelected && mode !== 'adder') {
                // Keep default blue highlight for non-adder modes
            }

            bgClass = isSelected ? 'bg-gray-700/60' : 'hover:bg-gray-700/50';
            if (isSelected) style = { ...style, boxShadow: '0 0 0 1px #60a5fa', outline: '1px solid #60a5fa' };
            ariaLabel = actualValue === '0' ? `Reset selection` : `Select ${actualValue}`;
        } else {
            // Data cell
            textStyleClass = `${dynamicTextSize} font-bold leading-none`;

            if (adderColor) {
                effectiveDisplayContent = actualValue;
                if (adderColor === 'red') {
                    bgClass = 'bg-red-900/40 border-red-500/30';
                    textStyleClass += ' text-red-400';
                } else if (adderColor === 'green') {
                    bgClass = 'bg-green-900/40 border-green-500/30';
                    textStyleClass += ' text-green-400';
                } else if (adderColor === 'blue') {
                    bgClass = 'bg-blue-900/40 border-blue-500/30';
                    textStyleClass += ' text-blue-400';
                } else if (adderColor === 'mixed') {
                    // Assuming 'mixed' could be a future state
                    bgClass = 'bg-purple-900/40 border-purple-500/30';
                    textStyleClass += ' text-purple-400';
                }
                borderClasses = `border ${borderClasses
                    .split(' ')
                    .filter((c) => !c.startsWith('border-'))
                    .join(' ')}`;
            } else if (mode === 'diff') {
                // Added for diff mode to show numbers even when not selected
                effectiveDisplayContent = actualValue;
                textStyleClass += ` text-gray-700`; // Prepopulate with dark grey numbers
                ariaLabel = 'Grid cell';
            } else if (mode === 'counting' && actualValue !== '') {
                effectiveDisplayContent = actualValue;
                textStyleClass += ` text-white`; // Use white for fruit emojis
                ariaLabel = 'Fruit cell';
            } else if (isChangeHighlightedYellow) {
                effectiveDisplayContent = actualValue;
                textStyleClass += ` text-yellow-500`;
                bgClass = isHighlightedGreen ? 'bg-green-700/40' : 'bg-yellow-800/30';
                ariaLabel = `Value ${actualValue}, changing`;
            } else if (isHighlightedGreen) {
                bgClass = 'bg-green-700/40';
                ariaLabel = `Value ${actualValue}`;
                effectiveDisplayContent = actualValue;
                textStyleClass += ` text-green-300`;
            } else {
                effectiveDisplayContent = '';
                textStyleClass += ` text-transparent`;
                ariaLabel = 'Grid cell';
            }
        }

        const finalStyle = { ...style };
        if (isMaxValueCell) {
            finalStyle.outline = '2px solid #22c55e';
            finalStyle.outlineOffset = '-2px';
        }

        const opacityClass = isDimmed ? 'opacity-75' : 'opacity-100';

        return (
            <div
                ref={cellRef} // Attach ref here
                className={`grid-cell-base relative flex items-center justify-center ${baseSizeClasses} ${textStyleClass} ${bgClass} ${borderClasses} ${interactiveClasses} ${className || ''} ${opacityClass}`}
                style={finalStyle}
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
                    <div className="absolute top-0 right-0 cell-superscript font-bold px-0 py-0 leading-none">
                        {subContent}
                    </div>
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
