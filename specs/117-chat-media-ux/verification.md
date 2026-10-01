# Verification: chat media UX (#10363)

Executed 2026-10-01 on the integrated branch `feat/10363-chat-media-ux`
(`2e576ee17` + `b53fbf14d`, `330e76df5`, `a5d703e7d`, `6b46011fa`). Every
result below was run; anything not run is listed under **Not verified**.

## Environment

- Stack from a fresh detached checkout of server#6568 (`1d758600b`; `71cc844e2`
  is `.gitignore`-only) with the repository's `start:services` command and no
  overrides: Synapse 1.132.0, matrix-adapter v0.8.21, file-service v0.3.1.
  Alkemio server = develop (`615817441`) code on Node 22.21.1.
- Client = this branch on the pinned Node 24.14.0 / pnpm 10.17.1, served at
  `http://localhost:3000` (same origin as the API, as in production).
- Google Chrome 154 headless via Playwright 1.57; real login for two users
  (`qa-alpha`, `qa-beta`); Element Web at `:8090` for the Element side.
- Run A = released file-service **v0.3.1**. Run B = file-service **#99
  candidate** (`5ee13c555`, built locally from a fresh checkout, swapped for
  file-service only, then reverted). Run B is a pending-PR test, not a release.

## Automated checks

On head `6b46011fa`, Node 24.14.0: `pnpm lint` exit 0; `pnpm vitest run`
476/476 files, 4 205 tests passed, 2 skipped.

Which head each browser result ran on: composer, Element → web and Run A on
the final head `6b46011fa`; Run B on `330e76df5` (before the two renderer
follow-ups), with the HEVC fallback then re-run on `6b46011fa` against the
Run B stack. The follow-ups touch only `MessageAttachments`.

## Composer (real Chrome, native CDP drag with real files, real Ctrl+V)

| Check | Result |
|---|---|
| Visible "Drop files to attach" target during dragover | pass |
| Dropped image staged exactly once; page did not navigate | pass |
| Pasted image added once; existing draft text unchanged | pass |
| Text paste appends to the draft and adds no file | pass |
| Staged files listed by filename; remove works | pass |
| Send: one upload per file, only confirmed items cleared | pass |
| Sent images render (naturalWidth 1280 / 800) and survive reload | pass |
| 11 dropped → 10 kept + "up to 10 files" | pass |
| 50 MiB + 1 B rejected; `text/plain` rejected | pass |
| Guidance thread (attachments disabled): drop and image paste stage nothing, no navigation; text paste works | pass |
| Upload failure keeps unsent items staged ("Send was not confirmed") | pass (observed while the stack's Synapse could not write media) |

## Both directions (byte identity)

- **Web → Element**: images sent from the web download in Element with the same
  SHA-256 as the persisted Alkemio attachment (`e34b9653…` 51 113 B,
  `8b5fce51…` 4 003 B) and the exact Unicode filename. Web images are processed
  on upload by design, so the comparison is against persisted bytes.
- **Element → web** (13/13): Element's JPEG renders and downloads as the source
  bytes (44 894 B). H.264 (index first and last) and VP9 videos render as native
  players with `preload="none"` and `playsinline`, make no request before play,
  play with a picture (640 px, 91–93 decoded frames) and download as the source
  bytes. The HEVC `.mov` Element sent as `m.file` renders as a video and falls
  back (below).

## Rendering

| Check | Run A (v0.3.1) | Run B (#99) |
|---|---|---|
| No video request before user action | pass | pass |
| H.264 / VP9 play inline with a picture | pass | pass |
| HEVC `.mov` (no decodable picture) → hint + download | pass | pass (re-run on `6b46011fa`, finished 02:01:53Z; file-service recreated back to v0.3.1 at 02:02:08Z) |
| Unavailable video (document 404) → hint + download | pass | pass |
| Image download: exact persisted bytes, exact Unicode name, image not opened | pass | pass |
| Image click still opens the image | pass | pass |
| Video download while playing: source bytes, exact name, playback not toggled | pass | pass |
| Overlay top-right, clear of the controls bar | pass | pass |
| Overlay hidden idle / shown on hover (hover device) | pass | pass |
| Keyboard: reachable, opacity 1, focus ring; Enter downloads without opening | pass | pass |
| Touch (`hover: none`): overlay visible; tap downloads without opening | pass | pass |

### Range and seeking

| | Run A (v0.3.1) | Run B (#99) |
|---|---|---|
| `Range: bytes=0-99` on the authorized URL | 200, full body | 206, `bytes 0-99/<size>`, 100 B |
| `video.seekable` | `[[0,0]]` | `[[0,150]]` |
| Seek to 140 s of 150 s before buffering (≈2.4 Mbit/s) | lands at 0, restarts | lands at 140 s in 1.9 s, keeps playing |
| Seek inside already-buffered data | lands at 0 | — |

Without Range support Chrome treats the media as an unseekable stream: every
seek returns to 0:00, including within fully downloaded data.

## Observations (not defects of this change)

- With `preload="none"`, Chromium's native player shows no centre play button;
  a click on the video surface does not start playback, while the ▶ in the
  control bar and Space do. Reproduced with a bare `<video>` outside the app.
- Pre-existing server behaviour seen during QA: an upload failure shows the raw
  backend message plus a mislabelled "Matrix entity not found" toast; the server
  process exits when RabbitMQ restarts underneath it.

## Not verified

- **Physical iOS Safari**: no device available. Apple requires byte-range
  support for video, so iOS playback depends on file-service#99.
- Run B used a locally built candidate; file-service#99 is not merged or
  released.
