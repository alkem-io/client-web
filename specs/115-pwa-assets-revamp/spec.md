# PWA icon and splash assets

**Branch**: `115-pwa-assets-revamp` | **Issue**: [#10007](https://github.com/alkem-io/client-web/issues/10007)

The installed PWA showed a cropped logo on an unpredictable background, and iOS "Add to Home Screen" fell back to a screenshot of the page. This is a static-asset and metadata fix: no application code, no dependency, no build or infrastructure config. The only runtime code touched is one hard-coded icon path in `public/service-worker.js`, which changes the image a push notification displays.

## What was broken

| # | Defect | Effect |
|---|---|---|
| 1 | `manifest.json` declared the 192×192 icon as `"sizes": "128x128"` | Browsers trust the declaration, so the icon was rejected or rescaled |
| 2 | The 512×512 icon was declared `"purpose": "any maskable"` while being full-bleed — 130,356 pixels of the logo fell outside Android's safe circle | Android masks `maskable` icons to a circle and shaved the mark's edges |
| 3 | Every install icon was transparent (182,236 translucent pixels in the 512×512) | Platforms composited it against their own backdrop; iOS uses black |
| 4 | `<link rel="apple-touch-icon">` was commented out in `index.html`, and pointed at `logo192.png` — 225×137, not square | iOS installed a screenshot of the page instead of an icon |
| 5 | `public/site.webmanifest` — empty `name`, added 2021, never referenced by any file in any commit | Contradicted the real manifest's `theme_color`; made two other dead files look used |
| 6 | `index.html` and `manifest.json` said `theme_color: #000000`; the dead manifest said `#ffffff` | A black status bar framing a white splash |

Transparency (#3) is a real defect but is **not** what cropped the icon. Adding a white background alone would have left #1 and #2 in place and shipped a still-broken icon that merely looked different.

## Acceptance criteria

| ID | Criterion | Closes | Verified by |
|---|---|---|---|
| AC-1 | Every declared icon's `sizes` equals its true pixel dimensions | #1 | DevTools → Application → Manifest, no size warnings |
| AC-2 | A `maskable` icon exists and its logo lies inside the centred circle of 80% diameter | #2 | DevTools "minimum safe area for maskable icons"; Android install |
| AC-3 | No icon declares the combined `"any maskable"` purpose | #2 | `manifest.json` review |
| AC-4 | Every install icon is opaque and square | #3 | iOS install shows no black backdrop |
| AC-5 | `index.html` declares a square `apple-touch-icon` | #4 | iOS "Add to Home Screen" shows an icon, not a screenshot |
| AC-6 | Exactly one manifest exists and the app references it | #5 | `manifest.json` is the only manifest under `public/` |
| AC-7 | `theme_color` agrees between `index.html` and `manifest.json` | #6 | Both read `#ffffff` |
| AC-8 | A standard installability audit reports no icon, size, or purpose findings | all | Lighthouse → PWA |

Each is checked in [Verifying a change](#verifying-a-change).

## Constitution check

Assessed against `.specify/memory/constitution.md`. **Result: PASS**, no violations, no mitigations required.

| Principle / Standard | Applies | Outcome |
|---|---|---|
| I. Domain-Driven Frontend Boundaries | No | No domain logic; nothing under `src/domain` or `src/core` |
| II. React 19 Concurrent UX Discipline | No | No React component created or modified |
| III. GraphQL Contract Fidelity | No | No schema change, no codegen; Workflow §2 is a no-op |
| IV. State & Side-Effect Isolation | No | No client state, no effects, no DOM manipulation |
| V. Experience Quality & Safeguards | Yes | No new interactive element, so no new WCAG surface. Install evidence on three platforms is attached to the PR per Workflow §4 |
| Arch §2 — CRD is the only design system | No | Nothing under `src/crd/`; no `@mui/*` or `@emotion/*` import added |
| Arch §3 — i18n | No | No user-visible string added or changed; the manifest `name` is untouched |
| Arch §4 — Deterministic build artefacts | Yes | `vite.config.mjs`, `Dockerfile`, `nginx.conf` unchanged. Chunking and env exposure unaffected |
| Arch §5 — No barrel exports | No | No new module |
| Arch §6 — SOLID / DRY | Yes | One artwork backs both icon purposes rather than a near-identical duplicate |
| Workflow §5 — Root cause before fixes | Yes | Each defect above is established with file-and-line evidence, two of them quantified by measurement, before any fix |

## What changed

**Icons** — `public/icons/`, three files, all downscaled from one supplied master:

- `icon-512.png` and `icon-192.png`. Each is declared **twice** in the manifest, once `purpose: "any"` and once `purpose: "maskable"`.
- `apple-touch-icon.png` — 180×180, for iOS.

All opaque, white-backed, square, with declared sizes matching true pixel dimensions and the logo at a consistent 72.5% of the width.

**`public/manifest.json`** — four icon entries over the two files; `theme_color` and `background_color` both `#ffffff`; favicon entries removed (icons under 192px are ignored by install prompts).

**`index.html`** — `apple-touch-icon` link restored and repointed; `theme-color` set to `#ffffff`; explicit `<link rel="icon">` tags added for the 16×16 and 32×32 favicons so they are not orphaned by their removal from the manifest.

**`public/service-worker.js`** — push `icon` and `badge` repointed off the deleted `android-chrome-192x192.png`. A path update; the push assets are owned by `specs/023-pwa-push-notifications`.

**Deleted**, each verified unreferenced first: `site.webmanifest`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, `apple-touch-icon.png` (orphan), `logo192.png` (non-square).

**Untouched**: `Dockerfile`, `.build/docker/env.sh`, `.build/.nginx/nginx.conf`, `vite.config.mjs`. The favicon family keeps its transparent artwork so it still reads on dark browser tabs. One icon set serves every environment.

## Caching

`nginx.conf` serves every `.png` with `Cache-Control: public, immutable` and a one-year `max-age`. That is a promise the bytes behind a URL never change, and it has two consequences.

**This change is safe.** The icons live at new paths under `/icons/`, so no client holds an `immutable` copy of them, and the correct artwork is fetched fresh. The old filenames are deleted rather than retained for stale clients: anyone holding them will not revalidate anyway, an installed app caches its icon bitmap at install time and never refetches, and the old files are the broken artwork.

**Future replacements are not safe under the same path.** Overwriting `public/icons/icon-512.png` breaks the `immutable` promise: a client that fetched the old bytes keeps them for up to a year, so a user who visited before the swap and installs after it gets the stale icon. **When the artwork changes, change the filenames too** — `icon-512.v2.png` or a content hash — and update the three places that reference them: `public/manifest.json`, `index.html` (the `apple-touch-icon` link), and `public/service-worker.js` (the push `icon` and `badge`). This is what makes the present change correct, and it is not optional next time.

`manifest.json` needs no such care. It is not matched by the static-asset regex (no `json` in that list), so it is served with no `Cache-Control` — but with `Last-Modified` and `ETag`, and a conditional request returns `304`. Heuristic freshness is proportional to the response's age, near zero on a fresh deploy, so browsers revalidate rather than hold a stale manifest.

## Two things to know before touching the icons again

**Fitting the square is not fitting the circle.** Android masks `maskable` icons to a centred circle of 80% diameter — a radius of 204.8px on a 512px canvas. A master can look correctly padded and still overshoot: one earlier revision had a logo bounding radius of 208.4px, invisible to the eye and enough for Android to shave the mark. The current master measures 185.7px and clears it comfortably. Before replacing the artwork, check it at <https://maskable.app/editor>, or measure the logo's bounding radius against a centred 410px circle.

**One file backs both purposes only because the mark is round.** A square mark inscribed in the 80% circle spans just ~56% of the width, and platforms that never mask — desktop Chrome, iOS, older Android — would render it as a small logo adrift in dead space. That is why two files are the usual advice. The Alkemio mark inscribed in the circle still spans 72.5%, which is how a normal unmasked icon is framed, so a separate maskable file would be a near-identical duplicate. **If the mark ever becomes square, split the files**: inset the master for `maskable`, keep the original for `any`.

The combined `"any maskable"` purpose string is what let full-bleed artwork claim maskability without anyone checking. Keep the purposes as separate entries.

## Verifying a change

```bash
pnpm start                       # DevTools → Application → Manifest: 4 entries, no warnings   (AC-1, AC-3)
                                 # tick "Show only the minimum safe area for maskable icons"   (AC-2)
```

Then install on Android Chrome (mask clips nothing, splash has no seam — AC-2), iOS Safari (a real icon, not a screenshot, not on black — AC-4, AC-5), and desktop Chrome. Confirm `theme_color` matches between `index.html` and `manifest.json` (AC-7), and that `public/manifest.json` is the only manifest present (AC-6). Lighthouse → PWA must report no icon, size, or purpose findings (AC-8).

## Deriving icons from a new master

Design supplies one square PNG: opaque white background, 1024×1024 preferred (512×512 minimum), logo framed at roughly 80% of the width.

Rescale rather than copy — a 1024×1024 master copied straight to `icon-512.png` would be declared `512x512` in the manifest while being 1024×1024, which is defect #1 all over again. And per [Caching](#caching), give the new files new names.

```bash
sips -z 512 512 master.png --out public/icons/icon-512.png
sips -z 192 192 public/icons/icon-512.png --out public/icons/icon-192.png
sips -z 180 180 public/icons/icon-512.png --out public/icons/apple-touch-icon.png
```

If the master overshoots the safe circle, inset it first. `--padColor FFFFFF` is mandatory — without it `sips -p` pads with *transparent* pixels, which iOS composites onto black, reintroducing defect #3 by another route:

```bash
sips -z 500 500 master.png --out /tmp/inset.png        # 500 comes from the measurement
sips -p 512 512 --padColor FFFFFF /tmp/inset.png --out public/icons/icon-512.png
```
