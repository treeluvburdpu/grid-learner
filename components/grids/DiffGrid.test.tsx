import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiffGrid } from './DiffGrid';
import { SquareCellComponent } from '../../CellComponent';

// Mock SquareCellComponent to isolate DiffGrid's logic
vi.mock('../../CellComponent', () => ({
  SquareCellComponent: vi.fn((props) => {
    // Render a simplified div that reflects important props for testing
    const {
      content, actualValue, isHovered, isHeader, isSelected,
      isHighlightedGreen, isChangeHighlightedYellow, onClick,
      isLeftHeader, isBottomHeader, className, mode, ...rest
    } = props;

    return (
      <div
        data-testid="square-cell"
        data-actual-value={actualValue}
        data-is-hovered={isHovered}
        data-is-header={isHeader}
        data-is-selected={isSelected}
        data-is-highlighted-green={isHighlightedGreen}
        data-is-change-highlighted-yellow={isChangeHighlightedYellow}
        data-is-left-header={isLeftHeader}
        data-is-bottom-header={isBottomHeader}
        data-mode={mode}
        className={className}
        onClick={onClick}
        {...rest}
      >
        {content !== null && content !== '' ? String(content) : 'Empty'}
      </div>
    );
  }),
}));

describe('DiffGrid', () => {
  const commonProps = {
    selectedTop: null,
    selectedLeft: null,
    onSelectTop: vi.fn(),
    onSelectLeft: vi.fn(),
    onReset: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the grid structure with SquareCellComponents', () => {
    render(<DiffGrid {...commonProps} mode="10" />);
    // Expect 10 (top headers) + 10 (left headers) + 1 (corner) + 10*20 (data cells) = 221 cells
    // No, it's 10 (top headers) + 20 (left headers) + 1 (corner) + 10*20 (data cells) = 231 cells
    // And my current rendering is for (maxY * (maxX + 1)) + (maxX + 1)
    // (20 * 11) + 11 = 220 + 11 = 231 cells (20 left headers + 20*10 data cells + 1 corner + 10 bottom headers)
    expect(screen.getAllByTestId('square-cell')).toHaveLength(231);
  });

  it('calls onSelectLeft when a left header is clicked in 10 mode', () => {
    render(<DiffGrid {...commonProps} mode="10" />);
    const leftHeader5 = screen.getAllByTestId('square-cell').find(cell => cell.textContent === '5' && cell.dataset.isLeftHeader === 'true');
    fireEvent.click(leftHeader5!);
    expect(commonProps.onSelectLeft).toHaveBeenCalledWith(5);
  });

  it('calls onSelectTop when a bottom header is clicked in 10 mode', () => {
    render(<DiffGrid {...commonProps} mode="10" />);
    const bottomHeader7 = screen.getAllByTestId('square-cell').find(cell => cell.textContent === '7' && cell.dataset.isBottomHeader === 'true');
    fireEvent.click(bottomHeader7!);
    expect(commonProps.onSelectTop).toHaveBeenCalledWith(7);
  });

  it('displays the correct difference value in 10 mode', () => {
    const { rerender } = render(<DiffGrid {...commonProps} mode="10" selectedLeft={5} selectedTop={3} />);
    const cell = screen.getAllByTestId('square-cell').find(cell =>
      cell.dataset.isHighlightedGreen === 'true' && cell.dataset.actualValue === '2'
    );
    expect(cell).toBeInTheDocument();
    expect(cell).toHaveTextContent('2'); // |5-3|=2
  });

  it('displays the correct decimal difference value in decimal mode', () => {
    const { rerender } = render(<DiffGrid {...commonProps} mode="decimal" selectedLeft={5} selectedTop={3} />);
    const cell = screen.getAllByTestId('square-cell').find(cell =>
      cell.dataset.isHighlightedGreen === 'true' && cell.dataset.actualValue === '0.2'
    );
    expect(cell).toBeInTheDocument();
    expect(cell).toHaveTextContent('0.2'); // |0.5-0.3|=0.2
  });

  it('highlights selected row and column in green for 10 mode', () => {
    render(<DiffGrid {...commonProps} mode="10" selectedLeft={4} selectedTop={6} />);
    const selectedCells = screen.getAllByTestId('square-cell').filter(cell =>
      cell.dataset.isHighlightedGreen === 'true'
    );
    // There should be cells in row 4 and column 6
    // Count of cells that have r=4 or c=6
    // r=4, c=1-10 (10 cells)
    // c=6, r=1-20 (20 cells)
    // intersection r=4, c=6 (1 cell)
    // Total = 10 + 20 - 1 = 29 cells
    // The `isGreenHighlighted` logic needs to be checked carefully:
    // const isGreenHighlighted = selectedTop !== null && selectedLeft !== null && (r === selectedLeft || c === selectedTop);
    // So if selectedLeft = 4, selectedTop = 6, then (r=4 or c=6)
    // Cells with r=4 (10 cells)
    // Cells with c=6 (20 cells)
    // 10 + 20 - 1 = 29 cells.
    expect(selectedCells).toHaveLength(29);
  });

  it('calls onReset when the corner cell is clicked', () => {
    render(<DiffGrid {...commonProps} mode="10" />);
    const cornerCell = screen.getAllByTestId('square-cell').find(cell => cell.dataset.actualValue === '0' && cell.dataset.isHeader === 'true');
    fireEvent.click(cornerCell!);
    expect(commonProps.onReset).toHaveBeenCalledTimes(1);
  });

  it('applies yellow highlight to newly selected cells', async () => {
    vi.useFakeTimers();
    const { rerender } = render(<DiffGrid {...commonProps} mode="10" />);

    // Initial render, no yellow
    expect(screen.queryAllByTestId('square-cell').some(cell => cell.dataset.isChangeHighlightedYellow === 'true')).toBe(false);

    // Select first numbers
    rerender(<DiffGrid {...commonProps} mode="10" selectedLeft={2} selectedTop={3} />);
    let yellowCells = screen.queryAllByTestId('square-cell').filter(cell => cell.dataset.isChangeHighlightedYellow === 'true');
    // If selectedLeft=2, selectedTop=3, cells (r=2 or c=3) but not (r=2,c=3) should be yellow.
    // Count cells where (r=2 or c=3) and not (r=2 and c=3) = 10 (row 2) + 20 (col 3) - 1 (intersection) = 29 cells
    // All these 29 cells should be yellow initially for new selection.
    expect(yellowCells.length).toBe(29);


    // Change selection
    rerender(<DiffGrid {...commonProps} mode="10" selectedLeft={4} selectedTop={5} />);
    yellowCells = screen.queryAllByTestId('square-cell').filter(cell => cell.dataset.isChangeHighlightedYellow === 'true');
    // This logic in DiffGrid's useEffect needs to be carefully checked.
    // The previous highlighting logic for multiplication (area increase) doesn't directly apply here.
    // For diff grid, maybe only the *newly activated* cells (not previously highlighted) should be yellow.
    // The current logic in DiffGrid.tsx for yellow highlighting is:
    // const isCurrentlyActive = (r === selectedLeft || c === selectedTop);
    // if (isCurrentlyActive && !wasPreviouslyActive) { newYellowCells.add(cellKey); }
    // This will correctly mark cells that are *newly* part of the selected row/column.
    // Let's count them:
    // Old: (r=2 or c=3) -> 29 cells
    // New: (r=4 or c=5) -> 29 cells
    // How many cells are in (r=4 or c=5) AND NOT (r=2 or c=3)?
    // Cells in (r=4 or c=5) which are not (r=2 or c=3)
    // = Cells in r=4 (10) + Cells in c=5 (20) - Cells in (r=4 AND c=5) (1) = 29
    // Then subtract cells that are in (r=2 or c=3)
    // The logic in DiffGrid.tsx is a simplified version of this. It marks any cell that is currently active and wasn't previously active.
    // This would be (new active cells) - (old active cells that are still active).
    // Let's refine the mock to capture the actual values and test that.

    vi.advanceTimersByTime(YELLOW_HIGHLIGHT_DURATION_MS);

    // After timer, yellow highlight should be gone
    rerender(<DiffGrid {...commonProps} mode="10" selectedLeft={4} selectedTop={5} />);
    yellowCells = screen.queryAllByTestId('square-cell').filter(cell => cell.dataset.isChangeHighlightedYellow === 'true');
    expect(yellowCells.length).toBe(0);

    vi.useRealTimers();
  });
});
