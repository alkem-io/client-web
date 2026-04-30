# Phase 0 Research — CRD Public Profile Pages (User, Organization, VC)

This document resolves the open architectural decisions identified during planning. Every "NEEDS CLARIFICATION" from the Technical Context is settled below; no unresolved item gates Phase 1. Decisions about the seven User Settings tabs live in sibling spec `097-crd-user-settings/research.md`.

---

## 1. Anonymous-viewer access — per actor route wrappers

**Question**: FR-008 states each public profile page MUST be reachable under the same authentication conditions as today (parity with current MUI route wrappers). What are those wrappers exactly, and does CRD preserve them?

**Investigation**:
- `src/main/routing/TopLevelRoutes.tsx` wraps the three actor routes differently:
  - `/user/*` is wrapped by `<NoIdentityRedirect>` — so anonymous viewers hitting any `/user/*` URL (including the public profile) are redirected to login. This is the actual MUI behavior, despite some prose elsewhere suggesting the public profile is reachable anonymously.
  - `/organization/*` is wrapped by an `<NonIdentity>` (or equivalent) wrapper that **does** allow anonymous viewers to load the public Organization profile. The Settings icon and Message button gate themselves separately based on viewer identity.
  - `/vc/*` is wrapped similarly to Organization — anonymous viewers can load the page, with `useRestrictedRedirect` enforcing the `Read` privilege check downstream (which still allows the page render path for VCs that have public Read).

**Decision**: **Preserve the existing per-actor wrapper exactly.** Each `CrdXxxRoutes` is wrapped by the same wrapper its MUI counterpart uses today, at the same point in `TopLevelRoutes.tsx`. The CRD migration is presentation-only — it must not change route-level access semantics.

**Rationale**: Diverging from current MUI behavior for anonymous viewers would (a) be a behavior change disguised as a "migration" and (b) require coordinating a routing-tree change that is outside the scope of a presentational migration. Parity wins.

**Alternatives considered**:
- Standardize all three actor routes to one wrapper. **Rejected** — the difference reflects a deliberate product decision (Org and VC are publicly browsable; User isn't fully today). Out of scope for a presentation-layer migration.

---

## 2. Tab labels on the User profile resource strip

**Question**: An earlier clarification thread questioned the prototype's `All Resources / Hosted Spaces / Virtual Contributors / Leading / Member Of` tab labels. The user dropped the thread without prescribing a change.

**Decision**: **Keep the prototype's exact labels** (`All Resources`, `Hosted Spaces`, `Virtual Contributors`, `Leading`, `Member Of`). All five are defined as i18n keys under `src/crd/i18n/profilePages/profilePages.en.json` and translated into the other five languages.

**Rationale**: The prototype source `prototype/src/app/pages/UserProfilePage.tsx:91` defines exactly these five tabs; the user dropped the rename thread without alternative wording; the spec's narrative is internally consistent with these labels. Per-tab section filtering is documented in `data-model.md`.

**Alternatives considered**:
- Rename `All Resources` to something else (e.g., `Account`, `Overview`). **Rejected** — without an explicit user direction, renaming would diverge from the prototype.

---

## 3. Organization profile — section composition vs. current MUI

**Question**: How does the CRD Organization profile compose its sidebar and right column relative to the current MUI `OrganizationPageView`? In particular, the current MUI uses `OrganizationProfileView` (a single combined component covering bio + tagsets + references) and `AssociatesView` (associates list). CRD should not embed those MUI components per FR-005, but should achieve parity.

**Decision**: **Decompose the current MUI `OrganizationProfileView` into four CRD sidebar sections** — `Bio`, `Tagsets`, `References`, `Associates` — each rendered as its own CRD card under the new `OrganizationProfileSidebar` component. Right column composition is unchanged from current MUI (`AccountResourcesView` data path → CRD section, then Lead Spaces tile section, then All Memberships tile section), implemented as `OrganizationResourceSections`.

**Rationale**:
- The current MUI's `OrganizationProfileView` is a tightly-coupled component that imports MUI primitives heavily; embedding it in a CRD page would violate FR-005.
- Decomposing into named sections matches CRD's section-card convention and preserves visual parity.
- The `Associates` privilege gating (`canReadUsers`) cleanly maps to a per-section visibility flag at the mapper level.

**Alternatives considered**:
- Render the current MUI components inside CRD via a Portal or iframe. **Rejected** — violates FR-005 and breaks the CRD chunk boundary.
- Keep `OrganizationProfileView` as a single CRD component (one big card with all four parts). **Rejected** — harder to test in isolation; less flexible if a future page wants only one of the parts.

---

## 4. VC profile — Body of Knowledge variant resolver

**Question**: The current MUI `VCProfilePageView` renders the BoK section conditionally based on three booleans (`hasSpaceKnowledge`, `hasKnowledgeBase`, `isExternal`) computed inline. How should the CRD layer model this so the variants stay testable and don't drift?

**Decision**: **Discriminated union at the mapper boundary.** The mapper produces a `BodyOfKnowledge` value of one of three shapes:

```ts
type BodyOfKnowledge =
  | { kind: 'space';          spaceId: string;  spaceProfile: SpaceProfileSummary; hasReadAccess: boolean }
  | { kind: 'knowledgeBase';  description: string;  hasReadAccess: boolean;  visitUrl: string }
  | { kind: 'external';       engineLabel: 'assistant' | 'other' }
  | null;                                          // for VCs with no BoK at all (rare)
```

The presentational `VCBodyOfKnowledgeSection` component switches on `kind` and renders the matching layout. The conditional booleans (`hasSpaceKnowledge`, `hasKnowledgeBase`, `isExternal`) are computed in the mapper, not in the view — so the view stays a pure render function (Constitution Principle II) and unit-testable.

**Rationale**:
- A discriminated union eliminates the inline boolean dance in the current MUI view.
- The `hasReadAccess` flag is computed in the mapper from `useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery` (for Space-backed) or `useKnowledgeBase()` (for Knowledge-Base-backed) — exactly the same predicate the current MUI uses.
- The `engineLabel` collapses two MUI-side boolean checks (`isAssistant` vs. anything else) into a single string union for the view.

**Alternatives considered**:
- Pass all three booleans + all three data fields to the view, let it choose. **Rejected** — pushes business logic into the view (violates DIP) and makes testing the view harder.
- Three separate components, one per variant. **Rejected** — the parent page would need to do the kind-switching itself; the discriminated-union approach centralizes that in the mapper.

---

## 5. Send-message handler — User vs. Organization parity

**Question**: The User profile uses `useSendMessageToUsersMutation`. The Organization profile's current MUI `OrganizationPageBanner` calls a similar `onSendMessage` callback. What mutation is that and how does CRD wire it?

**Investigation**:
- `OrganizationPageBanner` receives `onSendMessage` as a prop. Tracing back through `useOrganizationProvider`, the mutation is the same `useSendMessageToUsersMutation` — but the recipient list is `[organization.id]` (organizations are Communication Contributors; users can message them via the same mutation).

**Decision**: **One shared CRD `useSendMessageHandler` helper, parameterized by recipient ID.** Both the User and Organization integration layers consume the same wrapped hook; the mapper passes the recipient ID (user ID or org ID) to the helper. The presentational hero components (`UserPageHero` and `OrganizationPageHero`) receive a uniform `onSendMessage(text: string): Promise<void>` callback prop.

**Rationale**:
- Avoids two near-identical wrappers (`useSendUserMessageHandler` and `useSendOrgMessageHandler`).
- The mutation contract (`{ message, receiverIds: [...] }`) is identical regardless of recipient type.
- The presentational layer is recipient-agnostic — it just calls `onSendMessage(text)`.

**Alternatives considered**:
- Two separate handler hooks. **Rejected** — DRY violation; only differing input is `receiverIds`.
- Build a recipient-list selector into the hero. **Rejected** — couples the hero to multi-recipient semantics that aren't needed here.

**Implementation note**: The shared helper file lives at `src/main/crdPages/topLevelPages/userPages/publicProfile/useSendMessageHandler.ts` (already in the User vertical from spec 096's earlier scope). The Organization integration imports it directly. This is the only cross-vertical import in the integration layer; it does NOT introduce a barrel.

---

## 6. New shared CRD primitive: `CompactContributorCard`

**Question**: The VC profile's Host section and the Organization profile's Associates list both need a small contributor card (avatar + display name + optional role/caption + optional click-through URL). The existing MUI `ContributorCardHorizontal` is MUI-only. What does the CRD equivalent look like?

**Decision**: **Introduce one new shared CRD primitive at `src/crd/components/common/CompactContributorCard.tsx`.** Props:

```ts
type CompactContributorCardProps = {
  avatarImageUrl: string | null;          // null → fallback initials avatar
  displayName: string;
  caption?: string | null;                 // role label or location — optional
  href?: string;                           // click-through to the contributor's profile (uses <a>)
  variant?: 'compact' | 'spacious';        // 'compact' default; 'spacious' for the Org Associates list
  ariaLabel?: string;
};
```

The component is **purely presentational**: zero `@mui/*` imports, zero GraphQL imports, behavior received as `href` (link). It uses CRD primitives `card.tsx` and `avatar.tsx` only.

**Rationale**:
- Two pages on day one use it (VC Host card, Org Associates list); a third use case (User profile sidebar's Organizations list) is also conceivable but is already implemented via a shared OrganizationCard pattern. Parity beats anticipation.
- A small focused primitive (~30 LOC) is easy to test and unlikely to grow.
- Follows the `src/crd/components/common/` convention for shared cross-vertical components (precedent in prior CRD specs).

**Alternatives considered**:
- Inline the JSX in both consumers. **Rejected** — DRY violation by Arch #6.
- Reuse the existing `SpaceCard` primitive and pass contributor data through it. **Rejected** — `SpaceCard` is space-specific; forcing contributors through it would distort its props interface (ISP violation).

---

## 7. i18n namespace strategy for three pages

**Question**: Should the three profile pages share one i18n namespace, or each get its own?

**Decision**: **One shared namespace: `crd-profilePages`.** All three actor pages register their keys under this single namespace. The namespace is declared at `src/crd/i18n/profilePages/profilePages.<lang>.json`, registered in `src/core/i18n/config.ts` and `@types/i18next.d.ts`. Where current MUI uses generic translation keys already defined in `src/core/i18n/en/translation.en.json` (e.g., `pages.user-profile.communities.noMembership`, `components.contributions.allMembershipsTitle`, `components.profile.fields.bodyOfKnowledge.title`), the CRD page MAY reuse those existing keys via the `translation` namespace rather than duplicating them under `crd-profilePages` (FR-102).

**Rationale**:
- The three pages share many concepts (hero affordances, location string, empty-state captions, "Member Of" / "Lead Spaces" labels) — splitting into three namespaces would either duplicate keys or require cross-namespace lookups.
- One namespace keeps the i18n bundle compact (estimated ~50–80 keys total across all three pages).
- Sibling spec `097-crd-user-settings` owns its own `crd-userSettings` namespace because the settings shell is a fundamentally different surface; the public profile views are visually and semantically aligned, so they share.

**Alternatives considered**:
- Three namespaces (`crd-userProfile`, `crd-orgProfile`, `crd-vcProfile`). **Rejected** — duplicates cross-page keys.
- Reuse the existing `translation` namespace exclusively. **Rejected** — pollutes the global `translation` namespace with CRD-specific copy and breaks the convention established by other CRD specs (each CRD feature gets its own namespace).

---

## 8. Performance targets

**Decisions**:
- **Page render** (any actor type): target < 5 s perceived (SC-001), achieved by lazy-loading each `CrdXxxProfilePage` as its own React.lazy chunk.
- **Resource tab switch latency** (User profile only): target < 200 ms perceived; achieved by data-driven section filtering (no remount cost) + React 19 `useTransition` so a slow filter does not block paint.
- **Send-message round-trip** (User + Organization): target < 3 s typical; surfaced via the Send button's spinner state and `aria-busy`.
- **Bundle delta**: ≤ +35 KB gzipped across the three new chunks combined over the prior build (SC-005). Verified post-implementation via `pnpm analyze`. This is +15 KB more than the original 096-User-only budget, accounting for two additional pages and the new `CompactContributorCard` primitive.

**Rationale**: These are the same per-page performance budgets the prior CRD migrations set; the combined +35 KB budget reflects the three-page expansion of this spec.

---

## 9. Tests

**Decisions**:
- **Mappers** — one Vitest file per mapper:
  - `publicProfileMapper.test.ts` (User) — covers the resource tab → section filter, leading vs. member-of split, empty-state behavior.
  - `organizationProfileMapper.test.ts` — covers the four sidebar sections (Bio / Tagsets / References / Associates with `canReadUsers` gating), the three right-column sections (Account Resources omitted when empty, Lead Spaces filtered, All Memberships empty-state), the verified-badge predicate.
  - `vcProfileMapper.test.ts` — covers the BoK discriminated-union resolver (three variants: space / knowledgeBase / external), the social vs. non-social references split via `isSocialNetworkSupported`, the model card data shape, the 404 / Restricted redirect plumbing.
- **Resource tab strip / sections render** — a small render test on `UserResourceSections` covering `allResources` renders all three sections; `hostedSpaces` renders only the Spaces sub-section; etc.
- **VC BoK section render** — a small render test on `VCBodyOfKnowledgeSection` per `kind` variant: `space` renders the SpaceCardHorizontal-equivalent; `knowledgeBase` renders the description + Visit button (disabled when `hasReadAccess === false`); `external` renders the engine-type copy.
- **Route guards** — `useCanEditSettings` Vitest tests (User) covering owner / admin / non-admin / anonymous; the result drives the gear-icon visibility on the User profile hero.
- **i18n keys present in all six languages** — a small runtime test that each language file has the same key shape (existing pattern in the codebase).

**Rationale**: Unit-test the pure transformation logic for each actor type; rely on manual smoke for the end-to-end views (consistent with the prior CRD specs).

---

## 10. Three-page coupling — ship together vs. independent rollout

**Question**: The spec says all three pages ship together with sibling spec 097 as one user-vertical release. But what about partial rollout — can we ship just the User profile and leave Org/VC for a follow-up?

**Decision**: **Ship all three together.** Both this spec and 097 are gated by the same `useCrdEnabled` toggle. If the toggle flips on but only the User profile is implemented in CRD, viewers would land on a CRD User page that links to Org/VC pages still rendered in MUI — visually consistent only insofar as both halves are accessed through the platform header, but inconsistent in the per-page experience. The existing CRD-vs-MUI parallel-systems pattern (spec 045 / 091 / 097) requires every routed page in a vertical to be ready before the toggle flips.

**Rationale**: Consistency of the user-vertical experience under the CRD toggle. Partial rollout would require either (a) per-actor toggles (over-engineering) or (b) a feature flag that disables the User-profile gear icon for org/VC viewers (visual regression). Better to ship the bundle.

**Alternatives considered**:
- Per-actor CRD toggle (`alkemio-crd-user-enabled`, `alkemio-crd-org-enabled`, etc.). **Rejected** — over-engineering for a transitional state. The existing single-toggle pattern is intentional.
- Ship User first, then expand to Org/VC in follow-up PRs gated by the same toggle. **Rejected** — would force the toggle to gate a heterogeneous (CRD User + MUI Org/VC) experience, which is exactly the half-CRD/half-MUI mix this migration explicitly avoids.

---

## Summary

All NEEDS CLARIFICATION items are resolved. No GraphQL schema change. One new runtime dependency (the new shared CRD primitive `CompactContributorCard` at `src/crd/components/common/`). One new CRD i18n namespace (`crd-profilePages`) shared across all three actor pages. The migration is a presentation-layer port plus one shared primitive plus one architectural pattern (the BoK discriminated-union resolver for VC profiles). Phase 1 (`data-model.md`, `contracts/`, `quickstart.md`) follows.
