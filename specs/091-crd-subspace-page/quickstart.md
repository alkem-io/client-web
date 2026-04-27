# Quickstart: CRD SubSpace Page

**Branch**: `091-crd-subspace-page` | **Date**: 2026-04-26

This guide explains how to develop, run, and verify the new L1 SubSpace page locally.

---

## Prerequisites

- Node ≥22.0.0 (Volta-pinned to 24.14.0)
- pnpm ≥10.17.1
- Alkemio backend running at `http://localhost:3000` for full data; `http://localhost:4000/graphql` for codegen
- A signed-in user with at least one accessible subspace (any L1 under a known L0 space). Member + non-member personas help cover both flows.

---

## Setup

```bash
pnpm install
```

No new `.graphql` documents in this branch. (The proposed `CommunityMemberCount.graphql` was deferred — see research R1.) Regenerate types only if you change another GraphQL document; requires the backend running on `localhost:4000`:

```bash
pnpm codegen
```

Commit the regenerated files in `src/core/apollo/generated/` per the constitution (Engineering Workflow #2).

---

## Running

### Full app (recommended for end-to-end verification)

```bash
pnpm start
```

Opens the SPA at `http://localhost:3001`, talking to backend at `http://localhost:3000`.

### Standalone CRD preview (no backend, mocked data)

```bash
pnpm crd:dev
```

Opens the CRD-only preview app at `http://localhost:5200`. Use this when iterating on the four new presentational components (`SubspaceHeader`, `SubspaceFlowTabs`, `SubspaceSidebar`, `SubspaceCommunityDialog`) without starting the backend. Add a mock SubSpace page under `src/crd/app/pages/` once the components exist.

---

## Enabling the CRD design system

The new SubSpace page renders only when the design-system toggle is on.

**Via Admin UI** (preferred): navigate to **Administration → Platform Settings → Design System**, choose **CRD (New Design)**, the page reloads.

**Via console**:

```js
localStorage.setItem('alkemio-crd-enabled', 'true');
location.reload();
```

To revert and confirm the legacy MUI page is unaffected:

```js
localStorage.removeItem('alkemio-crd-enabled');
location.reload();
```

---

## End-to-end verification

Run through this list before requesting review. Each step maps to one or more acceptance scenarios from `spec.md`.

### 1. SubSpace renders end-to-end (US1)
- [ ] Open `/<space>/challenges/<subspace>` with the toggle ON.
- [ ] Banner shows the **parent's** banner image, layered avatar (parent behind, subspace in front), SUBSPACE badge top-right, action icons top-right (only those entitled), member-avatar stack bottom-right.
- [ ] The avatar stack shows lead-user avatars only — no `+N` overflow chip (true total count was deferred — see research R1).
- [ ] Title and tagline render below the banner.
- [ ] Breadcrumbs: home → parent space name → subspace name.
- [ ] Innovation flow phase tabs render above the content column with a **double-arrow connector between every adjacent pair**, no gaps.
- [ ] No count badges next to phase names.
- [ ] Posts feed shows the active phase's callouts. Switching phases updates both the URL (`?phase=<id>`) and the feed.

### 2. Active phase resolution (US1, FR-011)
- [ ] On a fresh visit (no `?phase=`), the active phase equals the subspace's `currentState` (matches the legacy default).
- [ ] If `currentState` is undefined, the first phase is active.
- [ ] Adding `?phase=<id>` to the URL deep-links to that phase.

### 3. Right sidebar (US1, FR-014–FR-022)
- [ ] Sidebar is on the **right**, one column gap from the right edge (matches the L0 layout).
- [ ] Info card body shows the subspace's why/tagline; **no "Challenge Statement" title** at the top of the card.
- [ ] Lead block lists the subspace's lead user(s).
- [ ] **About this Subspace** button is rendered **outside and below** the info card. Clicking opens the existing `SpaceAboutDialog` populated for the subspace.
- [ ] Quick Actions: Community, Events, Recent Activity, Index, Subspaces. Each opens its corresponding dialog.
- [ ] Events dialog uses the same component as the L0 timeline (no separate per-subspace events UI).
- [ ] Recent Activity dialog reuses the home-page activity component, scoped to the subspace.
- [ ] Virtual Contributor card appears only when the subspace has one; otherwise the section is hidden.
- [ ] "Updates from the Lead" placeholder shows the "Coming soon" copy.

### 4. Non-member discovery + apply (US2)
- [ ] As a signed-in non-member, open a public subspace. Apply / Join CTA renders correctly.
- [ ] If you have a pending invitation, the CTA shows accept/decline.
- [ ] If parent membership is required, the CTA explicitly indicates that path.
- [ ] As a signed-out visitor, public details render and the CTA prompts sign-in.

### 5. L0 banner refinements (US3, FR-027)
- [ ] Click the avatar stack on the L0 banner — the community dialog opens (the same dialog the SubSpace banner uses).
- [ ] Click the avatar stack on the L1 banner — the same dialog opens, scoped to the subspace's community.
- [ ] Both banners show lead-user avatars only (no `+N` overflow chip — FR-026 deferred per research R1).

### 6. Visibility states (US2, FR-024)
- [ ] Open an archived / demo / inactive subspace. The visibility notice appears at the top of the page; the rest of the page still renders.

### 7. Edge cases
- [ ] Subspace with **no parent banner image** renders the deterministic gradient fallback (parent's accent colour).
- [ ] Subspace with **no flow phases** renders the empty-state message; **no action button** is shown regardless of viewer privileges (clarification Q4).
- [ ] Subspace with **zero community members** hides the avatar stack entirely (FR-028).
- [ ] L2 (sub-of-sub) renders with the same layout, badge label adapts (e.g. "SubSubSpace"), the layered avatar's "behind" identity is the L1 parent (clarification Q3), L0 still appears in breadcrumbs.

### 8. Permissions gating (FR-007 / FR-012 / FR-013 / FR-031)
- [ ] As a viewer without `Update`, the Edit Flow icon does not appear.
- [ ] As a viewer without `CreateCallout`, the Add Post button does not appear.
- [ ] As a viewer without settings privileges, the settings icon does not appear.
- [ ] When visible, the settings icon links to the legacy MUI settings path (`<subspaceUrl>/settings`).

### 9. Coexistence with legacy (FR-030)
- [ ] Toggle CRD off. Open the same SubSpace and L0 URLs. Both render the legacy MUI experience unchanged.

### 10. Internationalisation (US5, FR-032)
- [ ] Switch language to **nl, es, bg, de, fr** in turn. Every visible string on the SubSpace page renders in the selected language. No English fallbacks.

### 11. Accessibility (US5, FR-033–FR-035)
- [ ] Keyboard-only: Tab passes through banner actions → flow tabs → feed → sidebar → footer in a logical order. Visible focus rings on every element.
- [ ] Every icon-only button has an `aria-label` (Screen reader / inspect via DevTools accessibility panel).
- [ ] Run an automated audit (axe DevTools or Lighthouse): zero WCAG 2.1 AA violations.

### 12. Performance (SC-008)
- [ ] Click the banner avatar stack — the community dialog opens within 500ms (Network throttling: Fast 3G is OK).

### 13. Tests + lint
- [ ] `pnpm lint` passes.
- [ ] `pnpm vitest run` passes.

---

## Common gotchas

- **The toggle is per-browser**: re-enable after clearing localStorage / using a new profile.
- **The codegen step requires the backend on `:4000`**: run `pnpm codegen` separately when adding the new `.graphql` document.
- **Apollo cache caches per-id**: when verifying the parent-banner query, navigate between sibling subspaces — the second visit should be instant (cached).
- **`SpaceContextProvider` is set up by `CrdSpaceRoutes`**: the L1 layout reads from it via `useSpace()` / `useUrlResolver()`. If the layout shows "loading" forever, suspect a missing route nesting rather than a bad query.
- **The L0 banner's avatar `onMemberClick` was a no-op**: do not assume the click is wired before this branch — it isn't.

---

## Where things live

| Concern | Path |
|---|---|
| Banner component | `src/crd/components/space/SubspaceHeader.tsx` |
| Flow tabs component | `src/crd/components/space/SubspaceFlowTabs.tsx` |
| Sidebar component | `src/crd/components/space/SubspaceSidebar.tsx` |
| Community dialog shell | `src/crd/components/space/SubspaceCommunityDialog.tsx` |
| L1 layout | `src/main/crdPages/subspace/layout/CrdSubspacePageLayout.tsx` |
| L1 routing | `src/main/crdPages/subspace/routing/CrdSubspaceRoutes.tsx` |
| L1 callouts page | `src/main/crdPages/subspace/tabs/CrdSubspaceCalloutsPage.tsx` |
| Dialog connectors | `src/main/crdPages/subspace/dialogs/Crd*DialogConnector.tsx` |
| Data mapper | `src/main/crdPages/subspace/dataMappers/subspacePageDataMapper.ts` |
| Hooks | `src/main/crdPages/subspace/hooks/useCrdSubspace.ts`, `useCrdSubspaceFlow.ts` |
| L0 banner refinement | `src/main/crdPages/space/layout/CrdSpacePageLayout.tsx` (wire `onMemberClick` to community dialog) |
| L0 routing | `src/main/crdPages/space/routing/CrdSpaceRoutes.tsx` (nest subspace route) |
| i18n | `src/crd/i18n/subspace/subspace.{en,nl,es,bg,de,fr}.json` + `src/core/i18n/config.ts` registration |
| Settings URL helper | `src/main/routing/urlBuilders.ts` (new `buildSubspaceSettingsUrl`) |

Refer to `plan.md` for design rationale and `research.md` for the resolution of each open question.
