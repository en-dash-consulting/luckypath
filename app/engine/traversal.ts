import {
  type Direction,
  type Position,
  type PlacedTile,
  type TileType,
  type Rotation,
  type LevelData,
  NORTH,
  EAST,
  SOUTH,
  WEST,
} from "./types";
import { posKey } from "./utils";

// Base connections at rotation 0: [sideA, sideB]
// A tile connects two sides; Lucky can enter from either and exit the other
// Base connections at rotation 0: [sideA, sideB]
// A tile connects two sides; Lucky can enter from either and exit the other
const BASE_CONNECTIONS: Record<TileType, [Direction, Direction]> = {
  straight: [NORTH, SOUTH], // vertical path
  curve: [SOUTH, EAST],     // connects two adjacent sides
};

function rotateSide(side: Direction, steps: Rotation): Direction {
  return ((side + steps) % 4) as Direction;
}

export function opposite(dir: Direction): Direction {
  return ((dir + 2) % 4) as Direction;
}

export function getConnection(
  type: TileType,
  rotation: Rotation
): [Direction, Direction] {
  const [a, b] = BASE_CONNECTIONS[type];
  return [rotateSide(a, rotation), rotateSide(b, rotation)];
}

export function getExitSide(
  type: TileType,
  rotation: Rotation,
  entrySide: Direction
): Direction | null {
  const [a, b] = getConnection(type, rotation);
  if (entrySide === a) return b;
  if (entrySide === b) return a;
  return null;
}

// Direction vectors: [dRow, dCol]
const DIR_DELTA: Record<Direction, [number, number]> = {
  [NORTH]: [-1, 0],
  [EAST]: [0, 1],
  [SOUTH]: [1, 0],
  [WEST]: [0, -1],
};

export function moveInDirection(
  pos: Position,
  dir: Direction
): Position {
  const [dr, dc] = DIR_DELTA[dir];
  return { row: pos.row + dr, col: pos.col + dc };
}

export interface TraversalResult {
  path: (Position & { direction: Direction })[];
  success: boolean;
  failReason?: string;
}

export function simulateTraversal(
  level: LevelData,
  placedTiles: Map<string, PlacedTile>
): TraversalResult {
  const path: (Position & { direction: Direction })[] = [];
  const visited = new Set<string>();
  const obstacleSet = new Set(level.obstacles.map((o) => posKey(o.row, o.col)));
  const goalKey = posKey(level.goal.row, level.goal.col);

  let pos: Position = { row: level.start.row, col: level.start.col };
  let dir: Direction = level.start.direction;
  path.push({ ...pos, direction: dir });

  const MAX_STEPS = level.width * level.height + 10;

  for (let step = 0; step < MAX_STEPS; step++) {
    // Move to next cell
    const next = moveInDirection(pos, dir);
    const key = posKey(next.row, next.col);

    // Check bounds
    if (
      next.row < 0 ||
      next.row >= level.height ||
      next.col < 0 ||
      next.col >= level.width
    ) {
      path.push({ ...next, direction: dir });
      return { path, success: false, failReason: "Lucky walked off the edge!" };
    }

    // Check goal
    if (key === goalKey) {
      path.push({ ...next, direction: dir });
      return { path, success: true };
    }

    // Check obstacle
    if (obstacleSet.has(key)) {
      path.push({ ...next, direction: dir });
      return { path, success: false, failReason: "Lucky bumped into an obstacle!" };
    }

    // Check for tile
    const tile = placedTiles.get(key);
    if (!tile) {
      path.push({ ...next, direction: dir });
      return { path, success: false, failReason: "Lucky lost the path!" };
    }

    // Check for loops
    const stateKey = `${key}:${dir}`;
    if (visited.has(stateKey)) {
      return { path, success: false, failReason: "Lucky is going in circles!" };
    }
    visited.add(stateKey);

    // Get exit direction from tile
    const entrySide = opposite(dir);
    const exitSide = getExitSide(tile.type, tile.rotation, entrySide);
    if (exitSide === null) {
      path.push({ ...next, direction: dir });
      return {
        path,
        success: false,
        failReason: "Lucky can't enter this tile from that direction!",
      };
    }

    path.push({ ...next, direction: exitSide });
    pos = next;
    dir = exitSide;
  }

  return { path, success: false, failReason: "Lucky wandered too long!" };
}
