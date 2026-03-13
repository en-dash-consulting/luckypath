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

/** Typed traversal outcomes — exhaustively checkable at call sites. */
export type TraversalOutcome =
  | "goal"
  | "edge"
  | "obstacle"
  | "no-path"
  | "loop"
  | "blocked"
  | "timeout";

/** Human-readable messages for each outcome, used in the UI. */
export const TRAVERSAL_MESSAGES: Record<TraversalOutcome, string> = {
  goal: "",
  edge: "Lucky walked off the edge!",
  obstacle: "Lucky bumped into an obstacle!",
  "no-path": "Lucky lost the path!",
  loop: "Lucky is going in circles!",
  blocked: "Lucky can't enter this tile from that direction!",
  timeout: "Lucky wandered too long!",
};

export interface TraversalResult {
  path: (Position & { direction: Direction })[];
  outcome: TraversalOutcome;
  /** Whether Lucky reached the goal. */
  success: boolean;
  /** Human-readable explanation shown in the UI. */
  failReason?: string;
}

function fail(
  path: (Position & { direction: Direction })[],
  outcome: Exclude<TraversalOutcome, "goal">
): TraversalResult {
  return { path, outcome, success: false, failReason: TRAVERSAL_MESSAGES[outcome] };
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
      return fail(path, "edge");
    }

    // Check goal
    if (key === goalKey) {
      path.push({ ...next, direction: dir });
      return { path, outcome: "goal" as const, success: true };
    }

    // Check obstacle
    if (obstacleSet.has(key)) {
      path.push({ ...next, direction: dir });
      return fail(path, "obstacle");
    }

    // Check for tile
    const tile = placedTiles.get(key);
    if (!tile) {
      path.push({ ...next, direction: dir });
      return fail(path, "no-path");
    }

    // Check for loops
    const stateKey = `${key}:${dir}`;
    if (visited.has(stateKey)) {
      return fail(path, "loop");
    }
    visited.add(stateKey);

    // Get exit direction from tile
    const entrySide = opposite(dir);
    const exitSide = getExitSide(tile.type, tile.rotation, entrySide);
    if (exitSide === null) {
      path.push({ ...next, direction: dir });
      return fail(path, "blocked");
    }

    path.push({ ...next, direction: exitSide });
    pos = next;
    dir = exitSide;
  }

  return fail(path, "timeout");
}
