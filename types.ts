export type GridMode = '10' | 'decimal' | 'adder' | 'diff' | 'counting';

export interface FruitType {
  name: string;
  icon: string; // e.g., '🍎', '🍌', '🍊'
}

export interface Fruit {
  id: string;
  type: FruitType;
  row: number;
  col: number;
  isCounted: boolean;
}

export interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
