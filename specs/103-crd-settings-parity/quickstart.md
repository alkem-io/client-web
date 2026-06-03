# Quickstart: Validating CRD (Sub)Space Settings Parity

## Prerequisites

- Backend running at `localhost:3000`; dev server `pnpm start` (`localhost:3001`).
- Opt into the CRD design: in the browser console
  ```js
  localStorage.setItem('alkemio-design-version', '2'); location.reload();
  ```
- Be an **admin** of both a top-level Space (L0) and a Subspace (L1) with several subspaces, an Innovation Flow with ≥2 phases, and at least one callout. Have a Virtual Contributor available on the account and one in the library.

## Per-story validation

Run each in **both** a top-level space and a subspace (FR-012).

### US6 — View post (smallest)
1. Settings → **Layout** tab. Open a callout's ⋮ menu → **View post**.
2. Expect: navigates to that callout/post. (Before fix: nothing happened.)
3. Negative: a callout with no resolvable URL does not offer an actionable "View post" that no-ops.

### US3 — Active-phase indicator
1. Settings → **Layout**. Confirm the **currently active phase column is visibly distinguished** (accent border + "Current phase" badge/icon, not color-only).
2. Open a different column's ⋮ → **Set as Active Phase**. Indicator moves; reload — it persists.

### US5 — Phase description renders formatted
1. Settings → **Layout**, on a phase whose description has formatting (e.g. `**bold**` / `<strong>`).
2. Expect: the column preview shows **formatted** text (no literal `<strong>` / `**`), still **truncated** to the same clamped height.
3. Open the phase editor — confirm it is still the rich-text editor (unchanged).

### US1 — Member invite parity
1. Settings → **Community** → **Invite Members**.
2. Expect a **single input** that surfaces matching existing users live as you type (by name and email), and accepts a non-matching valid email as an external invite.
3. Confirm an **editable, pre-filled welcome message** and a **role selector** (Member locked; Lead/Admin toggleable).
4. Invite an existing user as **Admin** with a custom message → confirm the invitation carries that role + message (matches legacy).
5. In a subspace, confirm the invite targets the **subspace's** community (not the parent).

### US4 — Subspace sort/pin
1. Settings → **Subspaces**. Confirm an **Alphabetical / Custom** sort-mode selector.
2. **Custom** mode: drag any subspace to reorder → order saves and persists after reload, and is reflected where subspaces are listed.
3. **Alphabetical** mode: only **pinned** subspaces are draggable (pinned lead; rest alphabetical).
4. Keyboard: focus a drag handle and reorder with the keyboard (WCAG).

### US2 — Invite a Virtual Contributor
1. Settings → **Community**. Confirm a **separate** "Invite Virtual Contributor" entry point (distinct from "Invite Members"), visible only with the right permission.
2. Open it: confirm **On account** and **In library** VCs are listed and distinguishable.
3. Add an on-account VC → it joins the community.
4. Invite a library VC → supply/edit the message → confirm it's invited.
5. Empty state: with no VCs available, a clear message shows (not a confusing empty list).

## Regression guard (FR-011)
- Set `localStorage('alkemio-design-version','1')` and reload. Confirm the **legacy** settings still behave exactly as before for all six areas.

## Build gates
```bash
pnpm codegen        # after the InnovationFlowCollaboration fragment change (commit generated files)
pnpm lint           # TypeScript + Biome + ESLint (react-compiler)
pnpm vitest run     # tests pass
```
