import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { MockedFunction } from 'vitest'; // Import MockedFunction as a type only
import { DiffGrid } from './DiffGrid';
import { SquareCellComponent } from '../CellComponent';

// Use vi.mock to mock the module
vi.mock('../CellComponent', () => {
  const Mock = vi.fn((props) => {
    // Destructure only the props actually used in the mock's logic or data-attributes
    const { actualValue } = props;

    const contentToDisplay = actualValue !== null && actualValue !== '' ? String(actualValue) : 'Empty';

    // Construct valid HTML attributes and data attributes
    const htmlProps: { [key: string]: any } = {
      'data-testid': 'square-cell',
      'data-actual-value': String(props.actualValue), // Explicitly cast to string
      'data-is-header': props.isHeader, // Use props.isHeader directly
      'data-is-left-header': props.isLeftHeader, // Use props.isLeftHeader directly
      'data-is-bottom-header': props.isBottomHeader, // Use props.isBottomHeader directly
      'data-adder-color': props.adderColor, // Use props.adderColor directly
      className: props.className, // Use props.className directly
      onClick: props.onClick, // Use props.onClick directly
      onMouseEnter: props.onMouseEnter,
      onMouseLeave: props.onMouseLeave,
      onMouseDown: props.onCellMouseDown,
      onMouseUp: props.onCellMouseUp,
      onTouchStart: props.onTouchStart,
      onTouchEnd: props.onTouchEnd,
      style: props.style,
      // Pass custom props as data-attributes if needed for testing, or just filter them out if not used
      'data-is-selected': props.isSelected,
      'data-is-highlighted-green': props.isHighlightedGreen,
      'data-is-change-highlighted-yellow': props.isChangeHighlightedYellow,
      'data-is-max-value-cell': props.isMaxValueCell,
      'data-is-dimmed': props.isDimmed,
    };

    return (
      <div
        {...htmlProps}
        // {...rest} // No longer needed as we are explicitly picking props
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
    (SquareCellComponent as MockedFunction<typeof SquareCellComponent>).mockClear();
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
    // Set green to a positive value so red cells are clickable
    const testDiffValues = { green: 10, red: null };
    render(<DiffGrid {...commonProps} mode="diff" diffValues={testDiffValues} />);
    // Red column is COL 4. Find a cell in COL 4 (e.g., row 7)
    const redCell = screen.getAllByTestId('square-cell').find(
      (cell) =>
        cell.className.includes('col-4') &&
        cell.className.includes('row-7') &&
        cell.dataset.isLeftHeader === undefined && // Not a left header
        cell.dataset.isBottomHeader === undefined // Not a bottom header
    );
    fireEvent.click(redCell!);
    expect(commonProps.onDiffChange).toHaveBeenCalledWith('red', 4); // Expect 10 - 7 + 1 = 4
  });

  it('displays green blocks in green column up to diffValues.green', () => {
    const diffValues = { green: 5, red: 0 };
    render(<DiffGrid {...commonProps} mode="diff" diffValues={diffValues} />);
    for (let r = 1; r <= 5; r++) {
      const greenBlock = screen
        .getAllByTestId('square-cell')
        .find(
          (cell) =>
            cell.className.includes(`row-${r}`) &&
            cell.className.includes('col-2') &&
            cell.dataset.adderColor === 'green'
        );
      expect(greenBlock).toBeInTheDocument();
      expect(greenBlock).toHaveTextContent(String(r));
    }
    // Check cell above max green value displays its number but no adderColor
    for (let r = 6; r <= 10; r++) {
      const cellAboveGreen = screen
        .getAllByTestId('square-cell')
        .find(
          (cell) =>
            cell.className.includes(`row-${r}`) &&
            cell.className.includes('col-2') &&
            cell.dataset.isLeftHeader === undefined &&
            cell.dataset.isBottomHeader === undefined
        );
      expect(cellAboveGreen).toBeInTheDocument();
      expect(cellAboveGreen).toHaveTextContent(String(r));
      expect(cellAboveGreen).not.toHaveAttribute('data-adder-color', 'green');
    }
  });

  it('displays red blocks in red column when green is 0 (empty)', () => {
    // Scenario 1: green is 0 (or null), red column should be empty

    const diffValuesGreenZero = { green: 0, red: 3 };

    render(<DiffGrid {...commonProps} mode="diff" diffValues={diffValuesGreenZero} />);

    for (let r = 1; r <= 10; r++) {
      const redColumnCell = screen

        .getAllByTestId('square-cell')

        .find((cell) => cell.className.includes(`col-4`) && cell.className.includes(`row-${r}`));

      expect(redColumnCell).toBeInTheDocument();

      // Expect them to be 'Empty' because green is 0

      expect(redColumnCell).toHaveTextContent('Empty');

      expect(redColumnCell).not.toHaveAttribute('data-adder-color');
    }
  });

  it('displays red blocks in red column with reduced height and inverted numbers when green is selected', () => {
    // Scenario: green is selected, red column shows numbers up to green's value with inverted numbers

    const diffValuesGreenSelected = { green: 5, red: 3 }; // green selected to 5, red selected to 3

    render(<DiffGrid {...commonProps} mode="diff" diffValues={diffValuesGreenSelected} />);

    // Verify mock calls for SquareCellComponent
    const mockCalls = (SquareCellComponent as MockedFunction<typeof SquareCellComponent>).mock.calls;

    // Filter calls for col-4 cells (RED_COL)
    const redColumnCalls = mockCalls.filter((call) => {
      const props = call[0]; // First argument is props
      return props.className && props.className.includes('col-4');
    });

    // We expect 10 calls for col-4 (r=1 to 10)
    expect(redColumnCalls).toHaveLength(10);

    // Assertions for each cell in col-4
    for (let r = 1; r <= 10; r++) {
      const expectedR = r; // Row number for this iteration
      let expectedActualValue: number | string = '';
      let expectedAdderColor: 'red' | undefined = undefined; // Undefined means no color

      // Determine expected values based on DiffGrid.tsx logic
      const gVal = diffValuesGreenSelected.green || 0;
      const rVal = diffValuesGreenSelected.red || 0;

      if (gVal > 0 && expectedR <= gVal) {
        expectedActualValue = gVal - expectedR + 1; // Inverted number
        if (expectedActualValue <= rVal) {
          expectedAdderColor = 'red';
        }
      } else {
        expectedActualValue = ''; // Empty if not within green's height or green is 0
      }

      // Find the specific mock call for this row (r)
      const mockCallIndex = 10 - expectedR; // Calculate index based on row number (maxY - r)
      const props = redColumnCalls[mockCallIndex][0]; // Get props from the specific call

      expect(props.actualValue).toEqual(expectedActualValue);
      // Check adderColor only if it's expected to be present
      if (expectedAdderColor) {
        expect(props.adderColor).toEqual(expectedAdderColor);
      } else {
        expect(props.adderColor).toBeUndefined();
      }
    }
  });

  it('displays the correct difference in the diff column (positive)', () => {
    const diffValues = { green: 7, red: 3 };
    render(<DiffGrid {...commonProps} mode="diff" diffValues={diffValues} />);
    const diff = diffValues.green - diffValues.red; // 4
    for (let r = 1; r <= diff; r++) {
      const diffBlock = screen
        .getAllByTestId('square-cell')
        .find(
          (cell) =>
            cell.className.includes(`row-${r}`) &&
            cell.className.includes('col-10') &&
            cell.dataset.adderColor === 'green'
        );
      expect(diffBlock).toBeInTheDocument();
      expect(diffBlock).toHaveTextContent(String(r));
    }
    // Check cell above diff is empty
    const emptyCell = screen
      .getAllByTestId('square-cell')
      .find((cell) => cell.className.includes(`row-${diff + 1}`) && cell.className.includes('col-10'));
    expect(emptyCell).toHaveTextContent('Empty');
  });

  it('displays the correct difference in the diff column (negative)', () => {
    const diffValues = { green: 3, red: 7 };
    render(<DiffGrid {...commonProps} mode="diff" diffValues={diffValues} />);
    const diff = diffValues.green - diffValues.red; // -4
    for (let r = 1; r <= Math.abs(diff); r++) {
      const diffBlock = screen
        .getAllByTestId('square-cell')
        .find(
          (cell) =>
            cell.className.includes(`row-${r}`) &&
            cell.className.includes('col-10') &&
            cell.dataset.adderColor === 'red'
        );
      expect(diffBlock).toBeInTheDocument();
      expect(diffBlock).toHaveTextContent(String(r));
    }
    // Check cell above abs(diff) is empty
    const emptyCell = screen
      .getAllByTestId('square-cell')
      .find((cell) => cell.className.includes(`row-${Math.abs(diff) + 1}`) && cell.className.includes('col-10'));
    expect(emptyCell).toHaveTextContent('Empty');
  });

  it('displays correct bottom headers for green, red, and diff', () => {
    const diffValues = { green: 8, red: 3 };
    render(<DiffGrid {...commonProps} mode="diff" diffValues={diffValues} />);
    expect(
      screen
        .getAllByTestId('square-cell')
        .find((cell) => cell.dataset.isBottomHeader === 'true' && cell.dataset.actualValue === '8')
    ).toHaveTextContent('8'); // Green
    expect(
      screen
        .getAllByTestId('square-cell')
        .find((cell) => cell.dataset.isBottomHeader === 'true' && cell.dataset.actualValue === '3')
    ).toHaveTextContent('3'); // Red
    expect(
      screen
        .getAllByTestId('square-cell')
        .find((cell) => cell.dataset.isBottomHeader === 'true' && cell.dataset.actualValue === '5')
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
