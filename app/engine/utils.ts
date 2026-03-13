// Utility to create a position key for Map storage
export function posKey(row: number, col: number): string {
  return `${row},${col}`;
}
