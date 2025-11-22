import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MultiplicationGrid } from './MultiplicationGrid';
import { MultiplicationGridCore } from './grids/MultiplicationGridCore';
import { AdderGrid } from './grids/AdderGrid';
import { DiffGrid } from './grids/DiffGrid'; // Import DiffGrid
import type { GridMode } from '../types';

// Mock the child components to avoid deep rendering and focus on the wrapper's logic
vi.mock('./grids/MultiplicationGridCore', () => ({
  MultiplicationGridCore: vi.fn(() => <div>MultiplicationGridCore Mock</div>),
}));

vi.mock('./grids/AdderGrid', () => ({
  AdderGrid: vi.fn(() => <div>AdderGrid Mock</div>),
}));

vi.mock('./grids/DiffGrid', () => ({ // Mock DiffGrid
  DiffGrid: vi.fn(() => <div>DiffGrid Mock</div>),
}));

describe('MultiplicationGrid Wrapper', () => {
  const commonProps = {
    selectedTop: 5,
    selectedLeft: 5,
    onSelectTop: vi.fn(),
    onSelectLeft: vi.fn(),
    onReset: vi.fn(),
    adderValues: { red: 1, green: 2, blue: 3 },
    onAdderChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders AdderGrid when mode is "adder"', () => {
    render(<MultiplicationGrid {...commonProps} mode="adder" />);
    expect(screen.getByText('AdderGrid Mock')).toBeInTheDocument();
    expect(MultiplicationGridCore).not.toHaveBeenCalled();
    expect(DiffGrid).not.toHaveBeenCalled(); // Also assert DiffGrid not called
    expect(AdderGrid).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'adder',
        onReset: commonProps.onReset,
        adderValues: commonProps.adderValues,
        onAdderChange: commonProps.onAdderChange,
      }),
      {}
    );
  });

  it('renders DiffGrid when mode is "diff"', () => { // New test case for DiffGrid
    render(<MultiplicationGrid {...commonProps} mode="diff" />);
    expect(screen.getByText('DiffGrid Mock')).toBeInTheDocument();
    expect(AdderGrid).not.toHaveBeenCalled();
    expect(MultiplicationGridCore).not.toHaveBeenCalled();
    expect(DiffGrid).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'diff',
        selectedTop: commonProps.selectedTop,
        selectedLeft: commonProps.selectedLeft,
        onSelectTop: commonProps.onSelectTop,
        onSelectLeft: commonProps.onSelectLeft,
        onReset: commonProps.onReset,
      }),
      {}
    );
  });

  it('renders MultiplicationGridCore when mode is "10"', () => {
    render(<MultiplicationGrid {...commonProps} mode="10" />);
    expect(screen.getByText('MultiplicationGridCore Mock')).toBeInTheDocument();
    expect(AdderGrid).not.toHaveBeenCalled();
    expect(DiffGrid).not.toHaveBeenCalled(); // Also assert DiffGrid not called
    expect(MultiplicationGridCore).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: '10',
        selectedTop: commonProps.selectedTop,
        selectedLeft: commonProps.selectedLeft,
        onSelectTop: commonProps.onSelectTop,
        onSelectLeft: commonProps.onSelectLeft,
        onReset: commonProps.onReset,
      }),
      {}
    );
  });

  it('renders MultiplicationGridCore when mode is "decimal"', () => {
    render(<MultiplicationGrid {...commonProps} mode="decimal" />);
    expect(screen.getByText('MultiplicationGridCore Mock')).toBeInTheDocument();
    expect(AdderGrid).not.toHaveBeenCalled();
    expect(DiffGrid).not.toHaveBeenCalled(); // Also assert DiffGrid not called
    expect(MultiplicationGridCore).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'decimal',
        selectedTop: commonProps.selectedTop,
        selectedLeft: commonProps.selectedLeft,
        onSelectTop: commonProps.onSelectTop,
        onSelectLeft: commonProps.onSelectLeft,
        onReset: commonProps.onReset,
      }),
      {}
    );
  });

  it('renders "Unsupported Grid Mode" for an unknown mode', () => {
    render(<MultiplicationGrid {...commonProps} mode={'unknown' as GridMode} />);
    expect(screen.getByText('Unsupported Grid Mode')).toBeInTheDocument();
    expect(MultiplicationGridCore).not.toHaveBeenCalled();
    expect(AdderGrid).not.toHaveBeenCalled();
    expect(DiffGrid).not.toHaveBeenCalled(); // Also assert DiffGrid not called
  });
});
