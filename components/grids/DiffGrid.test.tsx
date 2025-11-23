import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiffGrid } from './DiffGrid';

// We need to import the mocked version of SquareCellComponent here
import { SquareCellComponent } from '../CellComponent';

// Use vi.mock to mock the module
vi.mock('../CellComponent', () => {
  const Mock = vi.fn((props) => {
    // Destructure all known custom props and filter out non-standard DOM props
    const {
      actualValue,
      isHeader,
      onClick,
      isLeftHeader,
      isBottomHeader,
      adderColor,
      className,
      // Filter out custom props that are not standard HTML attributes
      isHovered,
      borderClasses,
      baseSizeClasses,
      mode,
      isSelected,
      isHighlightedGreen,
      isChangeHighlightedYellow,
      isMaxValueCell,
      isDimmed,
      style,
      onMouseEnter,
      onMouseLeave,
      onCellMouseDown,
      onCellMouseUp,
      onTouchStart,
      onTouchEnd,
      ...rest // Collect any other unknown props
    } = props;

    const contentToDisplay = actualValue !== null && actualValue !== '' ? String(actualValue) : 'Empty';

    // Construct valid HTML attributes and data attributes
    const htmlProps: { [key: string]: any } = {
      'data-testid': 'square-cell',
      'data-actual-value': actualValue,
      'data-is-header': isHeader,
      'data-is-left-header': isLeftHeader,
      'data-is-bottom-header': isBottomHeader,
      'data-adder-color': adderColor,
      className: className,
      onClick: onClick,
      onMouseEnter: onMouseEnter,
      onMouseLeave: onMouseLeave,
      onMouseDown: onCellMouseDown,
      onMouseUp: onCellMouseUp,
      onTouchStart: onTouchStart,
      onTouchEnd: onTouchEnd,
      style: style,
      // Pass custom props as data-attributes if needed for testing, or just filter them out if not used
      'data-is-selected': isSelected,
      'data-is-highlighted-green': isHighlightedGreen,
      'data-is-change-highlighted-yellow': isChangeHighlightedYellow,
      'data-is-max-value-cell': isMaxValueCell,
      'data-is-dimmed': isDimmed,
    };

    return (
      <div
        {...htmlProps}
        {...rest} // Include any remaining standard HTML attributes
      >
        {contentToDisplay}
      </div>
    );
  });
  return { SquareCellComponent: Mock }; // Export the mock component
});


describe('DiffGrid', () => {
  const commonProps = {
    onReset: vi.fn(),
    diffValues: { green: null, red: null },
    onDiffChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (SquareCellComponent as ReturnType<typeof vi.fn>).mockClear();
  });

  it('renders the grid structure with SquareCellComponents', () => {
    // MaxY is 10, maxX is 10.
    // Left headers (10), data cells (10*10), bottom headers (10), corner (1)
    // 10 + 100 + 10 + 1 = 121 cells.
    render(<DiffGrid {...commonProps} mode="diff" />);
    // screen.debug(); // Keep for debugging
    expect(screen.getAllByTestId('square-cell')).toHaveLength(121);
  });

  it('calls onDiffChange with "green" when a green column cell is clicked', () => {
    render(<DiffGrid {...commonProps} mode="diff" />);
    // Green column is COL 2. Find a cell in COL 2 (e.g., row 5)
    // The DiffGrid sets className for its cells using row-X col-Y
    const greenCell = screen.getAllByTestId('square-cell').find(
      (cell) =>
        cell.className.includes('col-2') &&
        cell.className.includes('row-5') &&
        cell.dataset.isLeftHeader === undefined && // Not a left header
        cell.dataset.isBottomHeader === undefined // Not a bottom header
    );
    fireEvent.click(greenCell!);
    expect(commonProps.onDiffChange).toHaveBeenCalledWith('green', 5);
  });

  it('calls onDiffChange with "red" when a red column cell is clicked', () => {
    render(<DiffGrid {...commonProps} mode="diff" />);
    // Red column is COL 4. Find a cell in COL 4 (e.g., row 7)
    const redCell = screen.getAllByTestId('square-cell').find(
      (cell) =>
        cell.className.includes('col-4') &&
        cell.className.includes('row-7') &&
        cell.dataset.isLeftHeader === undefined && // Not a left header
        cell.dataset.isBottomHeader === undefined // Not a bottom header
    );
    fireEvent.click(redCell!);
    expect(commonProps.onDiffChange).toHaveBeenCalledWith('red', 7);
  });

  it('displays green blocks in green column up to diffValues.green', () => {
    const diffValues = { green: 5, red: 0 };
    render(<DiffGrid {...commonProps} mode="diff" diffValues={diffValues} />);
    for (let r = 1; r <= 5; r++) {
      const greenBlock = screen.getAllByTestId('square-cell').find(
        (cell) =>
          cell.className.includes(`row-${r}`) &&
          cell.className.includes('col-2') &&
          cell.dataset.adderColor === 'green'
      );
      expect(greenBlock).toBeInTheDocument();
      expect(greenBlock).toHaveTextContent(String(r));
    }
    // Check cell above max green value is empty
    const emptyCell = screen.getAllByTestId('square-cell').find(
      (cell) => cell.className.includes(`row-6`) && cell.className.includes('col-2')
    );
    expect(emptyCell).toHaveTextContent('Empty');
  });

  it('displays red blocks in red column up to diffValues.red', () => {
    const diffValues = { green: 0, red: 3 };
    render(<DiffGrid {...commonProps} mode="diff" diffValues={diffValues} />);
    for (let r = 1; r <= 3; r++) {
      const redBlock = screen.getAllByTestId('square-cell').find(
        (cell) =>
          cell.className.includes(`row-${r}`) &&
          cell.className.includes('col-4') &&
          cell.dataset.adderColor === 'red'
      );
      expect(redBlock).toBeInTheDocument();
      expect(redBlock).toHaveTextContent(String(r));
    }
    // Check cell above max red value is empty
    const emptyCell = screen.getAllByTestId('square-cell').find(
      (cell) => cell.className.includes(`row-4`) && cell.className.includes('col-4')
    );
    expect(emptyCell).toHaveTextContent('Empty');
  });

  it('displays the correct difference in the diff column (positive)', () => {
    const diffValues = { green: 7, red: 3 };
    render(<DiffGrid {...commonProps} mode="diff" diffValues={diffValues} />);
    const diff = diffValues.green - diffValues.red; // 4
    for (let r = 1; r <= diff; r++) {
      const diffBlock = screen.getAllByTestId('square-cell').find(
        (cell) =>
          cell.className.includes(`row-${r}`) &&
          cell.className.includes('col-10') &&
          cell.dataset.adderColor === 'green'
      );
      expect(diffBlock).toBeInTheDocument();
      expect(diffBlock).toHaveTextContent(String(r));
    }
    // Check cell above diff is empty
    const emptyCell = screen.getAllByTestId('square-cell').find(
      (cell) => cell.className.includes(`row-${diff + 1}`) && cell.className.includes('col-10')
    );
    expect(emptyCell).toHaveTextContent('Empty');
  });

  it('displays the correct difference in the diff column (negative)', () => {
    const diffValues = { green: 3, red: 7 };
    render(<DiffGrid {...commonProps} mode="diff" diffValues={diffValues} />);
    const diff = diffValues.green - diffValues.red; // -4
    for (let r = 1; r <= Math.abs(diff); r++) {
      const diffBlock = screen.getAllByTestId('square-cell').find(
        (cell) =>
          cell.className.includes(`row-${r}`) &&
          cell.className.includes('col-10') &&
          cell.dataset.adderColor === 'red'
      );
      expect(diffBlock).toBeInTheDocument();
      expect(diffBlock).toHaveTextContent(String(r));
    }
    // Check cell above abs(diff) is empty
    const emptyCell = screen.getAllByTestId('square-cell').find(
      (cell) => cell.className.includes(`row-${Math.abs(diff) + 1}`) && cell.className.includes('col-10')
    );
    expect(emptyCell).toHaveTextContent('Empty');
  });

  it('displays correct bottom headers for green, red, and diff', () => {
    const diffValues = { green: 8, red: 3 };
    render(<DiffGrid {...commonProps} mode="diff" diffValues={diffValues} />);
    expect(
      screen
        .getAllByTestId('square-cell')
        .find(
          (cell) => cell.dataset.isBottomHeader === 'true' && cell.dataset.actualValue === '8'
        )
    ).toHaveTextContent('8'); // Green
    expect(
      screen
        .getAllByTestId('square-cell')
        .find(
          (cell) => cell.dataset.isBottomHeader === 'true' && cell.dataset.actualValue === '3'
        )
    ).toHaveTextContent('3'); // Red
    expect(
      screen
        .getAllByTestId('square-cell')
        .find(
          (cell) => cell.dataset.isBottomHeader === 'true' && cell.dataset.actualValue === '5'
        )
    ).toHaveTextContent('5'); // Diff
  });

  it('calls onReset when the corner cell is clicked', () => {
    render(<DiffGrid {...commonProps} mode="diff" />);
    const cornerCell = screen
      .getAllByTestId('square-cell')
      .find((cell) => cell.dataset.actualValue === '0' && cell.dataset.isHeader === 'true');
    fireEvent.click(cornerCell!);
    expect(commonProps.onReset).toHaveBeenCalledTimes(1);
  });
});