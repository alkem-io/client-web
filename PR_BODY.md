# feat(004-web-ai-assistant): web AI assistant — panel, settings, confirmation & history

Refs `workspace#004-web-ai-assistant`. Implements the complete **client-web**
presentation slice of the cross-repo Web AI Assistant feature: the global
signed-in assistant panel (streamed replies + visible tool activity + the
write-confirmation UI), the per-capability security-settings tab, and
history/continuity.

> **Ships behind the feature flag OFF** (`VITE_APP_ASSISTANT_ENABLED=false`,
> constitution §4 rollout step 5). The button, panel, and settings tab are all
> gated on the flag; nothing is reachable until the PROD rollout flips it on
> after the human gates (stakeholder approval, QA sign-off, signed DPA/ZDR).

## Depends on (cross-repo)

- **`server`** PR (branch `feat/004-web-ai-assistant`) — the GraphQL authority
  surface: `platformCapabilities`, `UserSettingsAssistant`,
  `updateUserSettings(assistant)` ([contracts/assistant-authority.md]). The
  committed server schema snapshot was consumed via `pnpm codegen` to generate the
  typed hooks (the live develop server lacks these types).
- **`assistant-service`** PR (branch `feat/004-web-ai-assistant`) — the
  browser↔assistant-service HTTP+SSE contract ([contracts/browser-assistant-sse.md]);
  the panel POSTs to the same-origin `/api/private/rest/assistant/**` edge path
  (cookie auth; the browser holds **no** credentials, FR-007/SC-006).
- **`infrastructure-operations` / `dev-orchestration`** — the edge IngressRoute +
  Oathkeeper rule and the `VITE_APP_ASSISTANT_ENABLED` / `VITE_APP_ASSISTANT_BASE_PATH`
  env wiring ([contracts/config-and-secrets.md]).

## What's in this slice

### Setup + Foundational (T001–T008)
- Feature-flag + base-path config (`VITE_APP_ASSISTANT_ENABLED` default `false`,
  `VITE_APP_ASSISTANT_BASE_PATH=/api/private/rest/assistant`) in the `window._env_`
  typing + `.env`; assistant endpoint constant; `pnpm codegen` → assistant
  authority hooks/types.
- **Net-new SSE transport** `useAssistantStream.ts`: `fetch` + `ReadableStream`
  (NOT `EventSource`) — POST with body, `AbortController`-cancellable,
  `credentials:'include'` (no Authorization header), parses `event:`/`data:`/`id:`
  frames, exposes the `Last-Event-ID` reconnect header, tolerates `:keepalive`.
- Part-model `types.ts` (`text | tool-activity | tool-result | confirmation`
  discriminated union, matching the SSE contract exactly), REST client, context +
  reducer, and the auth + feature-flag gate.

### US1 — Ask about platform content (T009–T016, MVP)
- `AssistantButton` in **both** nav variants (MUI inline + CRD app-layer overlay),
  lazy `AssistantDialog` in `root.tsx`, `AssistantConversationView` (streamed
  markdown via `WrapperMarkdown` with a throttled re-parse; tool activity as
  "Searching…" with started/finished/error status), error rendering for the 5 wire
  error codes (clarifying questions stay normal text turns), i18n.
- Tests: streamed-token + tool-activity render from a mocked SSE stream; the
  no-secret / no-Authorization-header SC-006 check.

### US4 — Govern what the assistant may do (T017–T022)
- A per-capability security-settings tab (`CrdUserAssistantTab` +
  `UserAssistantTabView`), modeled on the notifications multi-toggle tab. The
  toggle list is **enumerated dynamically** from `platformCapabilities`
  (FR-006/FR-018) — never a hardcoded enum, so a brand-new server tool appears
  automatically and (being unclassified) defaults disabled. Read-only defaults
  (READ on, WRITE_* off); optimistic toggle persisted via
  `updateUserSettings({ assistant: { enabledCapabilities } })` with revert on
  failure. Registered in `CrdUserSettingsRoutes` + the settings tab strip, gated
  behind the assistant flag. i18n for all 6 CRD languages.
- Test: dynamic enumeration incl. an injected extra capability, read-only
  defaults, full-payload mutation.

### US2 — Confirmation UI (T023–T026)
- `AssistantConfirmation` renders the consolidated itemized write proposal
  (`{toolName, kind, summary, targetRef?}`) with a **single** Approve / Decline
  control (FR-015); destructive items flagged. The decision POSTs to
  `/conversations/{id}/confirmations/{proposedWriteSetId}` and **resumes the same
  SSE protocol**. The reducer tracks `pendingConfirmationId`: a re-proposal
  replaces the stale set, a new user message expires it, `done`/`error` clears it.
  A `permission_denied` error links to **Settings → Assistant** (the
  disabled-capability hint; there is no distinct `capability_disabled` wire code).
- Test: itemized render, approve/decline post exactly once, re-proposal replaces
  the stale item.

### US3 — History & continuity (T027–T030)
- `useAssistantRehydrate` resolves the single rolling conversation on panel open,
  GETs its full message history (incl. a pending `confirmation` part when
  `awaiting_confirmation`), and re-opens the SSE stream **only if a turn is still
  in flight** (FR-011). In-flight reconnect re-issues the POST with `Last-Event-ID`
  (no native `fetch`+`ReadableStream` auto-reconnect). Reply-language passthrough
  (FR-020): assistant prose renders verbatim — no client locale coercion.
- Test: rehydration renders prior turns in order + the pending confirmation.

### Polish (T031–T035)
- Accessibility: the conversation is a `role="log"` with
  `aria-relevant="additions"` + `aria-busy` (announces only new content, not the
  whole growing buffer), per-turn `role="group"` labels (your message / assistant
  reply), `role="alert"` errors, input `autoFocus` on open (MUI focus trap restores
  focus on close), and per-toggle `aria-label`s on the settings switches.
- `WrapperMarkdown` re-parse throttle tuned to ~75ms while streaming (smooth
  progressive render without O(n²) parser thrash), immediate on settle.

## Gates

- `tsc --noEmit` ✅ · `eslint` (incl. react-compiler) ✅ · `vitest` ✅ — full suite
  green (1333 passed, 1 skipped; +13 new assistant tests + 3 settings-tab tests).
  `biome` clean (one non-blocking array-index-key warning on the confirmation list,
  where the index is a legitimate disambiguator).

## Not verified here (deferred — needs ACC)

- **quickstart.md §3** + the live US1/US2/US3/US4 UI verifications run against a
  deployed `assistant-service` + `server` on ACC (live-cluster, human-gated) — not
  runnable in this local-only slice; tracked for the rollout gate.

[contracts/assistant-authority.md]: ../specs/004-web-ai-assistant/contracts/assistant-authority.md
[contracts/browser-assistant-sse.md]: ../specs/004-web-ai-assistant/contracts/browser-assistant-sse.md
[contracts/config-and-secrets.md]: ../specs/004-web-ai-assistant/contracts/config-and-secrets.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)
