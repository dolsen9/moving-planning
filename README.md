# Moving Inventory

A small React app for tracking what's coming with you on a move, and estimating
how many U-Haul U-Box pods you'll need based on real cubic-footage estimates.

## Run it

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

## How it works

- `src/App.jsx` is the whole app — one component, inline styles, no extra
  libraries beyond `lucide-react` for icons.
- Items are stored in the browser's `localStorage` (key: `moving-inventory-items-v1`),
  so your list persists across reloads but is local to whichever browser you use it in.
- `POD_CAPACITY_CUFT` / `PACKING_EFFICIENCY` at the top of `App.jsx` control the
  pod-size math: a U-Box is rated for 257 cu ft, but real-world packing rarely
  hits 100%, so the app uses ~75% as a realistic usable capacity.
- `PRESETS` is the quick-add list of common furniture with ballpark cu ft values.
- `REAL_ITEMS` is the specific batch of items already researched from actual
  product links (sofa, chairs, stools, rugs, TV stands, mattress, bed frame) —
  tap "Load items" in the app to drop them all in at once.

## Picking this up in Claude Code

This was originally built as a Claude.ai artifact and ported to a standalone
Vite project so it can run outside the chat. A few things worth knowing if you
ask Claude Code to keep building on it:

- The original artifact used a sandbox-only `window.storage` API; this version
  uses plain `localStorage` instead, so it behaves like a normal web app.
- There's no backend — if you want the list to sync across devices, persist
  through reinstalls, or be shareable, that's the natural next step (e.g. a
  small SQLite/Postgres backend, or a hosted KV store).
- No tests or build tooling beyond Vite's defaults — add what you need.

Good next prompts for Claude Code:
- "Add a way to export/import the item list as JSON"
- "Deploy this to Vercel/Netlify"
- "Add persistence with a small backend instead of localStorage"
- "Let me edit an item's name and cu ft inline, not just quantity"
