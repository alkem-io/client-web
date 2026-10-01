# Chat media UX: drop and paste images, inline videos, download controls

**Story**: [client-web#10363](https://github.com/alkem-io/client-web/issues/10363) · **Release**: 77 · **Branch**: `feat/10363-chat-media-ux`
**Builds on**: conversation attachments (alkem-io/alkemio#1946, client-web#10330)

## Requirements

1. **Drop images.** Dropping image files on the chat composer adds them to the
   current attachment draft. A visible drop target shows while files are dragged
   over the composer; the browser does not navigate on a handled drop. Staged
   files are reviewed by filename and can be removed before sending.
2. **Paste images.** Pasting an image while the composer has focus adds it once
   to the same draft, via the `paste` event (no clipboard-permission flow).
   Ordinary text paste and the existing draft text are unchanged.
3. **Play videos inline.** Video attachments from Alkemio and from Element render
   with native browser controls, start only on user action, play inline on
   mobile (`playsInline`), and are not fetched before the user plays them
   (`preload="none"`). Unsupported or unavailable media falls back to a clear
   hint and a download link.
4. **Download displayed media.** Images and videos carry a small, contrasting
   download button at the top right, revealed on hover and keyboard focus and
   always visible on devices without hover. It has an accessible name and a
   visible focus state, stays clear of the video controls, and neither opens the
   image nor toggles playback. Downloaded bytes and filename are correct.

## Boundaries

- Picker, drop and paste feed the existing draft, upload/send path, validation,
  limits and permissions. Failed-send retry and draft disposal are unchanged;
  the existing image-opening link is kept.
- Drop and paste are active only where the composer accepts attachments
  (`attachmentsEnabled` + `onAttachFiles`, i.e. chat). Comments are unaffected
  (comment images are #10357).
- Native `<video>` controls and browser-supported formats only: no transcoding,
  no fetching media into JavaScript memory, no storage or permission changes.
- The download filename comes from the `download` attribute on a same-origin
  document URL. Production serves the web client and
  `/api/private/rest/storage` from one host; the media response is
  `Content-Disposition: inline` without a filename.

## Implementation and ownership

| Part | Owner | Commits (integrated with `cherry-pick -x`) |
|---|---|---|
| Composer drop/paste (`CommentInput`, `space` i18n) | dev1 | `1ee6a88f5` |
| Inline video, fallback, download overlay (`MessageAttachments`, `common` i18n) | dev2 | `cf21bf4b1`, `a2d2df7b8`, `cbec06cdb` |
| Integration, real-browser QA, this record | Claude | — |
| Design decisions and final gate | architect | — |

## Delivery dependencies (not prerequisites of this change)

- **file-service#99** (HTTP Range on the public document route) must be deployed
  for video seeking in any browser and for iOS Safari playback. Without it
  Chrome treats media as an unseekable stream and every seek returns to 0:00
  (see [verification](verification.md)).
- **server#6568** (quickstart pins + Synapse media directory) fixes the local
  dev stack only.
- **server#6570** (classify conversation buckets by their direct owner) corrects
  a pre-existing attachment policy defect found during this QA.
