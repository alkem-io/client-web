# Quickstart: Unified Chat

## Prerequisites

- Node ≥ 24, pnpm ≥ 10.17.1 — `pnpm install`
- No backend needed for presentational work; full E2E needs the Alkemio backend at `localhost:3000`.
- **No `pnpm codegen`** — this feature adds no GraphQL.

## Standalone CRD preview (presentational components)

```bash
pnpm crd:dev      # localhost:5200
```
Build/iterate `src/crd/components/chat/*` against mock data: launcher, panel (floating card + mobile expansion), list, thread, bubbles (own/other, reactions, VC badge), and the dialogs (NewChat, GroupSettings, GuidanceInfo). Verify responsiveness and a11y here before wiring data.

## Full app (integration, behind the toggle)

```bash
pnpm start        # localhost:3001, expects backend at localhost:3000
```
Enable CRD + the unified chat:
```js
localStorage.setItem('alkemio-design-version', '2'); location.reload();
```
Back to legacy MUI (regression check):
```js
localStorage.setItem('alkemio-design-version', '1'); location.reload();
```

## Manual verification (maps to spec acceptance scenarios)

**US1 — one surface (P1)**
1. Sign in (CRD on) → a floating chat button shows bottom-right; the header has **no** messages icon.
2. Click it → floating card opens to the **conversation list** (never auto-selects). Guidance is pinned on top.
3. Type in search → list filters by name; guidance filters like any row and loses its pin; clear search → guidance returns pinned.
4. Select a conversation → thread shows in the same card; back returns to the list.

**US2 — DM & group messaging (P1)**
5. Open a 1:1 and a group; send messages; from another account send a message → appears live (<3s).
6. Add/remove a reaction → reflected for participants.
7. Open a conversation with unread → unread clears and the launcher badge count drops (<2s).

**US3 — guidance in the list (P1)**
8. Open pinned Guidance → intro shows when empty; send a question → loader bubble + disabled input; answer appears.
9. Let the assistant be slow → after the fixed wait window, loading ends and input re-enables.
10. Open the info affordance (what the assistant is / BETA). 
11. Clear context → confirm → thread resets in place, guidance stays pinned, fresh exchange works.

**US4 — new conversation (P2)**
12. New message → pick one person → Direct created + opened, appears top (below guidance).
13. New message → pick 2+ people → Group created + opened.

**US5 — group management (P2)**
14. Group settings: rename + change avatar → Save applies; closing with unsaved changes prompts.
15. Add a member (immediate); remove a member (confirm); leave group → removed from list.

**Gating / edges**
16. With guidance disabled (flag/privilege off) → no pinned guidance row; launcher + people/group chats still work.
17. A 3+ member group that includes the VC shows as a normal group, not pinned guidance.
18. Mobile viewport → panel expands; list/thread/composer all usable.
19. Toggle to design-version `1` → legacy guidance widget + UserMessaging dialog unchanged.

## Pre-PR checks

```bash
pnpm lint
pnpm vitest run        # incl. dataMapper + useUnifiedConversations/View unit tests
```
- Verify `crd-chat` key parity across en/nl/es/bg/de/fr.
- Confirm no `src/crd/components/chat/*` file imports `@mui/*`, `@emotion/*`, `@apollo/*`, `@/domain/*`, `react-router-dom`, or `formik`.
- Confirm `src/main/crdPages/unifiedChat/*` imports no `@mui/*`/`@emotion/*`.
