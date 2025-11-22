import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GridControls } from './GridControls';

describe('GridControls', () => {
  it('renders all three mode buttons', () => {
    render(<GridControls currentMode="adder" onModeChange={() => {}} />);
    expect(screen.getByRole('button', { name: /sum/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /10x20/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /1.0x2.0/i })).toBeInTheDocument();
  });

  it('highlights the "Sum" button when currentMode is "adder"', () => {
    render(<GridControls currentMode="adder" onModeChange={() => {}} />);
    const sumButton = screen.getByRole('button', { name: /sum/i });
    expect(sumButton).toHaveClass('bg-purple-500'); // Check for specific class for adder highlight
    expect(sumButton).toHaveClass('ring-2');
  });

  it('highlights the "10x20" button when currentMode is "10"', () => {
    render(<GridControls currentMode="10" onModeChange={() => {}} />);
    const button10x20 = screen.getByRole('button', { name: /10x20/i });
    expect(button10x20).toHaveClass('bg-blue-500'); // Check for specific class for 10x20 highlight
    expect(button10x20).toHaveClass('ring-2');
  });

  it('highlights the "1.0x2.0" button when currentMode is "decimal"', () => {
    render(<GridControls currentMode="decimal" onModeChange={() => {}} />);
    const button1_0x2_0 = screen.getByRole('button', { name: /1.0x2.0/i });
    expect(button1_0x2_0).toHaveClass('bg-blue-500'); // Check for specific class for decimal highlight
    expect(button1_0x2_0).toHaveClass('ring-2');
  });

  it('calls onModeChange with "adder" when "Sum" button is clicked', () => {
    const mockOnModeChange = vi.fn();
    render(<GridControls currentMode="10" onModeChange={mockOnModeChange} />);
    fireEvent.click(screen.getByRole('button', { name: /sum/i }));
    expect(mockOnModeChange).toHaveBeenCalledTimes(1);
    expect(mockOnModeChange).toHaveBeenCalledWith('adder');
  });

  it('calls onModeChange with "10" when "10x20" button is clicked', () => {
    const mockOnModeChange = vi.fn();
    render(<GridControls currentMode="adder" onModeChange={mockOnModeChange} />);
    fireEvent.click(screen.getByRole('button', { name: /10x20/i }));
    expect(mockOnModeChange).toHaveBeenCalledTimes(1);
    expect(mockOnModeChange).toHaveBeenCalledWith('10');
  });

  it('calls onModeChange with "decimal" when "1.0x2.0" button is clicked', () => {
    const mockOnModeChange = vi.fn();
    render(<GridControls currentMode="adder" onModeChange={mockOnModeChange} />);
    fireEvent.click(screen.getByRole('button', { name: /1.0x2.0/i }));
    expect(mockOnModeChange).toHaveBeenCalledTimes(1);
    expect(mockOnModeChange).toHaveBeenCalledWith('decimal');
  });
});
