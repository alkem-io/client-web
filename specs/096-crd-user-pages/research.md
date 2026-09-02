# Phase 0 Research — CRD Public Profile Pages (User, Organization, VC)

This document resolves the open architectural decisions identified during planning. Every "NEEDS CLARIFICATION" from the Technical Context is settled below; no unresolved item gates Phase 1. Decisions about the seven User Settings tabs live in sibling spec `097-crd-user-settings/research.md`.

---

## 1. Anonymous-viewer access — per actor route wrappers

**Question**: FR-008 states each public profile page MUST be reachable under the same authentication conditions as today (parity with current MUI route wrappers). What are those wrappers exactly, and does CRD preserve them?

**Investigation** (verified directly against `src/main/routing/TopLevelRoutes.tsx`):

| Route | Wrapper today | Anonymous viewer behavior |
|---|---|---|
| `/user/*` | `<NoIdentityRedirect>` | Redirected to login |
| `/vc/*` | `<NonIdentity>` | Allowed to load; `useRestrictedRedirect` enforces `Read` privilege downstream |
| `/organization/*` | _no auth wrapper_ (only `<WithApmTransaction>` + `<Suspense>`) | Allowed to load; Settings + Message buttons gate themselves |

Each route therefore preserves a different combination of access-gating semantics, and the CRD migration must mirror them exactly.

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

**Investigation** (corrected vs. earlier draft — see §14 below):
- `OrganizationPageBanner` receives `onSendMessage` as a prop. Tracing back through `useOrganizationProvider().handleSendMessage` (`src/domain/community/organization/useOrganization/useOrganization.ts:129-139`), the mutation is **`useSendMessageToOrganizationMutation`** — NOT `useSendMessageToUsersMutation`. Input shape is `{ messageData: { message, organizationId } }` — different from the User-side `{ messageData: { message, receiverIds: [userId] } }`. An earlier draft of this section claimed both verticals used the same mutation; that was wrong.

**Decision**: **Two integration helpers, one recipient-agnostic UI primitive.** The User and Organization integration layers each have a dedicated handler (`useSendMessageToUserHandler` / `useSendMessageToOrganizationHandler`) that wraps its own GraphQL mutation. Both helpers expose the **same `(text: string) => Promise<void>` API**, so the presentational `MessagePopover` (and the heroes that use it) stay recipient-agnostic — the popover doesn't know whether the message is going to a user or an organization, only that it has a "send" callback. Visually and behaviorally, the surface is identical for both recipient types.

**Rationale**:
- The two GraphQL mutations have **different input shapes** (`receiverIds: string[]` vs. `organizationId: string`); they are not interchangeable. A single shared helper would have to either (a) branch internally on recipient type, conflating two GraphQL operations into one wrapper, or (b) silently fail at runtime on Org. Two helpers keeps each thin and matches the GraphQL contract.
- The presentational layer is still recipient-agnostic — it just calls `onSendMessage(text)`. Two helpers with identical *external* APIs satisfy the DRY principle from the consumer's point of view; the implementation difference is invisible to the popover.
- Both helpers track `sending` and `error` state identically and expose the same return shape (`SendMessageHandlerResult`).

**Alternatives considered**:
- One shared helper parameterized by recipient kind (`'user' | 'organization'`) that branches internally. **Rejected** — two mutations with two input shapes don't naturally fit one wrapper; the branching would be invisible to grep and a future maintainer would have to read the handler body to know which mutation fires for which recipient. Two named helpers are clearer.
- Pre-compute a single envelope-shaped variable + use one mutation. **Impossible** — the mutations have different operation names server-side.
- Build a recipient-list selector into the hero. **Rejected** — couples the hero to multi-recipient semantics that aren't needed here.

**Implementation note**: Both helpers live in **the same file** at `src/main/crdPages/topLevelPages/common/useSendMessageHandler.ts` (named exports: `useSendMessageToUserHandler` and `useSendMessageToOrganizationHandler`) — under the cross-vertical `topLevelPages/common/` folder that mirrors `src/crd/components/common/` for presentational primitives. Both User and Organization integration layers import their respective helper from `common/` so neither vertical cross-imports the other. The shared `MessagePopover` in `src/crd/components/common/MessagePopover.tsx` consumes whichever helper the integration page wires in — the popover sees only `(text: string) => Promise<void>`.

**Companion CRD primitive (Q2 decision):** the in-hero compose surface itself — `MessagePopover` — lives at `src/crd/components/common/MessagePopover.tsx`, NOT under `src/crd/components/user/`. This avoids a cross-vertical import from `OrganizationPageHero` into the User folder. Both heroes consume `MessagePopover` from `common/`; the popover is recipient-agnostic by design (its only callback is `onSendMessage(text: string): Promise<void>`). Visual divergence, if it ever appears, can be handled with a `variant` prop later — without further refactor.

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

**Decision**: **One shared namespace: `crd-profilePages`.** All three actor pages register their keys under this single namespace. The namespace is declared at `src/crd/i18n/profilePages/profilePages.<lang>.json`, registered in `src/core/i18n/config.ts` and `@types/i18next.d.ts`.

> **Folder vs. namespace name (C3 doc fix).** The folder is `profilePages/` (matches the file prefix `profilePages.<lang>.json`); the i18n namespace is `crd-profilePages`. The `crd-` prefix is a project-wide convention for CRD namespaces (e.g., `exploreSpaces/` → `crd-exploreSpaces`, `userSettings/` → `crd-userSettings`). They are intentionally different — the folder name avoids the prefix; the namespace key carries it. Where current MUI uses generic translation keys already defined in `src/core/i18n/en/translation.en.json` (e.g., `pages.user-profile.communities.noMembership`, `components.contributions.allMembershipsTitle`, `components.profile.fields.bodyOfKnowledge.title`), the CRD page MAY reuse those existing keys via the `translation` namespace rather than duplicating them under `crd-profilePages` (FR-102).

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

---

## 11. Error path beyond 404 (Q4 — analysis-interview.md)

**Question**: data-model previously said "query other error → surface CRD error display (parity with current MUI)." No CRD error component existed in the contracts; no task created one.

**Investigation**: Current MUI `VCProfilePage` only handles the not-found case explicitly via `isApolloNotFoundError` → `Error404`. Every other error bubbles up to the global `ErrorBoundary` already wrapping the app — there is no dedicated MUI error display either.

**Decision**: **Drop the "other error → CRD error display" line.** Only `isApolloNotFoundError` is handled explicitly (FR-036 → existing `Error404`). Anything else propagates to the global ErrorBoundary. No new CRD error component is created; no task is added.

**Rationale**: This is a parity migration. Introducing a CRD error component the MUI page never had is scope creep. The global ErrorBoundary already produces a usable failure UX.

**Alternatives considered**:
- Build a new `CrdErrorState` primitive under `src/crd/components/common/`. **Rejected** — adds work without parity benefit.
- Reuse an existing CRD primitive opportunistically. **Rejected** — same risk: adds non-parity behavior with no clear win.

---

## 12. VC Body-of-Knowledge "Private space" placeholder (Q7 — analysis-interview.md)

**Question**: When the viewer lacks `ReadAbout` on a Space-backed VC's body of knowledge, what does the BoK section actually render?

**Investigation**: `src/domain/community/virtualContributor/vcProfilePage/VCProfilePageView.tsx:74` defines:

```ts
const defaultProfile = { displayName: t('components.card.privacy.private', { entity: 'space' }), url: '' };
```

and renders the same `SpaceCardHorizontal` for both private and public cases — substituting `defaultProfile` for the space profile when `hasReadAccess === false`. The `bodyOfKnowledgeDescription` and the spaceBokDescription caption (interpolating the VC's display name) still render above the card.

**Decision**: **Match MUI exactly.** The BoK discriminated union's `kind: 'space'` variant always carries a populated `spaceProfile`; when `hasReadAccess === false`, the mapper synthesizes a placeholder with `displayName = privacy label` (i18n: `components.card.privacy.private` with `entity: 'space'`) and empty URL/avatar/level. The view renders the same `SpaceCardHorizontal`-equivalent component for both cases — no separate "Private space" component exists.

**Rationale**: Parity migration. The MUI behavior is the spec.

---

## 13. Lazy-chunk granularity (Q8 — analysis-interview.md)

**Decision**: **Three lazy-loaded chunks total, one per actor's `Crd<Actor>Routes`.** The per-actor page component (`CrdUserProfilePage`, `CrdOrganizationProfilePage`, `CrdVCProfilePage`) lives inside its routes chunk; it is NOT a separate `React.lazy()` boundary. The shared `CompactContributorCard` and `MessagePopover` primitives live in the small `crd-common` chunk that is already shared across CRD pages.

**Rationale**: Matches the precedent set by 045 / 091 / 097 (one route shell per vertical, page nested inside it). The +35 KB combined budget (SC-005) fits this shape. Six chunks would over-fragment; one combined chunk would inflate every actor's first-paint cost.

**Note**: This is a deliberate deviation from the example in `docs/crd/migration-guide.md` (which lazy-loads the page component itself via `lazyWithGlobalErrorHandler` directly in `TopLevelRoutes.tsx`). The route-shell-level lazy boundary is the established CRD-spec convention; the migration guide's example was written for single-page migrations and predates the multi-route verticals introduced by 045 / 091 / 097.

---

## 14. Post-implementation corrections (F1 / F2 / F3 from the analyze pass)

After Phase 5 implementation, three factual errors in the earlier drafts were caught and patched. They are recorded here so future re-runs of `/speckit.analyze` don't regress them.

**F1 (CRITICAL — Org send-message mutation)**: The earlier draft of §5 incorrectly assumed Org Message reused `useSendMessageToUsersMutation` with `{ receiverIds: [orgId] }`. The actual MUI flow uses **`useSendMessageToOrganizationMutation` with `{ message, organizationId }`** — a different mutation with a different input shape. Resolution: split into two integration helpers, both exposing the same `(text) => Promise<void>` API. The shared `MessagePopover` UI primitive remains recipient-agnostic. See §5 above (now corrected) and FR-022.

**F2 (HIGH — Org sidebar social links)**: The earlier draft of FR-023 listed only four sidebar sections (Bio / Tagsets / References / Associates) and described References as "links from `profile.references[]`", which silently dropped the social-network references that current MUI `OrganizationProfileView` renders via `<SocialLinks>`. Spec/contracts/data-model claimed parity restyle but actually lost UI. Resolution: References split via `isSocialNetworkSupported`; non-social rendered as link list, social rendered in a new fifth sidebar sub-block "Social" using a generic `Link2` glyph (lucide brand icons no longer ship). FR-023 expanded to five sections.

**F3 (HIGH — VC right column parity claim)**: The earlier draft of FR-034 claimed "exact parity with current MUI `VCProfileContentView`" rendering "model card details (`aiEngine`, `prompts`, `dataPrivacy`) and social links." Inspection of `src/domain/community/virtualContributor/vcProfilePage/VCProfileContentView.tsx` shows the MUI version (a) renders **hard-coded placeholder data** from `useTemporaryHardCodedVCProfilePageData(modelCard)` with an explicit `// REMOVE when data is fetched from server` TODO, and (b) does NOT display social references at all. "Exact parity" was therefore impossible. Resolution: re-framed as a **modernization** — CRD content view renders real `modelCard.aiEngine` data from GraphQL and surfaces social references with a generic `Link2` glyph. The MUI's hard-coded `functionality` and `monitoring` blocks are out of scope and not ported.

**Brand-icon caveat**: A separate finding surfaced during implementation: `lucide-react` no longer exports brand icons (`Linkedin` / `Github` / `Twitter` / `Youtube`) — they were removed from the package due to trademark considerations. Both Org `Social` (FR-023) and VC content view social links (FR-034) fall back to a generic `Link2` icon with platform identity in `aria-label`. A future enhancement may introduce a dedicated CRD primitive with exact-fidelity brand SVGs if product asks.

---

## 15. VC profile redesign — right column rebuild (2026-05-06)

**Question**: The VC prototype was updated and now defines a fresh visual structure for the hero AND the right column. The earlier §14/F3 correction reframed the right column as a "modernization" rendering only `aiEngine.*` data + a Social Links sub-section. The updated prototype goes much further: it adds back **Functionality** (3 cards) + **AI Engine** (6 transparency cards) + **Monitoring by Alkemio** sections, plus a hero "Virtual Contributor" badge and a Keywords skill-tag chip row. How does the CRD VC page reconcile this with the existing MUI `useTemporaryHardCodedVCProfilePageData(modelCard)` hook which is the source of the labels but is named "Temporary"?

**Investigation**:

- The current MUI `VCProfileContentView` renders three sections via `useTemporaryHardCodedVCProfilePageData`: (i) Functionality with three `SectionItem` cards (Capabilities / Data Access / Role Requirements) sourced from `modelCard.spaceUsage[]`; (ii) AI Engine with six cells sourced from `modelCard.aiEngine.*`; (iii) Monitoring with a single descriptive paragraph. The hook contains **hard-coded English strings** plus two `dangerouslySetInnerHTML` calls (Role Requirements `<strong>member rights</strong>`, Monitoring T&C anchor) and has a `// REMOVE when data is fetched from server and use Trans!` TODO.
- The data-extraction logic in the hook IS production-quality — it correctly maps `modelCard.spaceUsage[]` → bullet rows, derives the engine display name from `aiEngine.isExternal` + `isAssistant`, handles the `null` case for `isInteractionDataUsedForTraining`. The "Temporary" label refers to the hard-coded labels, NOT the extraction logic.
- The updated prototype `prototype/src/app/pages/VCProfilePage.tsx` (verified 2026-05-06) renders exactly this three-section structure, using shadcn `Card` + lucide-react icons (`CircuitBoard` / `Upload` / `Users` for Functionality; `Eye` / `Database` / `ShieldCheck` / `Globe` / `MapPin` / `FileText` for AI Engine).
- The earlier §14/F3 conclusion ("MUI hard-coded `functionality` and `monitoring` blocks are out of scope and not ported") was based on an older version of the prototype that didn't include them. With the updated prototype, those sections ARE in scope — but the labels move to i18n and the `dangerouslySetInnerHTML` calls go away.

**Decision**: **Reuse the data-extraction logic; replace the labels with i18n keys; render HTML-tagged copy via `<Trans>`.** The CRD migration:

1. Re-implements the extraction logic (`modelCard.spaceUsage[]` → bullet rows, `aiEngine.*` → transparency answers, engine-display-name derivation) in plain TypeScript inside `src/main/crdPages/topLevelPages/vcPages/publicProfile/dataMapper.ts`. The CRD page does NOT import the MUI hook (which lives under `src/domain/`, off-limits per CRD architectural rules).
2. Moves all hard-coded English copy (3 section titles, 6 transparency-card titles, 6 captions, ~10 bullet labels, button copy, the `<strong>member rights</strong>` and Terms & Conditions HTML strings) into `src/crd/i18n/profilePages/profilePages.<lang>.json` under the `vcProfile.functionality.*` / `vcProfile.aiEngine.*` / `vcProfile.monitoring.*` key prefixes.
3. Replaces both `dangerouslySetInnerHTML` calls with `<Trans i18nKey="..." components={{ strong: <strong />, a: <a target="_blank" rel="noreferrer" href="https://welcome.alkem.io/legal/#tc" /> }} />` per CRD Golden Rule 10 (`src/crd/CLAUDE.md` — "Never Render Markdown / HTML-Tagged Strings As Plain Text").
4. Leaves the MUI hook `useTemporaryHardCodedVCProfilePageData.ts` **completely unchanged** — it continues to power the legacy MUI page when CRD is OFF.
5. Adds the hero "Virtual Contributor" type badge + Keywords skill-tag chip row (sourced from `vc.profile.tagsets` resolved against `TagsetReservedName.Keywords`, parity with the User profile keyword pills).
6. Switches the sidebar References block from MUI's "split + discard social refs" to the prototype's flat list of all references — narrow divergence from MUI documented in spec.md Session 2026-05-06.

**Rationale**:
- The "logic-vs-labels" split is the cleanest expression of intent: the logic stays (it's the meaningful product behaviour), the hard-coded labels go (they were always meant to be i18n keys per the MUI source TODO).
- Re-implementing the extraction in the CRD mapper rather than importing the MUI hook keeps the CRD page strictly compliant with `src/crd/CLAUDE.md` (no `@/domain/*` imports from CRD-layer code).
- Not modifying the MUI hook keeps the legacy MUI page working until the global CRD toggle is removed and all MUI files are deleted in one cleanup pass.
- `<Trans>` is the project-wide standard for HTML-tagged i18n strings; `dangerouslySetInnerHTML` is explicitly banned by CRD Golden Rule 10.

**Alternatives considered**:
- Move the MUI hook to a shared location and import it from both pages. **Rejected** — (a) violates the CRD `no @/domain/* imports` rule; (b) the hook returns React-shaped objects with `bullets[].icon: string` keys ("check" / "exclamation") that would need re-shaping anyway for the CRD components.
- Modify the MUI hook in place to produce structured i18n-key data. **Rejected** — would change the MUI page's runtime behaviour (it currently renders English literals; switching it to i18n keys requires the MUI page to also call `t()` on the returned values, expanding scope into MUI-page changes that the spec explicitly excludes).
- Keep the §14/F3 "modernization" approach and skip Functionality / Monitoring entirely. **Rejected by user 2026-05-06** — the updated prototype includes those sections, and dropping them would visually under-deliver against the prototype.

**Three new presentational CRD components introduced**:

- `src/crd/components/virtualContributor/VCFunctionalityGrid.tsx` — 3-column responsive `Card` grid for Capabilities / Data Access / Role Requirements. Props: `{ capabilities: BulletItem[]; dataAccess: BulletItem[]; roleRequirements: { kind: 'memberRequired' | 'noneRequired' }; labels }`. Renders Check / Minus glyphs based on `enabled`. Uses `<Trans>` for the Role Requirements memberRequired variant.
- `src/crd/components/virtualContributor/VCAiEngineGrid.tsx` — 3×2 responsive grid wrapping a small reusable `VCTransparencyCard` sub-component. Props: `{ engineName: string; cards: TransparencyCardData[] }`. Each card supports either a Yes/No answer with a configurable "no" glyph (Web Access uses `Clock` instead of `XCircle` per the prototype) or a plain text answer.
- `src/crd/components/virtualContributor/VCMonitoringSection.tsx` — `Separator` + heading + `<Trans>`-rendered paragraph. Props: `{ labels: { heading; bodyKey } }`. The `bodyKey` is passed through to `<Trans>` so the consumer's `i18n.t()` resolves the embedded `<a>` component.

The three sections compose inside `VCContentView.tsx` which becomes a thin wrapper over them.

---

## Summary

All NEEDS CLARIFICATION items are resolved. Four post-implementation corrections (F1 / F2 / F3 from §14, plus the 2026-05-06 VC redesign in §15) are recorded above and reflected in spec.md / data-model.md / contracts/. No GraphQL schema change. New runtime artifacts: the shared CRD primitive `CompactContributorCard` at `src/crd/components/common/`, the shared `MessagePopover` at `src/crd/components/common/`, and three new VC content-view components at `src/crd/components/virtualContributor/` (`VCFunctionalityGrid`, `VCAiEngineGrid`, `VCMonitoringSection`). One new CRD i18n namespace (`crd-profilePages`) shared across all three actor pages, with the VC redesign adding ~30 keys under `vcProfile.functionality.*` / `vcProfile.aiEngine.*` / `vcProfile.monitoring.*`. The migration is a presentation-layer port plus a small set of shared primitives plus two architectural patterns (BoK discriminated-union resolver for VC profiles; data-mapper-based reuse of MUI's space-usage / aiEngine extraction logic). Phase 1 (`data-model.md`, `contracts/`, `quickstart.md`) follows.
