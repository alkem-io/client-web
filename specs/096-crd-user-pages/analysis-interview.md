# Spec Analysis Interview — 096-crd-user-pages

Walking down the design tree of decisions surfaced by `/speckit.analyze`. Each question gets a recommended answer; settle one before moving to the next so dependencies resolve cleanly.

Status: ✅ resolved · 🟡 in flight · ⬜ open

---

## Q1 — Sidebar Organizations card shape (U1, C4) ✅

**Problem.** The User profile sidebar's Organizations list needs `role` + `memberCount` fields that `CompactContributorCard` doesn't have. Spec assumed a "shared OrganizationCard pattern" that doesn't exist in CRD. T018 punts the decision.

**Options.**
- (a) Extend `CompactContributorCard` with optional `secondaryCaption: string | null`.
- (b) Build a dedicated `AssociatedOrganizationCard.tsx` under `src/crd/components/user/`.
- (c) Inline the JSX in `UserProfileSidebar.tsx`.

**Recommendation.** (a) — keeps one primitive, three consumers (User Orgs, Org Associates, VC Host).

**Decision.** ✅ **(a) — extend `CompactContributorCard` with `secondaryCaption: string | null`.**

**Spec impact.**
- `contracts/compactContributor.ts`: add `secondaryCaption: string | null` to `CompactContributorCardItem`.
- `data-model.md`: `AssociatedOrganizationCard` and `AssociatesView` map `role`/`memberCount` into the new field.
- T006 (impl) and T018 (sidebar) absorb the change; no new task.

---

## Q2 — `MessagePopover` location (C2) ✅

**Problem.** Plan/T027 has Org's `OrganizationPageHero` import `UserPageMessagePopover` from `src/crd/components/user/`. CRD verticals are siblings; cross-imports are a smell.

**Options.**
- (a) Move up-front: rename to `MessagePopover`, place under `src/crd/components/common/`. User + Org both consume.
- (b) Keep in `user/`, let Org cross-import, document exception in `src/crd/CLAUDE.md`.

**Recommendation.** (a). The popover is recipient-agnostic by design (research §5); putting it in `common/` matches how `CompactContributorCard` is treated.

**Decision.** ✅ **(a) — `MessagePopover` lives at `src/crd/components/common/MessagePopover.tsx` from day one.**

**Spec impact.**
- `plan.md`: file tree updated (popover under `common/`); Primary Dependencies note expanded; SOLID/DRY note rewritten.
- `research.md` §5: implementation note now explicitly places the popover in `common/`.
- `tasks.md`: new T006a creates the shared `MessagePopover`; T015 retired (left as a tombstone pointing at T006a); T014 and T027 both consume from `common/`.

---

## Q3 — Skeleton → query-region mapping (A1) ✅

**Problem.** FR-009 says skeletons are replaced "per region as each query resolves." User profile fires four parallel queries (`useUserQuery`, `useUserAccountQuery`, `useUserContributionsQuery`, `useUserOrganizationIds`); Org fires three (provider + account + filtered memberships); VC fires three (profile/model-card + BoK auth + BoK about/KB). The query → region map isn't documented anywhere.

**Options.**
- (a) Add a small table to `data-model.md` (one per actor): query → region(s) it unblocks. Mappers consume per-region `loading` flags.
- (b) Block the entire page on the slowest query (single `loading` flag).
- (c) Hand-wave: leave it to the integration page author at implementation time.

**Recommendation.** (a) — costs ~10 lines in data-model and one extra prop on each `*ViewProps`.

**Decision.** ✅ **(a) — per-region `loading` shape on every `*PublicProfileViewProps`; query → region tables added to `data-model.md`.**

**Spec impact.**
- `data-model.md`: new "Query → region" section with one table per actor.
- `contracts/publicProfile.ts`, `contracts/organizationProfile.ts`, `contracts/vcProfile.ts`: each `*PublicProfileViewProps` carries a `loading: { … }` shape.
- `spec.md` FR-009: wording updated to point at the data-model tables.
- `tasks.md`: T011 / T025 / T036 mappers MUST produce the per-region loading flags; T019 / T030 / T044 views render Skeleton placeholders per region.

---

## Q4 — VC "other error" path (U2) ✅

**Problem.** data-model VC lifecycle says "query other error → surface CRD error display (parity with current MUI)." No CRD error component is named, no contract exists, no task creates one.

**Options.**
- (a) Reuse an existing CRD primitive — quick check, name it explicitly in a contract.
- (b) Add a new task to create `CrdErrorState` under `src/crd/components/common/`.
- (c) Drop "other error" handling — let the parent ErrorBoundary catch it; only handle the documented `isApolloNotFoundError` (FR-036) explicitly.

**Recommendation.** (c) — parity migration; current MUI has no dedicated error display either.

**Decision.** ✅ **(c) — only `isApolloNotFoundError` is handled explicitly (Error404). All other errors propagate to the global ErrorBoundary. No new CRD error component.**

**Spec impact.**
- `data-model.md` VC lifecycle: "other error" line replaced with explicit propagation note.
- `research.md`: new §11 captures the rationale.
- `tasks.md` T045: explicit note that other errors propagate; no extra component.

---

## Q5 — A11y test depth (Cv1, Cv2) ✅

**Problem.** FR-110 mandates `aria-busy` on async-pending buttons; FR-111 mandates keyboard nav on the User tab strip. Neither has a dedicated test task. T054 (axe pass) covers detection broadly but not these specific assertions.

**Options.**
- (a) Add small dedicated tests:
   - assert Send button has `aria-busy="true"` while pending (User + Org hero render tests).
   - keyboard-nav unit test on the tab strip (Tab → Left/Right → Enter).
- (b) Rely on T054 axe + the underlying CRD `tabs` primitive's existing tests.

**Recommendation.** (a) — precise assertions; axe alone won't catch a broken `aria-busy` toggle.

**Decision.** ✅ **(a) — dedicated a11y tests added.**

**Spec impact.**
- `tasks.md` new T014a (User hero render+a11y test) and T016a (tab strip kbd test).
- `tasks.md` T026a updated with `aria-busy` assertion; T038a notes that VC has no Send button so `aria-busy` is covered by User+Org instead.

---

## Q6 — `/me` route: redirect vs. render-in-place ✅

**Problem.** FR-007 says "resolves `/user/me` to the current user's profile exactly as `UserMeRoute` does." Tasks T021 said it "redirects to `/<resolvedSlug>`." Two semantics: HTTP-style redirect vs. in-place render.

**Verification.** Read `src/domain/community/user/routing/UserMeRoute.tsx` directly. Current MUI **renders in place**: URL stays `/user/me`; the route wraps children in `<NoIdentityRedirect>` and a `MeUserProvider` that supplies `userId={userModel.id}`. There is no redirect. T021's earlier wording was wrong.

**User's follow-up question.** "Need to modify UserMeRoute to switch between CRD or MUI component?"

**Answer.** **No.** The CRD-vs-MUI dispatch happens at `TopLevelRoutes.tsx` (T022), one level above. CRD picks an entire `<UserRoute>` subtree (its own `CrdUserRoutes`); MUI keeps its existing `<UserRoute>` (which contains the unmodified `UserMeRoute`). The CRD side implements its own `/me/*` route that mirrors `UserMeRoute.tsx`'s pattern — wraps in `MeUserProvider` (or a CRD analog) and renders `CrdUserProfilePage` in-place. The existing `UserMeRoute.tsx` stays untouched.

**Decision.** ✅ **(a) — match MUI: render in place under `/user/me`, no redirect. CRD's `CrdUserRoutes` mirrors the MUI structure; the existing `UserMeRoute.tsx` is not modified.**

**Spec impact.**
- `tasks.md` T021: rewritten to make the in-place render explicit, called out the no-modification-to-MUI rule.

---

## Q7 — BoK `space` variant when read-access denied ✅

**Problem.** data-model says when `hasReadAccess === false` for a Space-backed BoK, `spaceProfile: null` and the view "renders 'Private space' placeholder." But what does the placeholder actually show?

**Verification.** Read `src/domain/community/virtualContributor/vcProfilePage/VCProfilePageView.tsx` directly. MUI defines `defaultProfile = { displayName: t('components.card.privacy.private', { entity: 'space' }), url: '' }` and renders the same `SpaceCardHorizontal` for both private and public cases — substituting `defaultProfile` when `hasReadAccess === false`. No separate "Private space" component. The `bodyOfKnowledgeDescription` and the spaceBokDescription caption still render above the card.

**Decision.** ✅ **(c) — match current MUI exactly. The discriminated union's `kind: 'space'` always carries a populated `spaceProfile`; when private, the mapper synthesizes a placeholder `{ displayName: privacy-label, url: '', id: '', avatarImageUrl: null, level: 'L0' }`. The view renders one component for both cases.**

**Spec impact.**
- `contracts/vcProfile.ts`: `BodyOfKnowledge.kind === 'space'` updated — `spaceProfile` is now non-nullable; new `vcDisplayName` field added for the spaceBokDescription caption interpolation.
- `data-model.md`: BoK type updated; explanatory comment on the placeholder shape.
- `research.md`: new §12 captures the MUI parity finding.
- `tasks.md` T036: explicit instruction to synthesize the placeholder in the mapper.

---

## Q8 — Lazy-chunk granularity ✅

**Problem.** Plan claims "three new lazy-loaded chunks (User profile + Organization profile + VC profile) ≤ +35 KB gzipped combined." Tasks T021/T032/T046 each lazy-load their own routes file. But the *page components* (`CrdUserProfilePage`, etc.) — are they each their own React.lazy boundary, or do they all live in their actor's routes chunk?

**Options.**
- (a) Three chunks total — one per actor's `CrdXxxRoutes`. Each routes chunk includes the page + view components.
- (b) Six chunks — one per actor's routes file + one per actor's page component.
- (c) One combined chunk for all three actor routes.

**Recommendation.** (a) — matches the 045 / 091 / 097 precedent.

**Decision.** ✅ **(a) — three chunks total, one per actor's `Crd<Actor>Routes`. The per-actor page component lives inside its routes chunk. Shared `CompactContributorCard` and `MessagePopover` ride in the existing `crd-common` chunk.**

**Spec impact.**
- `plan.md` Performance Goals: chunk strategy made explicit.
- `data-model.md`: new "Bundle / chunk strategy" section.
- `research.md`: new §13 captures the rationale.

---

## Q9 — Doc cleanups bundle (C1, C3, C5, D1) ✅

**Problem.** A handful of small inconsistencies that don't gate implementation but should be fixed before merging.

- **C1** — research §1 incorrectly says `/organization/*` uses `<NonIdentity>` and `/vc/*` is "wrapped similarly to Organization." Actual: User → `<NoIdentityRedirect>`, VC → `<NonIdentity>`, Org → no auth wrapper.
- **C3** — Folder name `profilePages/` vs. namespace name `crd-profilePages` distinction is not stated.
- **C5** — data-model listed `useUserOrganizationIdsQuery` (with `Query` suffix); actual export is the wrapper `useUserOrganizationIds`.
- **D1** — FR-015a should be FR-016 (peer requirement, not parent-child of FR-015).

**Decision.** ✅ **All four fixed.**

**Spec impact.**
- `research.md` §1: replaced narrative with a verified per-route wrapper table.
- `research.md` §7: explicit folder-vs-namespace note.
- `data-model.md`: hook name corrected to `useUserOrganizationIds`.
- `spec.md` / `plan.md` / `data-model.md`: all `FR-015a` references renamed to `FR-016`.

---

## Resolution log

All nine questions resolved. Files patched in one editorial pass:

| File | Touched |
|---|---|
| `spec.md` | FR-009 wording (Q3), FR-015a → FR-016 rename (D1) |
| `plan.md` | Primary Dependencies (Q1+Q2), Performance Goals chunk note (Q8), file tree (Q2), SOLID/DRY note (Q1+Q2), FR-015a → FR-016 (D1) |
| `research.md` | §1 verified wrapper table (C1), §5 popover location note (Q2), §7 namespace doc (C3), new §11 (Q4), §12 (Q7), §13 (Q8) |
| `data-model.md` | hook name (C5), CompactContributorCardItem + AssociatedOrganizationCard mapping (Q1), BoK private-space placeholder (Q7), VC error path (Q4), new "Query → region" tables (Q3), new "Bundle / chunk strategy" (Q8), FR-015a → FR-016 (D1) |
| `contracts/compactContributor.ts` | `secondaryCaption` field (Q1) |
| `contracts/publicProfile.ts` | per-region `loading` (Q3), AssociatedOrganizationCard mapping comment (Q1) |
| `contracts/organizationProfile.ts` | per-region `loading` (Q3) |
| `contracts/vcProfile.ts` | per-region `loading` (Q3), BoK `space` variant non-nullable spaceProfile + vcDisplayName (Q7) |
| `tasks.md` | T006 secondaryCaption note (Q1), new T006a `MessagePopover` (Q2), T011/T025/T036 per-region loading (Q3), T014 consumes common Popover (Q2), T015 retired (Q2), new T014a hero render+a11y (Q5), new T016a kbd test (Q5), T026a aria-busy (Q5), T038a a11y note (Q5), T021 `/me` rewrite (Q6), T036 BoK placeholder (Q7), T045 ErrorBoundary note (Q4), T027 consumes common Popover (Q2), hook name (C5) |

Suggested commit message: `spec: resolve speckit.analyze interview decisions`.

Open follow-ups:
- None gating implementation. Once 097 lands, T021's "placeholder fall-back to MUI for `settings/*`" can be replaced with the real `CrdUserAdminRoutes` import — already a tracked dependency in tasks.md "Ship Coupling" notes.
