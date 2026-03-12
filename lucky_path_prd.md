# Product Requirements Document
## Lucky Path
### Version 0.3 — self-reviewed and revised twice

## 1. Product Overview
**Lucky Path** is a playful, clean, toy-like logic puzzle game in which players help an adorable leprechaun reach a pot of gold by placing directional path tiles on a visible, slightly isometric board.

The game is designed to be small in scope, charming in presentation, and meaningful as a learning experience. Its educational value comes from requiring players to plan sequences, reason about cause and effect, predict outcomes before execution, and improve solutions through iteration.

The player fantasy is not “being” the leprechaun, but **guiding a tiny magical helper** through spatial logic puzzles. The emotional tone is cheerful, low-stress, and satisfying.

## 2. Product Vision
Create a compact puzzle game that feels delightful to interact with, is easy to understand at a glance, and quietly teaches core computational thinking skills through a polished, approachable fantasy theme.

The game should feel:
- playful rather than cerebral
- polished rather than content-heavy
- readable rather than visually ornate
- encouraging rather than punishing

## 3. Goals
### Primary goals
1. Deliver a polished core puzzle loop that is satisfying within seconds.
2. Teach planning and logic without overt “edutainment” framing.
3. Keep scope tight enough for vibe-coded implementation.
4. Achieve a cohesive visual style using clean, toy-like graphics.
5. Support a short but complete level progression with increasing depth.

### Secondary goals
1. Create a foundation for future mechanics and level packs.
2. Make the game attractive enough to share as a small finished project.
3. Keep asset and implementation complexity modest.

## 4. Non-Goals
1. This is not a narrative adventure game.
2. This is not a physics sandbox.
3. This is not a procedural endless puzzle generator for v1.
4. This is not a multiplayer or competitive game.
5. This is not a programming syntax game with explicit code commands.
6. This is not a large content platform with user-generated levels in v1.

## 5. Target Player
### Primary audience
Players who enjoy short, visually charming puzzle games and like the feeling of solving a board cleanly.

### Secondary audience
Adults and older children who enjoy logic puzzles and may appreciate a light computational-thinking learning layer.

### Player motivations
- “I want a cute puzzle game that feels good to play.”
- “I want to figure out the right route with limited pieces.”
- “I like optimization and clean solutions.”
- “I want a small game that respects my time.”

## 6. Core Learning Outcomes
The game should naturally reinforce:
- sequence planning
- spatial reasoning
- prediction before execution
- debugging after failure
- optimization under constraints

The game should **show** these skills through play rather than explain them academically.

## 7. Core Product Pillars
### 7.1 Readable first
A player should understand the board state, tile directions, start, goal, and hazards nearly instantly.

### 7.2 Small but polished
The game should prioritize tactile feel, responsiveness, and charm over content breadth.

### 7.3 Friendly challenge
Failure should feel playful and informative, not punitive.

### 7.4 Quietly educational
The puzzle structure should reward hypothesis, test, observe, revise.

## 8. Core Gameplay Loop
1. Player views level layout.
2. Player studies start tile, goal, obstacles, and available path tiles.
3. Player places tiles onto empty grid spaces.
4. Player optionally rotates placed tiles before running.
5. Player presses **Send Lucky!**
6. The leprechaun traverses the path according to tile directions.
7. The player observes the outcome.
8. If successful, the player earns completion and possibly a better rating for efficiency.
9. If unsuccessful, the player adjusts the layout and tries again.

## 9. Core Mechanics
### 9.1 Board
- Board is a visible square grid.
- Presentation is slight isometric / tilted top-down, not true isometric.
- Recommended board sizes for v1: mostly 6x6 and 7x7, with occasional 8x8 late-game levels.
- Start and goal are fixed on the board.
- Some cells are blocked by obstacles.

### 9.2 Tile Placement
Players receive a **limited inventory** of path tiles for each level.

Initial tile types:
- Straight
- Turn Left
- Turn Right

Supporting board objects:
- Start tile (fixed clover base)
- Goal tile (pot of gold)
- Obstacle tile (fixed rock, stump, puddle, etc.)

Rules:
- Tiles can only be placed on valid empty spaces.
- Tiles snap to the grid.
- Tiles may be rotated before run.
- Tile count is constrained per level.
- Player can remove and replace tiles freely before pressing Run.

### 9.3 Movement / Execution
- Once the run starts, Lucky the leprechaun automatically follows the path.
- He enters the first adjacent path direction from the start tile.
- Each tile determines the exit direction.
- If he reaches the goal tile, the level is won.
- If he runs into a missing connection, obstacle, board edge, or dead end, the run fails.

### 9.4 Rotation
Placed tiles can be rotated in 90-degree increments.

Design rationale:
Rotation increases expressiveness without requiring too many tile variants.

### 9.5 Win Condition
Lucky reaches the pot of gold.

### 9.6 Loss Conditions
- Lucky walks into an invalid edge or off-route exit.
- Lucky collides with an obstacle.
- Lucky exits the playable path incorrectly.
- Lucky enters a dead end.

Failure should be clear and animated in a cute, non-frustrating way.

## 10. Game Structure
### 10.1 Campaign Structure
The game ships with a handcrafted level campaign.

Recommended v1 structure:
- World 1: Meadow Start (8 levels)
- World 2: Mushroom Maze (8 levels)
- World 3: Rainbow Run (8 levels)
- World 4: Gold Grove (8 levels)

Total recommended v1 levels: **32**

This is enough to feel complete while staying realistic.

### 10.2 Difficulty Curve
#### Early levels
Teach:
- placing a straight tile
- turning left/right
- understanding entry/exit directions
- pressing Run and observing

#### Mid levels
Introduce:
- tighter inventories
- obstacle routing
- longer path planning
- tile reuse thinking via rotation

#### Late levels
Emphasize:
- multi-turn sequencing
- more constrained spaces
- efficiency scoring
- “aha” solutions

### 10.3 Retry Flow
- Instant retry
- Fast reset to editable state
- No harsh penalty for failure

## 11. Progression and Scoring
### 11.1 Base Progression
- Completing a level unlocks the next.
- Players may replay completed levels.

### 11.2 Optional Performance Rating
To add depth without blocking casual players, each level includes a 3-clover rating based on:
- completion
- tile efficiency
- optional perfect solution benchmark

Recommended scoring:
- 1 clover: complete the level
- 2 clovers: complete within the intended tile count
- 3 clovers: complete using optimal or near-optimal arrangement

Important: only **completion** gates progress.

### 11.3 Why this matters
This adds an optimization layer and extends the learning value without making the game feel punitive.

## 12. UX Requirements
### 12.1 Core UX principles
- Board state should be legible instantly.
- Tile placement should feel tactile and crisp.
- Failure feedback should teach, not just signal loss.
- Interactions should be minimal and low-friction.

### 12.2 Required interactions
- Select tile from inventory
- Place tile on board
- Rotate tile
- Remove tile
- Run simulation
- Reset board
- Replay result animation after win or fail if desired

### 12.3 Recommended controls
Desktop / web:
- Click to select tile
- Click grid cell to place
- Click placed tile to rotate
- Right-click or dedicated remove mode to remove
- Run button prominently positioned

### 12.4 UX refinement from self-review
A previous draft risked overemphasizing polish over comprehension. Therefore the board should support a lightweight **path preview** mode for accessibility and understanding.

Recommended preview behavior:
- On hover or selection, candidate tile orientation visibly indicates output direction.
- Optional “Preview Path” button shows projected route as a dotted line before run.

This should be optional so the game still supports discovery.

## 13. Visual Design Direction
### 13.1 Style
- clean gamey
- shiny toy-like
- cheerful fantasy
- readable over detailed
- lightly magical, not painterly

### 13.2 Character direction
Lucky is:
- tiny
- adorable
- helpful
- expressive through bounce and celebration

Character design should be closer to a polished board-game token or mobile puzzle mascot than a detailed platformer hero.

### 13.3 Board direction
- visible grid
- slightly tilted perspective
- tiles appear like chunky toy pieces placed on a puzzle board
- board surfaces should have mild depth and shine

### 13.4 Color strategy
Primary palette:
- clover greens
- gold yellows
- sky blues
- rainbow accents used sparingly
- warm neutrals for board/tile materials

Danger states should be visible without breaking the cheerful tone.

### 13.5 Motion principles
Animations should be:
- bouncy
- readable
- brief
- rewarding

No animation should obscure puzzle readability.

## 14. Asset Strategy
### 14.1 Recommended asset production approach
Use a hybrid workflow:
1. Open asset packs for baseline board elements and icons
2. Custom adaptation for consistency
3. Light custom animation and UI polish

### 14.2 Asset sourcing recommendation
Primary recommendation: **Kenney-style open assets or similarly permissive puzzle/fantasy packs** as placeholders and foundations, then normalize them into one coherent style.

### 14.3 Art consistency rule
All final assets in v1 should be normalized to the same:
- perspective
- outline style
- material feel
- saturation range
- scale language

### 14.4 Asset budget for v1
Keep art scope intentionally small.

Target v1 asset list:
- 1 leprechaun character
- 3 leprechaun animations (idle, walk, celebrate; fail can reuse walk/bonk overlay)
- 3 placeable tile families
- 3–4 obstacle variants
- 4 biome/background variations
- basic particles (sparkle, poof, coin burst)
- core UI elements

This budget keeps the project finishable.

## 15. Audio
No sound-reactive systems.

Audio itself is optional for v1.
If included later, it should support tactile feel only:
- soft tile snap
- bounce step
- success sparkle

The game should feel complete without relying on audio.

## 16. Content Design
### 16.1 Level design principles
Levels should:
- teach one thing at a time early
- create small “aha” moments often
- avoid requiring brute-force guessing
- reward deliberate observation
- remain visually readable

### 16.2 Level composition rules
- Keep the goal visible.
- Avoid cluttering too many obstacles in early levels.
- Introduce one new challenge variable at a time.
- Ensure intended solutions feel elegant.

### 16.3 Educational design note from self-review
The first version of the concept focused on general logic. On review, the educational value is strongest when the player can compare prediction vs outcome.

Therefore each failed run should make the reason for failure obvious. Examples:
- brief directional highlight of the wrong exit
- visual bonk at the collision point
- missing-link sparkle where the path breaks

This supports learning through debugging.

## 17. Difficulty Design
### 17.1 Difficulty levers
Difficulty should come from:
- fewer available tiles
- tighter board spaces
- more obstacles
- longer required sequences
- misleading but readable alternative paths

### 17.2 Difficulty levers to avoid in v1
Avoid relying on:
- hidden information
- timer pressure
- dexterity mechanics
- puzzle randomness
- visually ambiguous rules

## 18. Accessibility and Inclusion
### 18.1 Accessibility goals
- strong directional readability
- color should not be the only signal
- animation should be brief and non-essential
- UI should remain usable on laptop screens

### 18.2 Required accessibility supports
- arrows always reinforced by shape, not just color
- adjustable animation speed or “fast mode” for reruns
- high-contrast mode for grid and arrows if feasible
- optional path preview

### 18.3 Cognitive accessibility
- keep language minimal
- teach by interaction
- use clear iconography
- avoid penalizing repeated retries

## 19. Functional Requirements
### 19.1 Level system
- Load fixed handcrafted level data
- Store start, goal, obstacles, and tile inventory
- Support per-level par / rating targets

### 19.2 Board logic
- Place/remove/rotate tiles
- Validate legal placement
- Compute traversal path deterministically
- Detect success/failure states

### 19.3 UI system
- Main menu
- World/level select
- In-level board HUD
- Win screen
- Pause/settings overlay (minimal)

### 19.4 Persistence
- Save unlocked levels
- Save clover ratings per level
- Save simple settings

## 20. Technical Recommendations
### 20.1 Platform
Primary target: web desktop first.

Rationale:
- easiest for quick implementation and sharing
- well suited to puzzle interactions
- keeps scope controlled

### 20.2 Application architecture
Recommended implementation stack:
- React for UI and route structure
- **React Router using Remix.run-style principles**
- Canvas or a lightweight rendering layer for board and animation

Architecture expectations:
- use route modules with clear separation between UI, data loading, and mutations
- use **loaders** for server-side data fetching and level/config hydration
- use **actions** for server-side mutations such as saving progress, updating settings, and posting level-completion results
- prefer server-driven flows where they simplify state management
- keep the client responsive, but do not assume all important state must live only in the browser

Practical interpretation:
- the app should feel like a modern Remix-style web app even if implemented with React Router’s current data APIs
- routing, data loading, form submissions, and mutations should be structured so future server-side expansion is straightforward
- puzzle interaction can remain highly client-side during active play, while persistence and route-level data concerns use loader/action patterns

### 20.3 Server-side readiness
The project should be structured so server-side capabilities are built in from the start rather than bolted on later.

Server-side responsibilities should be easy to add or support for:
- level loading
- progress persistence
- save-game retrieval
- settings persistence
- analytics/event logging if later desired
- feature flags or gated future mechanics

Recommended boundary:
- gameplay simulation may begin client-side for speed of implementation
- route-level data, persistence, and mutation flows should follow loader/action patterns
- traversal logic should be written in a way that can be shared between client and server if validation or authoritative solve checking is needed later

### 20.4 Deployment target
The project should be prepared for deployment to **Google Cloud Platform (GCP)**.

Recommended baseline deployment posture:
- container-friendly application structure
- environment-based configuration
- production build process suitable for Cloud Run or a similar GCP hosting target
- static asset handling compatible with modern web deployment
- clean separation of runtime config and application code

Preferred first deployment target:
- **Google Cloud Run** for the web app/server runtime

Rationale:
- low operational burden
- good fit for a small full-stack React application
- easy path to server-side actions/loaders
- straightforward support for containerized deployment and future service integrations

### 20.5 GCP readiness requirements
The codebase should be organized so the following are easy to introduce or finalize:
- Dockerfile for production deployment
- environment variable configuration for secrets and runtime settings
- build/start commands appropriate for container execution
- optional backing persistence layer later (for example Firestore or Cloud SQL) without major route refactors
- static asset hosting strategy compatible with the chosen runtime
- logging compatible with GCP runtime expectations

For v1, persistence may remain simple, but the architecture should not block later migration to managed GCP services.

### 20.6 Data model
Levels should be defined in simple JSON-like configuration.

Suggested level fields:
- board size
- start position/direction
- goal position
- obstacles
- tile inventory
- par score / target clovers
- biome theme
- tutorial hint text if needed

### 20.7 Implementation guidance from self-review
A prior version of this section was too generic about the technical stack. This version intentionally narrows the implementation approach so the project is more build-ready.

Technical guidance now assumes:
- React Router data APIs
- Remix-style route conventions and mental model
- server-friendly boundaries from the outset
- deployment preparation for GCP, especially Cloud Run

This should reduce architecture drift and make the PRD more actionable.

## 21. Success Metrics
For a personal project, success should be measured by product quality more than scale.

### Product success indicators
- the game feels understandable within 30–60 seconds
- tile placement feels satisfying
- the learning loop of predict → run → revise is obvious
- visual style feels cohesive
- at least 20–32 levels feel genuinely complete

### Stretch indicators
- players replay for 3-clover solutions
- others describe it as “cute” and “polished”

## 22. Risks and Mitigations
### Risk 1: Cute theme but shallow gameplay
Mitigation: emphasize constrained tile counts and elegant level design.

### Risk 2: Asset inconsistency
Mitigation: normalize all assets to one perspective and material language.

### Risk 3: Overbuilding polish before proving the puzzle loop
Mitigation: validate the loop with minimal but readable assets first.

### Risk 4: Difficulty spikes
Mitigation: structure the campaign around single-concept teaching and careful level sequencing.

### Risk 5: Too much “game feel” work for the scope
Mitigation: choose a very small animation set and a limited effect library.

## 23. MVP Definition
The MVP should include:
- 12 handcrafted levels
- visible tilted grid board
- start, goal, obstacles
- straight / left / right tiles
- placement, removal, rotation
- run simulation
- win/fail states
- simple progression
- toy-like UI
- basic animations and particles
- React Router route structure using loader/action patterns where appropriate
- initial deployment-ready application structure for GCP

The MVP should **not** require:
- multiple advanced mechanics
- dozens of obstacles
- procedural generation
- elaborate narrative
- large asset variety
- premature introduction of complex cloud services beyond what is needed for deployment readiness

## 24. Full v1 Definition
The full v1 should include:
- 32 handcrafted levels across 4 worlds
- level select
- 3-clover optional rating system
- polished UI
- cohesive visual pass
- save progress
- optional preview mode
- accessibility settings for contrast and animation speed if feasible
- full React Router data-flow alignment for route loading and persistence actions
- deployment packaging ready for GCP Cloud Run

## 25. Future Expansion Opportunities
Not in v1, but reserved for later:
- teleport mushrooms
- one-way magic gates
- clover bonus collectibles
- moving hazards
- community levels
- mobile adaptation
- hint system

## 26. Open Decisions Resolved in This Version
The following decisions are considered locked for now:
- genre direction: puzzle-first, not programming-first
- visual direction: clean, shiny, toy-like
- character tone: adorable helper
- board: visible grid, slight isometric tilt
- tile communication: arrows
- progression: handcrafted campaign
- learning frame: implicit computational thinking
- audio dependency: none

## 27. Self-Review Pass 1 Summary
Changes made after initial draft review:
- added optional path preview to strengthen comprehension
- clarified accessibility and readability requirements
- reduced risk of visual ambiguity by reinforcing arrows by shape
- strengthened learning-through-debugging feedback requirements
- narrowed board size recommendations to keep level design cleaner

## 28. Self-Review Pass 2 Summary
Changes made after second review:
- separated MVP from full v1 to avoid overscoping
- clarified that progress gating is based on completion, not optimization
- reduced potential implementation drift by setting a firm v1 asset budget
- emphasized deterministic traversal logic and failure clarity
- added explicit non-goals to prevent accidental feature creep

## 29. Self-Review Pass 3 Summary
Changes made after adding implementation-platform requirements:
- specified React Router with Remix.run-style loader/action architecture
- clarified which responsibilities should be server-friendly from the beginning
- added GCP deployment readiness requirements with Cloud Run as the preferred first target
- updated MVP and full v1 definitions to include architectural and deployment preparedness
- reduced future refactor risk by requiring shared logic boundaries and environment-based configuration

## 30. Final Recommendation
Proceed by prototyping the **MVP board loop first** with placeholder but stylistically aligned assets, validate that the core feel is satisfying, then expand to the full v1 campaign only after the loop feels charming and readable.

At the codebase level, begin with a route and data architecture that already reflects React Router in a Remix.run style, with loaders and actions shaping how data and mutations flow. Package the project from the start so it can deploy cleanly to GCP, with Cloud Run as the default target.

The strongest expression of this game is not complexity. It is **clarity, charm, elegant puzzle design, and a deployment-ready full-stack foundation**.

