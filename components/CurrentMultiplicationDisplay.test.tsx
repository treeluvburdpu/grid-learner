import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CurrentMultiplicationDisplay } from './CurrentMultiplicationDisplay';

describe('CurrentMultiplicationDisplay', () => {
  // Test cases for Adder Mode
  it('displays correct sum for adder mode with all values', () => {
    const adderValues = { red: 5, green: 3, blue: 2 };
    render(
      <CurrentMultiplicationDisplay
        selectedLeft={null}
        selectedTop={null}
        showZeroResult={false}
        gridMode="adder"
        adderValues={adderValues}
      />
    );
    expect(screen.getByText('5', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('3', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('2', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('= 10', { exact: false })).toBeInTheDocument();
  });

  it('displays correct sum for adder mode with some null values', () => {
    const adderValues = { red: 5, green: null, blue: 2 };
    render(
      <CurrentMultiplicationDisplay
        selectedLeft={null}
        selectedTop={null}
        showZeroResult={false}
        gridMode="adder"
        adderValues={adderValues}
      />
    );
    expect(screen.getByText('5', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('0', { exact: false })).toBeInTheDocument(); // Green should default to 0
    expect(screen.getByText('2', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('= 7', { exact: false })).toBeInTheDocument();
  });

  it('returns null if adder sum is 0 and showZeroResult is false', () => {
    const adderValues = { red: null, green: null, blue: null };
    const { container } = render(
      <CurrentMultiplicationDisplay
        selectedLeft={null}
        selectedTop={null}
        showZeroResult={false}
        gridMode="adder"
        adderValues={adderValues}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('displays 0 sum if adder sum is 0 and showZeroResult is true', () => {
    const adderValues = { red: null, green: null, blue: null };
    render(
      <CurrentMultiplicationDisplay
        selectedLeft={null}
        selectedTop={null}
        showZeroResult={true}
        gridMode="adder"
        adderValues={adderValues}
      />
    );
    expect(screen.getByText('= 0', { exact: false })).toBeInTheDocument();
  });

  // Test cases for 10x20 Mode (Integer Multiplication)
  it('displays correct multiplication for 10x20 mode', () => {
    render(
      <CurrentMultiplicationDisplay
        selectedLeft={5}
        selectedTop={7}
        showZeroResult={false}
        gridMode="10"
        adderValues={undefined}
      />
    );
    expect(screen.getByText('5 x 7', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('= 35', { exact: false })).toBeInTheDocument();
  });

  it('displays 0 when only selectedLeft is present in 10x20 mode', () => {
    render(
      <CurrentMultiplicationDisplay
        selectedLeft={5}
        selectedTop={null}
        showZeroResult={false}
        gridMode="10"
        adderValues={undefined}
      />
    );
    expect(screen.getByText('5 x 0', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('= 0', { exact: false })).toBeInTheDocument();
  });

  it('displays 0 when only selectedTop is present in 10x20 mode', () => {
    render(
      <CurrentMultiplicationDisplay
        selectedLeft={null}
        selectedTop={7}
        showZeroResult={false}
        gridMode="10"
        adderValues={undefined}
      />
    );
    expect(screen.getByText('0 x 7', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('= 0', { exact: false })).toBeInTheDocument();
  });

  // Test cases for 1.0x2.0 Mode (Decimal Multiplication)
  it('displays correct decimal multiplication for decimal mode', () => {
    render(
      <CurrentMultiplicationDisplay
        selectedLeft={5} // Represents 0.5
        selectedTop={7}  // Represents 0.7
        showZeroResult={false}
        gridMode="decimal"
        adderValues={undefined}
      />
    );
    // 0.5 * 0.7 = 0.35
    expect(screen.getByText('0.5 x 0.7', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('= 0.35', { exact: false })).toBeInTheDocument();
  });

  it('displays 0.0 when only selectedLeft is present in decimal mode', () => {
    render(
      <CurrentMultiplicationDisplay
        selectedLeft={5}
        selectedTop={null}
        showZeroResult={false}
        gridMode="decimal"
        adderValues={undefined}
      />
    );
    expect(screen.getByText('0.5 x 0.0', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('= 0.00', { exact: false })).toBeInTheDocument();
  });

  it('displays 0.0 when only selectedTop is present in decimal mode', () => {
    render(
      <CurrentMultiplicationDisplay
        selectedLeft={null}
        selectedTop={7}
        showZeroResult={false}
        gridMode="decimal"
        adderValues={undefined}
      />
    );
    expect(screen.getByText('0.0 x 0.7', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('= 0.00', { exact: false })).toBeInTheDocument();
  });

  // Test cases for showZeroResult prop
  it('displays "0 x 0 = 0" when showZeroResult is true in 10x20 mode', () => {
    render(
      <CurrentMultiplicationDisplay
        selectedLeft={null}
        selectedTop={null}
        showZeroResult={true}
        gridMode="10"
        adderValues={undefined}
      />
    );
    expect(screen.getByText('0 x 0', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('= 0', { exact: false })).toBeInTheDocument();
  });

  it('displays "0.0 x 0.0 = 0.00" when showZeroResult is true in decimal mode', () => {
    render(
      <CurrentMultiplicationDisplay
        selectedLeft={null}
        selectedTop={null}
        showZeroResult={true}
        gridMode="decimal"
        adderValues={undefined}
      />
    );
    expect(screen.getByText('0.0 x 0.0', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('= 0.00', { exact: false })).toBeInTheDocument();
  });
});
