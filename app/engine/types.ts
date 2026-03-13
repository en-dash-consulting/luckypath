// Cardinal directions
export const NORTH = 0;
export const EAST = 1;
export const SOUTH = 2;
export const WEST = 3;
export type Direction = 0 | 1 | 2 | 3;

export type Rotation = 0 | 1 | 2 | 3; // 0=0°, 1=90°, 2=180°, 3=270° clockwise

export type TileType = "straight" | "curve";

export interface Position {
  row: number;
  col: number;
}

export interface PlacedTile {
  type: TileType;
  rotation: Rotation;
}

export interface LevelCell {
  type: "empty" | "start" | "goal" | "obstacle";
}

export interface LevelData {
  id: string;
  worldId: number;
  levelIndex: number;
  name: string;
  width: number;
  height: number;
  start: Position & { direction: Direction };
  goal: Position;
  obstacles: Position[];
  inventory: { straight: number; curve: number };
  par: number;
  biome: "meadow" | "mushroom" | "rainbow" | "grove";
  hint?: string;
}

export interface GameState {
  placedTiles: Map<string, PlacedTile>;
  selectedTileType: TileType | null;
  remainingInventory: { straight: number; curve: number };
  phase: "placing" | "running" | "success" | "failure";
  luckyPosition: Position | null;
  luckyDirection: Direction | null;
  traversalPath: (Position & { direction: Direction })[];
  failReason?: string;
  removeMode: boolean;
}

