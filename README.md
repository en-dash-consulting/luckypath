# Lucky Path

A puzzle game where you guide a leprechaun named Lucky to a pot of gold by placing path tiles on a grid. Think of it as a chill, tile-laying brain teaser — part puzzle, part luck of the Irish.

**Play it now:** [luckypath.endash.us](https://luckypath.endash.us)

## How it works

You get a handful of path tiles — straights and curves — and a grid with a start point and a goal. Place and rotate tiles to build a connected path from Lucky to the gold. Hit Go and watch him walk it. If he makes it, you're golden (literally). If not, pull up some tiles and try again.

- 12 handcrafted levels across 2 worlds
- Two tile types: straight and curve, each rotatable
- Par scoring with a clover rating system
- Progress saved locally

## Dev setup

```bash
npm install
npm run dev
```

Runs at `http://localhost:5173`.

## Stack

- React Router v7 (framework mode w/ SSR)
- HTML5 Canvas for the game board
- Tailwind CSS v4
- TypeScript
- Deployed to Google Cloud Run

## Deploy

Pushes to `main` auto-deploy via GitHub Actions.

---

Built by [En Dash](https://endash.us)
