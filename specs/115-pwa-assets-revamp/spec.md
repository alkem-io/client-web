# PWA icon and splash assets

**Branch**: `115-pwa-assets-revamp` | **Issue**: [#10007](https://github.com/alkem-io/client-web/issues/10007)

The installed PWA showed a cropped logo on an unpredictable background, and iOS "Add to Home Screen" fell back to a screenshot of the page. This is a static-asset and metadata fix: no application code, no dependency, no runtime behaviour.

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

## What changed

**Icons** — `public/icons/`, three files derived from one supplied master:

- `icon-512.png`, `icon-192.png` — the master as delivered. Each is declared **twice** in the manifest, once `purpose: "any"` and once `purpose: "maskable"`.
- `apple-touch-icon.png` — 180×180 downscale, for iOS.

All opaque, white-backed, square, with declared sizes matching true pixel dimensions.

**`public/manifest.json`** — four icon entries over the two files; `theme_color` and `background_color` both `#ffffff`; favicon entries removed (icons under 192px are ignored by install prompts).

**`index.html`** — `apple-touch-icon` link restored and repointed; `theme-color` set to `#ffffff`; explicit `<link rel="icon">` tags added for the 16×16 and 32×32 favicons so they are not orphaned by their removal from the manifest.

**`public/service-worker.js`** — push `icon` and `badge` repointed off the deleted `android-chrome-192x192.png`. A reference update only; the push assets are owned by `specs/023-pwa-push-notifications`.

**Deleted**, each verified unreferenced first: `site.webmanifest`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, `apple-touch-icon.png` (orphan), `logo192.png` (non-square).

**Untouched**: `Dockerfile`, `.build/docker/env.sh`, `.build/.nginx/nginx.conf`, `vite.config.mjs`. The favicon family keeps its transparent artwork so it still reads on dark browser tabs. One icon set serves every environment.

Nginx needs no change. `manifest.json` is not matched by the static-asset regex (no `json` in that list), so it falls through and is served with no `Cache-Control` — but with `Last-Modified` and `ETag`, and a conditional request returns `304`. Heuristic freshness is proportional to the response's age, which is near zero on a fresh deploy, so browsers revalidate rather than hold a stale manifest. The icons keep `public, immutable` for a year, which is correct: their paths are new, so old caches cannot collide, and the bytes behind a given path never change.

## Two things to know before touching the icons again

**Fitting the square is not fitting the circle.** Android masks `maskable` icons to a centred circle of 80% diameter — 410px on a 512px canvas. A master can look correctly padded and still overshoot: one earlier revision had a bounding radius of 208.4px against a safe radius of 204.8px, invisible to the eye and enough for Android to shave the mark. The current master measures 199.7px and clears it. Before replacing the artwork, check it at <https://maskable.app/editor>, or measure the logo's bounding radius against a centred 410px circle.

**One file backs both purposes only because the mark is round.** A square mark inscribed in the 80% circle spans just ~56% of the width, and platforms that never mask — desktop Chrome, iOS, older Android — would render it as a small logo adrift in dead space. That is why two files are the usual advice. The Alkemio mark inscribed in the circle still spans 78%, which is how a normal unmasked icon is framed, so a separate maskable file would be a near-identical duplicate. **If the mark ever becomes square, split the files**: inset the master for `maskable`, keep the original for `any`.

The combined `"any maskable"` purpose string is what let full-bleed artwork claim maskability without anyone checking. Keep the purposes as separate entries.

## Verifying a change

```bash
pnpm start                       # DevTools → Application → Manifest: 4 entries, no warnings
                                 # tick "Show only the minimum safe area for maskable icons"
```

Then install on Android Chrome (mask clips nothing, splash has no seam), iOS Safari (a real icon, not a screenshot, not on black), and desktop Chrome. Lighthouse → PWA must report no icon, size, or purpose findings.

## Deriving icons from a new master

Design supplies one square PNG: opaque white background, 1024×1024 preferred (512×512 minimum), logo framed at roughly 80% of the width.

```bash
cp master-512.png public/icons/icon-512.png
sips -z 192 192 public/icons/icon-512.png --out public/icons/icon-192.png
sips -z 180 180 public/icons/icon-512.png --out public/icons/apple-touch-icon.png
```

If the master overshoots the safe circle, inset it first. `--padColor FFFFFF` is mandatory — without it `sips -p` pads with *transparent* pixels, which iOS composites onto black, reintroducing defect #3 by another route:

```bash
sips -z 500 500 master-512.png --out /tmp/inset.png     # 500 comes from the measurement
sips -p 512 512 --padColor FFFFFF /tmp/inset.png --out public/icons/icon-512.png
```
