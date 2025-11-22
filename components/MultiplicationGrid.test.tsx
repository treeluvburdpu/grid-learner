import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MultiplicationGrid } from './MultiplicationGrid';
import { MultiplicationGridCore } from './grids/MultiplicationGridCore';
import { AdderGrid } from './grids/AdderGrid';
import type { GridMode } from '../types';

// Mock the child components to avoid deep rendering and focus on the wrapper's logic
vi.mock('./grids/MultiplicationGridCore', () => ({
  MultiplicationGridCore: vi.fn(() => <div>MultiplicationGridCore Mock</div>),
}));

vi.mock('./grids/AdderGrid', () => ({
  AdderGrid: vi.fn(() => <div>AdderGrid Mock</div>),
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

  it('renders MultiplicationGridCore when mode is "10"', () => {
    render(<MultiplicationGrid {...commonProps} mode="10" />);
    expect(screen.getByText('MultiplicationGridCore Mock')).toBeInTheDocument();
    expect(AdderGrid).not.toHaveBeenCalled();
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
  });
});
