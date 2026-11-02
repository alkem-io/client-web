# Acceptance matrix — 006-collab-content-unification (SC-001)

Headless Playwright driving the **real UI** against the **deployed full stack**
(unified collaboration-service + server BFF + file-service). This is the SC-001
acceptance gate from the
[canonical workspace quickstart](https://github.com/alkem-io/agents-hq/blob/006-collab-content-unification/specs/006-collab-content-unification/quickstart.md):
all 18 rows must pass. That workspace specification and its constitution govern
this repository-local driver when the two disagree.

> **This is the orchestrator's FINAL gate**, run after every repo's slice deploys.
> It is intentionally **not** part of `pnpm test` (vitest) or the client PR's
> per-commit checks — a live stack is required. The client PR ships the test
> **files** + the unit tests; the live matrix is green only once collaboration-service,
> file-service, excalidraw-fork, server, and client-web are all deployed together.

## Layout

```text
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
E2E_READONLY_USER_EMAIL=<read-only@acct> \
AUTH_TEST_HARNESS_PASSWORD=<password> \
E2E_SPACE_URL=https://<deployed-host>/<space-path> \
E2E_LEGACY_MEMO_NAME=<pre-cutover-memo> \
E2E_LEGACY_WHITEBOARD_NAME=<pre-cutover-whiteboard> \
pnpm test:e2e
```

The secondary account must be able to contribute for the two-user rows. The
read-only account must be able to view the test space but lack update access.
Both legacy names must identify documents created **before** cutover; the full
matrix fails rather than silently skipping row 15 when either is absent.

## Companions (orchestrator, out-of-band)

Rows 14 (storage/quota), 15 (migration), and 17 (deletion) also have DB + file-service assertions
the orchestrator runs directly against the deployed stack: `memo.content` and
`whiteboard.content` columns are gone; every document's snapshot lives in its own
bucket; space storage usage reflects content size; deletion removes the owning
bucket and snapshot; no collab/file-service 500s appear in the logs. The browser
specs assert only their UI-observable half and do not present it as storage proof.

## Group calls

`specs/groupCalls.e2e.spec.ts` walks group calls in the web platform against an
environment configured for calls (dev): its deployed client must be built with
`VITE_APP_LIVEKIT_SERVICE_URL` set, otherwise every call control stays hidden and
the specs fail at their first call action. They cover starting audio and video
calls, the overlay surviving in-app navigation, the leave confirmation, a second beta
tester seeing and joining the call, the conversation-list badge and sign-out.
It needs `AUTH_TEST_HARNESS_EMAIL` and `AUTH_TEST_HARNESS_EMAIL_2` (both holding
the Feature Beta Tester role), `E2E_NON_BETA_EMAIL` (a member without it) and
`E2E_GROUP_CONVERSATION_NAME` (a group conversation all three belong to); the
browser gets a fake camera and microphone. `specs/groupCallsElementInterop.e2e.spec.ts`
is assisted: it also drives stock Element Web and runs only when
`E2E_ELEMENT_SESSION` names a Playwright storage state of an Element Web session
signed in to the same chat server (optionally `E2E_ELEMENT_URL`, default
`https://app.element.io`); without it the rows are skipped.

## Selector note

The page objects use stable, semantic locators (roles, Excalidraw's upstream DOM
contract, Tiptap's `.ProseMirror`). A handful of CRD-dialog selectors
(create-callout flow, template picker, share dialog, context menus) may need a
one-line adjustment against the deployed markup — each is isolated in a fixture.
