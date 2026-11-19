![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)
![rank](https://make.fun/badge/gta6-trophy-guide-01/Dilslino/gta6-trophy-guide-01-entry/rank.svg)
![reward](https://make.fun/badge/gta6-trophy-guide-01/Dilslino/gta6-trophy-guide-01-entry/reward.svg)

# Vice City Trophy Atlas — GTA 6 Trophy Guide & Tracker

An entry for the [make.fun bounty "Build the best GTA 6 trophy guide"](https://make.fun/bounty/gta6-trophy-guide-01?ref=5548afh3).

A map + guidebook for all **55 GTA 6 trophies** (1 Platinum, 2 Gold, 6 Silver, 46 Bronze) on PlayStation 5 — not a plain table. A neon Vice City dashboard with a live Platinum progress ring, a searchable/filterable trophy grid, a step-by-step guide with cited sources for every trophy, a four-phase roadmap to the Platinum (~200 hours, 4/10), and a missable wall: only **one** trophy can be missed, and the wall says exactly which one and before what point.

## What it does

- **Platinum summary on top** — progress ring, grade counts, ~200 h estimate, 1 missable, 0 online.
- **Trophy grid** — every card shows its own grade icon, the official name and description, MISSABLE / STORY-SPOILER / UNCONFIRMED badges, difficulty, time, a checklist tick and a Guide button.
- **Detail panel per trophy** — step-by-step guide in our own words, tips, and source citations (PowerPyx, GTA Zone, WikiGTAVI, GTAScoop, OutputLag) with links.
- **Roadmap** — Story → Side → Collectibles → Cleanup, with the suggested order and missable warnings per phase.
- **Missable wall** — the complete list (one trophy) plus the manual-save safety net, since there is no mission replay.
- **Interactive, fully offline** — search, filters (grade, kind, missable only, earned/unearned, spoiler hide), sort (roadmap, grade, difficulty, name), checklist saved in localStorage with progress per category, export/import progress as JSON, spoiler toggle that blurs story trophies until earned.

## Run it

```sh
node serve.ts   # then open http://localhost:8080
```

No build step, no network calls, system fonts only. Hand it in with `MAKEFUN_OUTPUT_DIR=out node main.ts`.

## Data & method

Names, descriptions and grades are the official list as published 18 November 2026 (`app/data/trophies.json`). Guides are written in our own words; each trophy cites its sources — a source is cited, never copied. Five trophies are marked *unconfirmed*: the guides have not yet pinned down their exact triggers, and the app says so. No Rockstar logo, artwork or game screenshot is used anywhere.
