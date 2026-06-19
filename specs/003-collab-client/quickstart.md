# Quickstart — client-web unified collaboration provider (WS-D)

How to develop and verify the client slice against a local `collaboration-service`.
**Implementation is blocked** on the Clarifications (OPEN-1..4) and the
`@alkemio/excalidraw-yjs-binding` publish; this quickstart is the validation plan
the work will follow.

## Prerequisites

- A running `collaboration-service` (epic WS-C). Standalone, zero-dep mode:
  ```bash
  # in collaboration-service/
  export PORT=4006 FANOUT_MODE=inmemory BLOB_STORE=inline AUTH_MODE=open
  make run
  # connect target: wss://localhost:4006/collab/<documentId>?type=memo|whiteboard
  ```
- client-web on `feat/003-unify-collab-yjs`, deps installed (`pnpm install`).
- Point the (consolidated) collab env at the local service — until D6 lands, set
  both legacy memo + whiteboard collab vars to the same `collaboration-service`
  origin:
  ```
  VITE_APP_COLLAB_DOC_URL=ws://localhost:4006   VITE_APP_COLLAB_DOC_PATH=/collab
  VITE_APP_COLLAB_URL=ws://localhost:4006        VITE_APP_COLLAB_PATH=/collab
  ```

## Build / lint / test

```bash
pnpm install
pnpm typecheck     # tsc — must be green (esp. after the excalidrawAPI→onExcalidrawAPI rename)
pnpm lint          # eslint
pnpm test          # vitest unit/integration
pnpm build         # vite production build
```

## Manual verification — Memo (T001/T002, unblocked)

1. Open a memo in two browser sessions (or two profiles) against the local service.
2. **Convergence (US2)**: type concurrently in the same paragraph → both
   insertions survive, intention-preserving, on both sessions.
3. **Presence/footer (US2)**: both users' avatars appear in `MemoCollabFooter`;
   `memberCount` is correct; a user closing the tab disappears (no ghost — the
   server force-evicts awareness).
4. **Save indicator**: after edits settle (~500 ms server debounce) the saved
   indicator updates (driven by the `saved` control, carrying `version`).
5. **Read-only (US2/SC-007)**: open as a viewer (no update-content grant) → editor
   is read-only, footer shows a read-only reason (generic until OPEN-1 supplies a
   reason field).
6. **Reconnect (US5)**: kill the WS (devtools offline), edit, restore → offline
   edits merge with server-side edits; awareness repopulates.

## Manual verification — Whiteboard (T003/T004, BLOCKED on binding publish)

1. Bump `@alkemio/excalidraw` + add `@alkemio/excalidraw-yjs-binding` once published.
2. Confirm the build is green after `excalidrawAPI`→`onExcalidrawAPI`
   (`ExcalidrawWrapper.tsx:202`, `CollaborativeExcalidrawWrapper.tsx:289`).
3. **Per-property merge (US1)**: two sessions on one board; A drags a shape, B
   recolors it (briefly offline) → both canvases show A's position + B's color.
4. **Ephemerals (US1)**: cursors track (awareness); emoji reactions float;
   countdown timer syncs — across sessions.
5. **Reconnect (US5)**: as memo, for the scene.

## e2e harness contribution (FR-011 / epic SC-009)

Contribute these client scenarios to the epic's shared e2e harness (WS-F):
two-client memo convergence, two-client whiteboard per-property convergence,
presence/awareness, offline→reconnect. They must run headless in CI and gate
merges (epic SC-009).

## Done-when

- Memo: existing memo collaboration scenarios pass against the unified provider
  with no regression (SC-003); `@hocuspocus/provider` removed (SC-004).
- Whiteboard: per-property merge visible; ephemerals work; `socket.io-client`
  removed (SC-004); prop rename green (SC-005).
- Both halves flag-gated off until the epic big-bang cutover.
