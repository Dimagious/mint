# MINT — launch copy

Ready-to-use posts for the launch. All texts are short enough to paste as-is. Replace `[handle]` placeholders with the actual social handles when posting.

---

## X / Twitter — short post

> Every "lightweight Canva alternative" wants my email.
>
> So I built one that doesn't. Browser-only, no account, no upload. PNG export in ~60 seconds.
>
> React 18 + Fabric.js + Zustand, monorepo, MIT.
>
> → https://dimagious.github.io/mint/

Attach: `docs/design/after-02-desktop-with-text.png`.

---

## X / Twitter — thread (5 tweets)

**1/5** — opener

> I drafted a lot of small social images and got tired of every "lightweight Canva alternative" gating exports behind an email + a free trial countdown.
>
> So I built MINT — a browser-only image editor that closes the loop in ~60 seconds. No upload, no account.

**2/5** — feature shot

> Drop a photo. Type the headline. Hit Export.
>
> 1080×1080, 1080×1350, 1080×1920 — the three formats anyone actually posts in. PNG, JPEG, WebP. With a live preview and a 1× / 2× scale toggle.
>
> [attach `after-03-desktop-export-dialog.png`]

**3/5** — engineering

> The fun part was building the bridge between Fabric.js (which owns the visual representation) and Zustand (which owns the source of truth).
>
> A thin `FabricAdapter` translates store mutations into canvas operations, and selection/drag events back into store actions.
>
> [attach `after-02-desktop-with-text.png`]

**4/5** — niceties

> - Smart Contrast samples the background under each text layer and picks a readable colour + stroke in one click.
> - Drag-to-reorder layers (keyboard-accessible).
> - Mobile-first: pull-down-to-dismiss drawers.
> - EN / RU UI in parity.
>
> [attach `after-06-mobile-properties-drawer.png`]

**5/5** — links

> Live: https://dimagious.github.io/mint/
> Source: https://github.com/Dimagious/mint
> MIT, no telemetry, no analytics, no upsell.
>
> Feedback and PRs welcome — building this was the most fun I've had in months.

---

## LinkedIn

> **I built a no-upload, no-account image editor — and learned three things about state on a canvas.**
>
> Every time I tried to draft a social image — a post cover, a story slide, a side-project announcement — every "lightweight Canva alternative" wanted my email, my project saved to their cloud, and a Pro upsell.
>
> So I spent some weekends building MINT — a browser-only image editor that does one thing, fast: drop a photo, type the headline, hit Export. Nothing leaves the browser.
>
> Three things I learned along the way:
>
> 1. **Canvas is state, not DOM.** Fabric.js owns the visual representation; Zustand owns the source of truth. A thin `FabricAdapter` translates store mutations into canvas operations and selection/drag events back into store actions. It took a few rewrites to land on this — once it clicked, the rest of the editor fell into place.
> 2. **Design before code, even for a pet.** I wrote a real design brief — visible in the repo at `docs/design/BRIEF.md` — before the redesign pass. Screenshots before/after, hard constraints, an acceptance checklist. The redesign PR matched the brief, not my mood.
> 3. **i18n on day two.** Adding `react-i18next` early was cheap; adding Russian to a polished UI later would have hurt. Both `en.json` and `ru.json` ship in parity.
>
> Tech: React 18, TypeScript, Vite 6, MUI v6, Fabric.js, Zustand, dnd-kit, Playwright. pnpm workspaces (core / editor / ui / utils). MIT.
>
> Try it → https://dimagious.github.io/mint/
> Source → https://github.com/Dimagious/mint
>
> #frontend #react #typescript #opensource

Attach the desktop hero shot and the mobile shot side by side.

---

## dev.to article — hook and outline

**Title:** I built a browser-only social image editor (React + Fabric.js + Zustand) — here's what state management on a canvas actually looks like

**Hook (first paragraph that lands above the fold):**

> When you put a canvas into a React app, your canvas library and your state library will fight over who owns the truth, and you have to make a choice. This post is about the choice I made and how the editor fell into place once I committed to it.

**Outline:**

1. **The problem** — drafting a single Instagram post takes longer than writing it. Most "lightweight Canva alternatives" gate the export. I wanted a 60-second loop.
2. **The shape of the editor** — three presets, text layers, smart contrast, browser-only, MIT. Skip the marketing.
3. **The fight over the truth.** Two viable architectures: store-as-source-of-truth (canvas reflects the store), or canvas-as-source-of-truth (store is a serialization of the canvas state). I picked the first; here's why.
4. **The adapter pattern that made it work.** A single `FabricAdapter` class with `syncDocument(doc, selectedLayerId)`, `setCallbacks(onSelectionChange, onObjectModified)`, and `getExportDataUrl(preset, format, quality)`. The rest of the app never touches fabric.
5. **The hard parts.**
   - Async background loads with a race-guard.
   - Coalescing slider drags into one undo entry.
   - Free-positioning text in a fixed-size export canvas.
   - Smart Contrast: sample the canvas under the layer, compute luminance, pick a colour + stroke.
6. **What I'd do differently.** Probably skip the command pattern for a smaller history-as-an-array-of-doc-snapshots approach with structural sharing — undo is now a 100-entry array of commands, but the user only ever cares about the document state.
7. **Try it / source / MIT.**

Word count target: 1500–2000.
Code samples: 6–8, none longer than 12 lines.
Final image: `after-02-desktop-with-text.png` as the cover.

---

## Product Hunt — short pitch (Tuesday/Wednesday slot)

**Tagline:** _Make social images in your browser. No upload, no account._

**Description:**

> MINT is a browser-only image editor for the kind of social images you draft every week: post covers, story slides, side-project announcements. Drop a photo, type the headline, hit Export. PNG / JPEG / WebP, three social presets, smart contrast, undo/redo with drag-to-reorder layers, EN/RU.
>
> Browser-only and MIT — no account wall, no project folders, no Pro upsell, no telemetry.

**Categories:** Design Tools · Productivity · Developer Tools

**Maker comment (first reply on launch day):**

> I built this because I got tired of every "lightweight Canva alternative" gating exports behind a free-trial countdown. It's MIT and runs entirely in your browser — happy to answer any questions about the stack (React 18 / Fabric.js / Zustand) or the design choices.

---

## Pinned-repo profile README — paragraph

If pinned on the GitHub profile:

> **MINT** — _Make social images in your browser. No upload, no account._ React 18 + Fabric.js + Zustand monorepo. Drop a photo, type a headline, export a PNG/JPEG/WebP in ~60 seconds. EN/RU. MIT.

---

## Loom video — 15-second script

(Captions are the audio.)

> 0:00 — Open MINT. The empty canvas shows the first-run hint.
> 0:02 — Drag a photo onto the canvas. Background lands.
> 0:05 — Click Add Text. Type a headline.
> 0:08 — Hit Smart Contrast. Text reads white with a soft stroke.
> 0:12 — Hit Export. PNG downloads.
> 0:14 — That's it. No account. Source on GitHub.

Filming setup: 1280×800 viewport, Chrome, MINT loaded at the live URL. Use the coffee photo from `docs/design/screenshots-src/coffee.jpg` so the result matches the README hero.

---

## Notes for posting

- Pin a comment on the X post with the source link — Twitter throttles outbound links in the main post.
- LinkedIn first, then Twitter, then dev.to, then PH — that order avoids cannibalising your own algorithmic reach.
- Wait a day between LinkedIn and the dev.to article.
- Don't post on a Friday afternoon — Tuesday / Wednesday morning gets better reach.
- Reply to every comment in the first hour. The algorithms watch reply velocity.
