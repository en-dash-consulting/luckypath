/**
 * Components barrel — public API for shared UI components.
 *
 * CONTRACT: This barrel exports React components that are consumed by route
 * files. Internal utilities (board-utils, canvas-drawing, inventory-shared)
 * are implementation details and must NOT be exported here.
 *
 * DAG position:  geometry → engine → services → hooks → **components** → routes
 *
 * Layer access rules (enforced by ESLint in eslint.config.ts):
 *   - Routes must import from this barrel — not from individual component
 *     files. Enforced by ESLint and validated by zone-boundaries.test.ts.
 *   - Intra-zone imports (component → component utility) may use direct paths.
 */

// Game board & rendering
export { GameBoard } from "./GameBoard";
export { GameHUD } from "./GameHUD";

// Tile UI
export { TileInventory } from "./TileInventory";
export { TilePreview } from "./TilePreview";
export { MobileInventory } from "./MobileInventory";

// World navigation
export { WorldGrid } from "./WorldGrid";

// Level flow
export { LevelComplete } from "./LevelComplete";

// Help & onboarding
export { HowToPlayModal } from "./HowToPlayModal";

// Rainbow arc
export { RainbowArc } from "./RainbowArc";
