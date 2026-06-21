# Acceptance matrix — 006-collab-content-unification (SC-001)

Headless Playwright driving the **real UI** against the **deployed full stack**
(unified collaboration-service + server BFF + file-service). This is the SC-001
acceptance gate from `../specs/006-collab-content-unification/quickstart.md`: all
18 rows must pass 100% through the UI.

> **This is the orchestrator's FINAL gate**, run after every repo's slice deploys.
> It is intentionally **not** part of `pnpm test` (vitest) or the client PR's
> per-commit checks — a live stack is required. The client PR ships the test
> **files** + the unit tests; the live matrix is green only once collaboration-service,
> file-service, excalidraw-fork, server, and client-web are all deployed together.

## Layout

```
e2e/
├── playwright.config.ts is at the repo root (testDir → e2e/specs)
├── fixtures/
│   ├── loginPage.ts          # OIDC/BFF login through the UI
│   ├── authFixture.ts        # authedPage + secondUser() (two real sessions)
│   ├── memoEditor.ts         # Tiptap memo page object
│   ├── whiteboardEditor.ts   # Excalidraw whiteboard page object
│   ├── calloutActions.ts     # create/open memo+whiteboard callouts
│   └── assets/sample.png     # a small image for the embedded-media rows (provide locally)
└── specs/
    ├── createWithContent.e2e.spec.ts        # rows 1, 2, 13
    ├── multiUserCollab.e2e.spec.ts          # rows 3, 4
    ├── whiteboardModes.e2e.spec.ts          # rows 5, 6, 7
    ├── mediaExportGuest.e2e.spec.ts         # rows 8, 9, 10
    ├── resilienceReadonly.e2e.spec.ts       # rows 11, 12
    └── storageMigrationLegacy.e2e.spec.ts   # rows 14, 15, 16, 17, 18
```

## Run

```bash
pnpm exec playwright install chromium   # one-time

ALKEMIO_BASE_URL=https://<deployed-host> \
AUTH_TEST_HARNESS_EMAIL=<primary@acct> \
AUTH_TEST_HARNESS_EMAIL_2=<secondary@acct> \
AUTH_TEST_HARNESS_PASSWORD=<password> \
E2E_SPACE_URL=https://<deployed-host>/<space-path> \
pnpm test:e2e
```

Optional for the migration row (15): `E2E_LEGACY_MEMO_NAME` / `E2E_LEGACY_WHITEBOARD_NAME`
naming documents created **before** cutover (otherwise that row is skipped).

## Companions (orchestrator, out-of-band)

Rows 14 (storage/quota) and 15 (migration) also have DB + file-service assertions
the orchestrator runs directly against the deployed stack: `memo.content` and
`whiteboard.content` columns are gone; every document's snapshot lives in its own
bucket; space storage usage reflects content size; no collab/file-service 500s in
the logs during the run.

## Selector note

The page objects use stable, semantic locators (roles, Excalidraw's upstream DOM
contract, Tiptap's `.ProseMirror`). A handful of CRD-dialog selectors
(create-callout flow, template picker, share dialog, context menus) may need a
one-line adjustment against the deployed markup — each is isolated in a fixture.
