# Phase 0 Research — CRD User Profile Page

This document resolves the open architectural decisions identified during planning. Every "NEEDS CLARIFICATION" from the Technical Context is settled below; no unresolved item gates Phase 1. Decisions about the seven settings tabs live in sibling spec `097-crd-user-settings/research.md`.

---

## 1. Anonymous-viewer access to the public profile (parity check)

**Question**: FR-008 states the public profile MUST be reachable without authentication "(parity with current MUI)". But the current `TopLevelRoutes.tsx` wraps the entire `/user/*` route in `<NoIdentityRedirect>` — so anonymous viewers are in fact redirected to login before reaching the public profile today.

**Investigation**:
- `src/main/routing/TopLevelRoutes.tsx:209-220` wraps `<UserRoute />` (which contains both the public profile and the settings sub-routes) in `<NoIdentityRedirect>`.
- `src/core/routing/NoIdentityRedirect.tsx` is unconditional — any unauthenticated viewer hitting any descendant route is redirected to `${AUTH_REQUIRED_PATH}?return=…`.
- Therefore, the *actual* MUI parity behaviour today is: anonymous viewers cannot view another user's public profile — they are redirected to login.

**Decision**: **Mirror the actual MUI behaviour (anonymous viewers redirected to login).** The CRD `CrdUserRoutes` subtree will be wrapped in the same `<NoIdentityRedirect>` at the same point in the route tree. FR-008's prose ("public profile MUST be reachable without authentication") is treated as a descriptive inaccuracy of the current MUI; the spec's overarching principle is parity, so we match what MUI actually does. The Edge Case bullet "Unauthenticated viewer on a public profile" is consistent with this.

**Rationale**: Diverging from current MUI behaviour for anonymous viewers would (a) be a behaviour change disguised as a "migration" and (b) require coordinating a routing-tree change that is outside the scope of a presentational migration. Parity wins.

**Alternatives considered**:
- Move `<NoIdentityRedirect>` to wrap only `/user/*/settings/*` and leave `/user/:userSlug` open. **Rejected** — this changes user-visible behaviour and is out of scope per the migration's "presentation-layer port" principle (Out of Scope first bullet).
- Add a clarification asking the user. **Rejected** — the existing Edge Case bullet plus the parity principle is sufficient; pursuing this further is bureaucracy.

---

## 2. Tab labels on the public-profile resource strip

**Question**: An earlier clarification thread questioned the prototype's `All Resources / Hosted Spaces / Virtual Contributors / Leading / Member Of` tab labels. The user dropped the thread without prescribing a change.

**Decision**: **Keep the prototype's exact labels** (`All Resources`, `Hosted Spaces`, `Virtual Contributors`, `Leading`, `Member Of`). All five are defined as i18n keys under `src/crd/i18n/userPages/userPages.en.json` and translated into the other five languages.

**Rationale**: The prototype source `prototype/src/app/pages/UserProfilePage.tsx:91` defines exactly these five tabs; the user dropped the rename thread without alternative wording; the spec's narrative is internally consistent with these labels. Per-tab section filtering is documented in `data-model.md`.

**Alternatives considered**:
- Rename `All Resources` to something else (e.g., `Account`, `Overview`). **Rejected** — without an explicit user direction, renaming would diverge from the prototype.

---

## 3. i18n namespace registration

**Question**: How is the new `crd-userPages` namespace registered?

**Decision**: **Register `crd-userPages` in `src/core/i18n/config.ts` (as a lazy-loaded namespace) and add the type augmentation in `@types/i18next.d.ts`.** All six language files live under `src/crd/i18n/userPages/userPages.{en,nl,es,bg,de,fr}.json` and are edited manually in the same PR — no Crowdin involvement (per `src/crd/CLAUDE.md`). Sibling spec `097-crd-user-settings` registers its own `crd-userSettings` namespace separately so the two specs can ship independently.

**Rationale**: Mirrors the precedent set by `crd-spaceSettings`, `crd-search`, etc. Lazy loading prevents bloating the main bundle.

---

## 4. Performance targets

**Decisions**:
- **Tab switch latency** (resource tab strip): target < 200 ms perceived; achieved by data-driven section filtering (no remount cost) + React 19 `useTransition` so a slow filter does not block paint.
- **Send-message round-trip**: target < 3 s typical; surfaced via the Send button's spinner state and `aria-busy`.
- **Bundle delta**: ≤ +20 KB gzipped on the user-profile chunk over the prior build (SC-005). Verified post-implementation via `pnpm analyze`.

**Rationale**: These are the same performance budgets the prior CRD migrations set; no domain-specific reason to deviate.

---

## 5. Tests

**Decisions**:
- **Mapper** (one Vitest file) — `publicProfileMapper` pure function transforming GraphQL fixtures to CRD prop shapes. Cover the tab → section filter, membership filtering (leading vs. member-of split), empty-state behavior.
- **Resource tab strip / sections render** — small render test on `UserResourceSections` covering `allResources` renders all three sections; `hostedSpaces` renders only the Spaces sub-section; etc.
- **Route guards** — `useCanEditSettings` Vitest tests covering owner / admin / non-admin / anonymous; the result drives the gear-icon visibility on the hero.
- **i18n keys present in all six languages** — a small runtime test that each language file has the same key shape (existing pattern in the codebase).

**Rationale**: Unit-test the pure transformation logic; rely on manual smoke for the end-to-end view (consistent with the prior CRD specs).

---

## Summary

All NEEDS CLARIFICATION items are resolved. No GraphQL schema change. No new runtime dependencies. The migration is a presentation-layer port plus one new CRD i18n namespace. Phase 1 (`data-model.md`, `contracts/`, `quickstart.md`) follows.
