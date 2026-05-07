# Phase 1 — Data Model & Mapping (Public Profile Pages)

This document enumerates the entities consumed by the CRD public profile pages for the three actor types — **User**, **Organization**, and **Virtual Contributor** — the GraphQL hooks they originate from, the CRD prop shapes the views expect, and the mapping rules that bridge the two. Every CRD prop type listed here is plain TypeScript (no generated GraphQL imports) per FR-005.

The mapper for each page lives at `src/main/crdPages/topLevelPages/<vertical>/publicProfile/<page>Mapper.ts` and is the only place GraphQL types are visible. Sibling spec `097-crd-user-settings` covers the User Settings tabs' data model — see `specs/097-crd-user-settings/data-model.md`.

---

## Source GraphQL hooks (existing — unchanged)

### User profile

| Hook | File | Purpose |
|---|---|---|
| `useUserProvider` | `src/domain/community/user/hooks/useUserProvider.ts` | Domain wrapper exposing `userModel` (`User`, `profile.*`, `firstName`, `lastName`); internally calls `useUserModelFullQuery` from `src/core/apollo/generated/apollo-hooks.ts`. CRD integration consumes the wrapper, not the generated hook directly. |
| `useUserAccountQuery` | same | Hosted resources (`account.spaces`, `account.virtualContributors`) for the Resources Hosted section |
| `useUserContributions` | `src/domain/community/user/userContributions/useUserContributions.ts` | Domain wrapper that calls `useUserContributionsQuery` and returns the memberships transformed to `SpaceHostedItem[]` (the shape `useFilteredMemberships` consumes). |
| `useUserOrganizationIds` | `src/domain/community/user/userContributions/useUserOrganizationIds.ts` | Org IDs the user is associated with (sidebar Organizations list); thin wrapper, not a generated Apollo hook |
| `useSendMessageToUsersMutation` | same | In-hero compose surface (User profile + Organization profile share this mutation) |

### Organization profile

| Hook | File | Purpose |
|---|---|---|
| `useOrganizationProvider` | `src/domain/community/organization/useOrganization/useOrganization.ts` | Resolves the organization + permissions + associates + contributions + capabilities + keywords + references from the URL |
| `useOrganizationAccountQuery` | `src/core/apollo/generated/apollo-hooks.ts` | Account-owned resources (`account.spaces`, `account.innovationPacks`, `account.innovationHubs`) for the Account Resources section |
| `useAccountResources` | `src/domain/community/contributor/useAccountResources/useAccountResources.ts` | Wraps the account resources data for the right column |
| `useFilteredMemberships` | `src/domain/community/user/hooks/useFilteredMemberships.ts` | Splits memberships into "filtered" (lead) vs. "remaining" (member-of) — shared with the User profile |
| `useUrlResolver` | `src/main/routing/urlResolver/useUrlResolver.ts` | Resolves the organization ID from the URL slug |

### VC profile

| Hook | File | Purpose |
|---|---|---|
| `useVirtualContributorProfileWithModelCardQuery` | `src/core/apollo/generated/apollo-hooks.ts` | VC profile + model card data |
| `useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery` | same | Read privilege check on a Space-backed VC's body of knowledge |
| `useSpaceBodyOfKnowledgeAboutQuery` | same | Backing space's about data when the viewer has read access |
| `useKnowledgeBase` | `src/domain/community/virtualContributor/knowledgeBase/useKnowledgeBase.ts` | Knowledge-base description + `hasReadAccess` flag for Knowledge-Base-backed VCs |
| `useUrlResolver` | `src/main/routing/urlResolver/useUrlResolver.ts` | Resolves the VC ID from the URL slug |
| `useRestrictedRedirect` | `src/core/routing/useRestrictedRedirect.ts` | Redirects viewers without the `Read` privilege |
| `useAuthenticationContext` | `src/core/auth/authentication/hooks/useAuthenticationContext.ts` | Auth loading flag |

### Cross-actor

| Hook | File | Purpose |
|---|---|---|
| `useCurrentUserContext` | `src/domain/community/userCurrent/useCurrentUserContext.ts` | Current viewer identity + `hasPlatformPrivilege(...)` (used by `useCanEditSettings`) |
| `pickColorFromId` | `src/crd/lib/pickColorFromId.ts` | Deterministic accent-color generator (used by avatar fallback and space-card banner fallback; not used by profile heroes — they have no banner) |
| `buildSettingsUrl` | `src/main/routing/urlBuilders.ts` | Builds the `/<entity>/<slug>/settings/...` URL for the gear icon (Org + VC use it; User uses a hardcoded path) |

---

## Entities consumed (CRD prop shapes)

### Entity: `UserPublicProfile` (User profile + sidebar)

```ts
type UserPublicProfile = {
  id: string;                       // user UUID
  slug: string;                     // nameID
  isOwn: boolean;                   // viewer is this user
  canEditSettings: boolean;         // owner OR platform admin (FR-008a / FR-011)
  hero: {
    avatarImageUrl: string | null;
    displayName: string;
    location: string | null;        // "City, Country" — null if both empty
  };
  bio: string | null;               // markdown — null if empty
  // Reserved profile tagsets — Keywords + Skills — resolved by
  // `TagsetReservedName.{Keywords,Skills}` against `profile.tagsets[]`.
  // Empty tagsets are dropped per-entry. The view hides the entire block
  // when `tagsets.length === 0` (parity with MUI `UserProfileView` which
  // conditionally renders each block).
  tagsets: TagsetGroup[];           // FR-010a
  organizations: AssociatedOrganizationCard[];
  resources: PublicProfileResources;
};
```

The `TagsetGroup` shape is identical to the one declared on the Organization
entity below (`{ name: string; tags: string[] }`). The CRD components share
the type via `@/crd/components/organization/OrganizationProfileSidebar`
(same precedent as `ReferenceLink`); no new shared module is introduced.

### Entity: `PublicProfileResources` (User profile right column section data)

```ts
type PublicProfileResources = {
  hostedSpaces: SpaceCardItem[];                    // user-hosted L0 spaces
  hostedVirtualContributors: VCCardItem[];          // user-hosted VCs
  hostedInnovationPacks: SimpleResourceCardItem[];  // backend field: account.innovationPacks; UI label "Template Packs"
  hostedInnovationHubs: SimpleResourceCardItem[];   // backend field: account.innovationHubs; UI label "Custom Homepages"
  spacesLeading: SpaceCardItem[];                   // useFilteredMemberships(contributions, [Lead, Admin]) — current MUI parity
  spacesMember: SpaceCardItem[];                    // remaining memberships
};

// Reused from `OrganizationResourceSections` (see Org-profile entity below).
// Prop shape is identical across both pages: id, displayName, description,
// avatarImageUrl, href.
type SimpleResourceCardItem = {
  id: string;
  displayName: string;
  description: string | null;
  href: string;
  avatarImageUrl: string | null;
};

type SpaceCardItem = {
  id: string;
  url: string;
  displayName: string;
  description: string | null;
  level: 'L0' | 'L1' | 'L2';               // string union per CRD Rule 4
  bannerImageUrl: string | null;
  avatarImageUrl: string | null;
  visibility: 'public' | 'private';
};

type VCCardItem = {
  id: string;
  url: string;
  displayName: string;
  description: string | null;
  avatarImageUrl: string | null;
};

type AssociatedOrganizationCard = {
  id: string;
  url: string;
  displayName: string;
  role: string;                            // "Admin" | "Associate" | …
  memberCount: number;
  avatarImageUrl: string | null;
};

// The mapper composes `AssociatedOrganizationCard` into a
// `CompactContributorCardItem` for rendering (Q1 decision):
//   caption          ← role
//   secondaryCaption ← i18n-resolved member-count line (e.g., "24 members")
//   href             ← url
//   avatarImageUrl   ← avatarImageUrl
// One primitive renders three sites (User Orgs, Org Associates, VC Host).
```

**Tab → section filter** (User profile — 3-tab layout per FR-013; default active tab is `Resources Hosted`):

| Active tab | Sections rendered |
|---|---|
| `Resources Hosted` (default) | Four sub-sections in this order: **Spaces** → **Virtual Contributors** → **Template Packs** (`hostedInnovationPacks`) → **Custom Homepages** (`hostedInnovationHubs`). Parent "Resources Hosted" header suppressed; the tab label is the heading. Each sub-section uses a `text-label` uppercase header. |
| `Leading` | Spaces Leading only; section header suppressed; empty-state caption when the list is empty. |
| `Member Of` | Member of only; section header suppressed; empty-state caption when the list is empty. |

A section (or sub-section) is *omitted* — no header, no empty caption per slot — when its item list is empty (FR-015). The exception is the Leading and Member of tabs, which render an empty-state caption when their list is empty (so the tab body is never blank).

**Note (correction vs. earlier drafts):** the earlier 5-tab layout (`All Resources` / `Hosted Spaces` / `Virtual Contributors` / `Leading` / `Member of`) was dropped once Template Packs and Custom Homepages were added to the Resources Hosted group — five tabs with two of them being slices of a third did not scale. The "show everything stacked" meta-view (the old `All Resources` behaviour) is also gone; each tab now shows ONLY its own group.

---

### Entity: `OrganizationPublicProfile`

```ts
type OrganizationPublicProfile = {
  id: string;
  slug: string;                            // nameID
  isOwn: boolean;                          // viewer's org === this org (rare; CRD just uses the canEdit predicate below)
  canEdit: boolean;                        // useOrganizationProvider().permissions.canEdit (FR-021)
  canReadUsers: boolean;                   // useOrganizationProvider().permissions.canReadUsers — gates Associates section (FR-023)
  hero: {
    avatarImageUrl: string | null;
    displayName: string;
    location: string | null;               // "City, Country" — null if both empty
    verified: boolean;                     // organization.verification.status === VerifiedManualAttestation (FR-020)
    settingsUrl: string | null;            // null → hide gear icon. Set to buildSettingsUrl(profile.url) when canEdit (FR-021)
  };
  sidebar: {
    bio: string | null;                    // markdown
    tagsets: TagsetGroup[];                // Keywords + Capabilities — empty tagsets dropped per-entry (FR-023)
    references: ReferenceLink[];           // ALL references — the view splits internally:
                                           //   • References section uses excludeSocialReferences(refs)
                                           //     from @/crd/components/common/SocialLinks
                                           //   • Social section passes refs straight to <SocialLinks references={refs} />,
                                           //     which filters via isSocialReference and brand-resolves itself.
                                           // The mapper does NOT split; one source of truth.
    // Always populated. The `canReadUsers` flag inside drives the view's
    // grid-vs-sign-in-CTA branch (parity with MUI `AssociatesView`). The
    // section header is always rendered.
    associates: AssociatesView;
  };
  rightColumn: {
    // 3-tab layout mirroring User profile (FR-024 refined). Tab keys are the
    // shared `ResourceTabKey` union: 'resourcesHosted' | 'leading' | 'memberOf'.
    // The 'resourcesHosted' tab renders four sub-sections in this order;
    // each sub-section is omitted when its list is empty (FR-015).
    hostedSpaces: SpaceCardItem[];                    // account.spaces
    hostedVirtualContributors: VCCardItem[];          // account.virtualContributors (organisations CAN host VCs)
    hostedInnovationPacks: SimpleResourceCardItem[];  // account.innovationPacks; UI label "Template Packs"
    hostedInnovationHubs: SimpleResourceCardItem[];   // account.innovationHubs; UI label "Custom Homepages"
    leadSpaces: SpaceCardItem[];                      // useFilteredMemberships(contributions, [RoleType.Lead])
    memberOf: SpaceCardItem[];                        // remaining memberships
  };
};

type TagsetGroup = {
  name: string;                            // i18n-resolved label (e.g., "Keywords", "Capabilities")
  tags: string[];
};

type ReferenceLink = {
  id: string;
  name: string;
  uri: string;
  description: string | null;
};

type AssociatesView = {
  // Parity with current MUI `AssociatesView`:
  //  - Renders all associates the org provider returns; the CRD view paginates
  //    visually at 12 with a "Show more (N) / Show less" toggle (state-machine
  //    in the view, NOT in the mapper).
  //  - When `canReadUsers` is false, the view shows the existing
  //    `associates-view.sign-in` CTA copy in the section body — the section
  //    header is still rendered. The mapper still passes the associates list;
  //    the view is the gate.
  // The shape is the existing MUI `ContributorCardSquare` prop set, NOT
  // `CompactContributorCard` (Associates is a square avatar grid, not a
  // sidebar row list).
  associates: AssociateGridItem[];
  totalCount: number;                       // metrics[Associate]
  canReadUsers: boolean;                    // gates the avatar grid in the view
};

type AssociateGridItem = {
  id: string;
  displayName: string;
  avatarImageUrl: string | null;
  url: string;                              // contributor profile URL
};

type CompactContributorCardItem = {
  id: string;
  displayName: string;
  avatarImageUrl: string | null;
  caption: string | null;                   // role label (e.g., "Admin") or null
  secondaryCaption: string | null;          // optional second line (Q1 — used by User Orgs list for "24 members")
  href: string;                             // contributor's profile URL
};

// Note: an earlier draft defined `AccountResourcesGroup`, `InnovationPackCardItem`,
// and `InnovationHubCardItem` to back a single titled "Account Resources" section
// that grouped spaces + packs + hubs into one card. That stacked-blocks layout was
// dropped in favour of the User-profile-style tabbed layout (FR-024 refined).
// The Org now reuses `SimpleResourceCardItem` (defined under PublicProfileResources
// for the User profile) for both packs and hubs — the prop shape is identical so
// there's no reason to keep parallel types.
```

**Tab → section filter (Organization right column)** — mirrors User profile per FR-024 refined; default active tab is `Resources Hosted`:

| Active tab | Sections rendered |
|---|---|
| `Resources Hosted` (default) | Four sub-sections in this order: **Spaces** (`hostedSpaces`) → **Virtual Contributors** (`hostedVirtualContributors`) → **Template Packs** (`hostedInnovationPacks`) → **Custom Homepages** (`hostedInnovationHubs`). Parent header suppressed; tab label is the heading. Empty sub-sections omitted entirely. |
| `Lead Spaces` | `leadSpaces` only; section header suppressed; empty-state caption when the list is empty. Filtered via `useFilteredMemberships(contributions, [RoleType.Lead])` — `[Lead]` only (current MUI parity, no Admin). |
| `All Memberships` | `memberOf` only; section header suppressed; empty-state caption "No memberships yet" (existing `pages.user-profile.communities.noMembership` translation key per FR-102) when the list is empty. |

A sub-section is *omitted* — no header, no empty caption per slot — when its item list is empty (FR-015). Lead Spaces and All Memberships render an empty-state caption (so the tab body is never blank).

---

### Entity: `VCPublicProfile`

```ts
type VCPublicProfile = {
  id: string;
  slug: string;                            // nameID
  hasUpdatePrivilege: boolean;             // vc.authorization.myPrivileges includes Update (FR-031)
  hero: {
    avatarImageUrl: string | null;
    displayName: string;
    settingsUrl: string | null;            // null → hide gear icon. Set to buildSettingsUrl(profile.url) when hasUpdatePrivilege (FR-031)
    // 2026-05-06 redesign additions:
    typeBadgeLabel: string;                // i18n-resolved "Virtual Contributor" string from `crd-profilePages:vcProfile.typeBadge`
    keywords: string[];                    // resolved from vc.profile.tagsets[] against TagsetReservedName.Keywords; empty array hides the chip row entirely (FR-030 omission rule)
    // NOTE: no Message button for VCs (FR-030)
  };
  sidebar: {
    description: string | null;            // markdown — vc.profile.description
    host: CompactContributorCardItem | null;  // vc.provider.profile mapped to compact card; null when no provider
    // 2026-05-06 redesign change: ALL references rendered as flat URL chips
    // (no social/non-social split — the redesigned right column does not surface
    //  social refs separately, and MUI's silent split-and-discard is replaced
    //  by the prototype's flat list per FR-032). Empty list → "No references"
    //  empty-state caption.
    references: ReferenceLink[];
    bodyOfKnowledge: BodyOfKnowledge | null;  // null only for VCs with no BoK at all (rare)
  };
  contentView: VCContentView;              // right column data — 2026-05-06 redesigned (Functionality / AI Engine / Monitoring)
};

type BodyOfKnowledge =
  | {
      kind: 'space';
      // Always populated. When hasReadAccess === false, the mapper produces a
      // placeholder SpaceProfileSummary with displayName = the privacy label
      // (i18n: components.card.privacy.private with entity="space") and url = '',
      // matching current MUI's defaultProfile fallback exactly (Q7 decision).
      // The view renders the same SpaceCardHorizontal-equivalent for both cases.
      spaceProfile: SpaceProfileSummary;
      hasReadAccess: boolean;
      description: string | null;          // vc.bodyOfKnowledgeDescription — rendered above the card
      vcDisplayName: string;               // for spaceBokDescription caption interpolation
    }
  | {
      kind: 'knowledgeBase';
      // useKnowledgeBase().knowledgeBaseDescription, OR the existing translation
      // key `virtualContributorSpaceSettings.placeholder` when the API returns an
      // empty value — matches current MUI VCProfilePageView's
      // `knowledgeBaseDescription || t('virtualContributorSpaceSettings.placeholder')`
      // exactly. The mapper resolves the fallback (passing the i18n `t` function
      // in) so the view receives a populated string.
      description: string;
      hasReadAccess: boolean;
      visitUrl: string;                    // ${vc.profile.url}/${KNOWLEDGE_BASE_PATH}
    }
  | {
      kind: 'external';
      // Fully i18n-resolved engine-type description. The mapper derives this
      // from `vc.aiPersona.engine` — when the engine is `OpenaiAssistant` it
      // resolves `externalAssistantDescription`; otherwise `externalGenericDescription`.
      // Both come from `components.profile.fields.engines.externalVCDescription`
      // with the engine name interpolated in. The view renders the string
      // through `MarkdownContent` (the description may contain a link).
      //
      // NOTE: an earlier draft of this document declared `engineLabel: 'assistant' | 'other'`
      // and let the view resolve the copy. That was inverted in the implementation —
      // the integration layer owns translation resolution (FR-005), so the
      // resolved string crosses the boundary, not the discriminator. Aligned with
      // contracts/vcProfile.ts and the actual mapper output.
      description: string;
    };

type SpaceProfileSummary = {
  id: string;
  url: string;
  displayName: string;
  level: 'L0' | 'L1' | 'L2';
  avatarImageUrl: string | null;
};

// 2026-05-06 redesign: VCContentView is now a structured shape with three
// section-shaped fields, each fully resolved by the mapper (data + i18n labels)
// before crossing the CRD prop boundary. The view does NO data extraction or
// label resolution itself — pure render function (Constitution Principle II).
//
// The mapper runs the same logic as the existing MUI hook
// `useTemporaryHardCodedVCProfilePageData(modelCard)`, re-implemented in plain
// TypeScript locally inside `vcProfileMapper.ts` (NOT imported from MUI — see
// research §15 for the rationale). The MUI hook continues to ship for the
// legacy MUI page that renders when CRD is OFF.
type VCContentView = {
  functionality: VCFunctionalitySection;
  aiEngine: VCAiEngineSection;
  monitoring: VCMonitoringSection;
};

type BulletItem = {
  // The mapper produces one BulletItem per entry of `modelCard.spaceUsage[…]`
  // .flags[]. The `enabled` flag drives the Check / Minus glyph and the
  // foreground / muted text colour in the view.
  label: string;                           // i18n-resolved label
  enabled: boolean;
};

type VCFunctionalitySection = {
  // Sourced from `modelCard.spaceUsage[]`:
  //   capabilities       ← entry where modelCardEntry === SpaceCapabilities (.flags[])
  //   dataAccess         ← entry where modelCardEntry === SpaceDataAccess (.flags[])
  //   roleRequirements   ← presence of SpaceRoleMember.enabled in the
  //                        SpaceRoleRequired entry → 'memberRequired'; else 'noneRequired'.
  capabilities: BulletItem[];
  dataAccess: BulletItem[];
  roleRequirements: { kind: 'memberRequired' | 'noneRequired' };
};

type VCAiEngineSection = {
  // engineName is i18n-resolved from one of three keys, picked by the mapper:
  //   `vcProfile.aiEngine.engineName.alkemio`     when !isExternal && !isAssistant
  //   `vcProfile.aiEngine.engineName.assistant`   when isAssistant
  //   `vcProfile.aiEngine.engineName.external`    when isExternal && !isAssistant
  engineName: string;
  cards: TransparencyCardData[];           // exactly six entries in fixed order, see below
};

// The view renders an ordered list of these — order is fixed by the mapper:
//   [0] Open Model Transparency
//   [1] Data Usage Disclosure
//   [2] Knowledge Restriction
//   [3] Web Access (uses the optional `noIcon: 'clock'` override)
//   [4] Physical Location (textValue, no Yes/No)
//   [5] Technical References (action-shaped — link button or "not available")
type TransparencyCardData = {
  id: string;                              // stable key for the iterator (e.g., 'openModelTransparency')
  iconName:                                // mapped to a lucide-react component inside the view
    | 'eye' | 'database' | 'shieldCheck' | 'globe' | 'mapPin' | 'fileText';
  title: string;                           // i18n-resolved
  description: string;                     // i18n-resolved caption
  // EXACTLY ONE of the following three answer fields is populated (discriminated):
  //   booleanAnswer   → renders Yes/No row with CheckCircle2 / XCircle (or noIcon override)
  //   textValue       → renders plain text answer (Physical Location, Knowledge Restriction)
  //   action          → renders an outlined Button linking to a URL (Technical References)
  //                     OR an italic muted "Not available" caption when href === ''
  booleanAnswer?: { value: boolean; noIcon?: 'clock' | 'xCircle' }; // default 'xCircle'
  textValue?: string;
  action?: { href: string; label: string }; // href === '' → "Not available" fallback
};

type VCMonitoringSection = {
  // The view renders a horizontal Separator + heading + paragraph. The body
  // is rendered via <Trans> with an <a> component for the embedded T&C link.
  // The mapper passes the i18n key (not the resolved string) so <Trans> can
  // resolve the `<a>` placeholder against the components prop.
  headingKey: string;                      // e.g., 'crd-profilePages:vcProfile.monitoring.heading'
  bodyKey: string;                         // e.g., 'crd-profilePages:vcProfile.monitoring.body' — contains <a>...</a>
  // The view hard-codes the actual T&C URL in the <Trans components={{ a }} />
  // call (the URL is product-stable; injecting it through props would add
  // overhead with no flexibility benefit).
};

// Note 1: the earlier draft of this document defined a `SocialReferenceItem`
// shape with a `brand` discriminator that the mappers populated via a local
// `brandFor(name)` helper. That has been dropped — brand resolution and the
// social/non-social split now live entirely inside the shared `SocialLinks`
// primitive at `src/crd/components/common/SocialLinks.tsx`. Consumers pass
// raw `ReferenceLink[]` through; the primitive renders the social ones, and
// the exported `excludeSocialReferences()` helper feeds the parallel
// References sections on the Org sidebar (User profile uses Social block).
//
// Note 2 (2026-05-06): the VC profile is no longer a consumer of the shared
// `SocialLinks` primitive — the redesigned right column does not surface
// social references at all (research §15). The VC sidebar's References block
// renders all references as flat URL chips. Brand-icon mapping is no longer
// required for VC.
//
// Supported brands inside the SocialLinks primitive (User+Org consumers):
//   website (globe) | linkedin | github | bsky | youtube | email | generic (fallback globe)
//
// Note 3 (2026-05-06): the legacy `ModelCardSummary` shape (single object with
// aiEngine + monitoring sub-objects) is replaced by the structured
// VCFunctionalitySection / VCAiEngineSection / VCMonitoringSection shapes
// above. The mapper runs the equivalent of `useTemporaryHardCodedVCProfilePageData`'s
// extraction logic (research §15) but never imports the MUI hook itself.
```

---

## Query → region (per-region loading; FR-009)

Each integration page fires its queries in parallel and renders Skeleton placeholders
**per region** until the driving query resolves. The page does not block on all
queries before painting (Q3 decision). Each `*PublicProfileViewProps.loading` shape
declares one boolean per region; the mapper produces it from the underlying
Apollo `loading` flags.

### User profile

| Region | Driving query / hook | `loading.*` key |
|---|---|---|
| Hero (avatar / name / location), Bio, Tagsets (Keywords + Skills) | `useUserProvider` | `hero` |
| Sidebar Organizations list | `useUserOrganizationIds` (+ downstream lookup if any) — wrapper swallows `loading`; mapper derives it as `userId !== undefined && organizationIds === undefined` | `organizations` |
| Resources Hosted (hosted spaces + hosted VCs) | `useUserAccountQuery` | `hostedResources` |
| Spaces Leading + Member Of (driven by `useFilteredMemberships`) | `useUserContributions` — wrapper swallows `loading`; mapper derives it as `userId !== undefined && contributions === undefined` | `memberships` |

### Organization profile

| Region | Driving query / hook | `loading.*` key |
|---|---|---|
| Hero (avatar / name / location / Verified badge) | `useOrganizationProvider` (single facade) | `hero` |
| Sidebar (Bio / Tagsets / References / Associates) | `useOrganizationProvider` | `sidebar` |
| Right column — Resources Hosted (4 sub-sections) | `useOrganizationAccountQuery` + `useAccountResources` | `hostedResources` |
| Right column — Lead Spaces + All Memberships | `useFilteredMemberships(contributions, …)` (derives from `useOrganizationProvider`) | `memberships` |

### VC profile

| Region | Driving query / hook | `loading.*` key |
|---|---|---|
| Hero (avatar / name / type badge / Keywords chip row / Settings icon) | `useVirtualContributorProfileWithModelCardQuery` | `hero` |
| Sidebar (Description / Host / flat References list — 2026-05-06: all refs, no split) | `useVirtualContributorProfileWithModelCardQuery` | `sidebar` |
| Sidebar — Body of Knowledge section | space-backed: `useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery` + `useSpaceBodyOfKnowledgeAboutQuery`; KB-backed: `useKnowledgeBase`; external: synchronous, no query | `bodyOfKnowledge` |
| Right column — Functionality / AI Engine / Monitoring sections (2026-05-06 redesign) | `useVirtualContributorProfileWithModelCardQuery` (the `modelCard` + `aiPersona.engine` fields drive all three sections) | `contentView` |

**Skeleton shape for the VC right column (FR-009 update)**: while `contentView` loads, render three skeleton blocks: a 3-column grid of card-shaped placeholders (Functionality), a 3-column grid of 6 transparency-card placeholders (AI Engine), and a separator + paragraph placeholder (Monitoring) — so the redesigned right column does not collapse into a single block while loading.

---

## Bundle / chunk strategy (Q8 decision)

Three lazy-loaded chunks total — one per actor's `Crd<Actor>Routes`. The
per-actor page component (`CrdUserProfilePage`, `CrdOrganizationProfilePage`,
`CrdVCProfilePage`) lives **inside** its routes chunk, NOT as a separate
`React.lazy()` boundary. This matches the precedent set by 045 / 091 / 097 and
fits the SC-005 budget (≤ +35 KB gzipped combined across the three new
chunks).

The shared `CompactContributorCard` and `MessagePopover` primitives live in the
small `crd-common` chunk that is already shared across CRD pages; they do not
count against the per-actor budget.

---

## Validation rules (carried over from MUI parity)

- **Reference URI**: must be a syntactically valid URL (existing `referenceSegmentSchema` regex). The view does not validate — invalid URIs are filtered or rendered with a generic Link icon.
- **Avatar / Banner image URL**: trusted from the API; the view never validates. When `null`, the deterministic gradient fallback runs.
- **Markdown content** (Bio / Description / VC.description): rendered via the existing CRD `MarkdownContent` component; sanitization is provided by that component.
- **`isSocialNetworkSupported`**: the existing predicate from `src/domain/shared/components/SocialLinks/models/SocialNetworks.ts` — returns true for `LinkedIn` / `Bluesky` / `GitHub` / `X` (plus a few others). Used to split references into "social" (right column on VC; not surfaced on User/Org public profile) vs. "other" (sidebar on VC; sidebar on Org).

---

## State transitions

### Send-message popover (User + Organization)

```text
idle ── click Message ──▶ popover open (textarea empty)
popover open ── type ──▶ textarea has draft text (Send button enabled when non-empty)
popover open ── click × / press Escape ──▶ popover closed (draft discarded)
popover open ── click Send ──▶ pending (Send button spinner)
pending ── mutation success ──▶ popover closes (draft cleared)
pending ── mutation failure ──▶ popover stays open, inline error appears, draft preserved (user can retry)
```

### User profile resource tab strip

```text
mount ── default ──▶ activeTab = 'resourcesHosted'
click any tab ──▶ activeTab = clicked-tab-key (sections re-filter; no URL change)
on smaller-than-md viewport ── activeTab change ──▶ active tab auto-scrolled into view
```

### VC profile load lifecycle

```text
mount ── useUrlResolver pending ──▶ render Loading
useUrlResolver resolved ── useVirtualContributorProfileWithModelCardQuery pending ──▶ render Loading
query success + Read privilege missing ──▶ useRestrictedRedirect runs → navigation away
query success + Read privilege OK ──▶ render page
query Apollo not-found error ──▶ render Error404 inside CRD layout
query other error ──▶ propagate to the global ErrorBoundary (Q4 — no custom CRD error component; matches current MUI which has no dedicated error display either)
```

---

## Cross-page invariants

- **Slug → entity resolution**: each page resolves its actor entity via the existing facade hook (`useUserProvider` / `useOrganizationProvider` / `useUrlResolver` for VC); the same entity feeds the hero, sidebar, and main column in the same render cycle.
- **`canEditSettings`** (User profile only) is computed via `useCanEditSettings()` from the `useUserPageRouteContext` user id + the current viewer's `hasPlatformPrivilege(PlatformAdmin)` — exactly the same predicate the sibling settings spec 097 uses (FR-008a). The User profile uses it to decide whether to render the Settings (gear) icon button. Organization and VC use their own per-entity predicates (`canEdit`, `Update` privilege respectively) — they do NOT share `useCanEditSettings`.
- **Send-message mutation**: User and Organization use **different** GraphQL mutations with different input shapes:
  - User: `useSendMessageToUsersMutation` with `{ messageData: { message, receiverIds: [userId] } }`.
  - Organization: `useSendMessageToOrganizationMutation` with `{ messageData: { message, organizationId } }`.

  Both mutations are wrapped behind two integration helpers (`useSendMessageToUserHandler` and `useSendMessageToOrganizationHandler`) co-located in `src/main/crdPages/topLevelPages/common/useSendMessageHandler.ts`. Both helpers expose the same `(text: string) => Promise<void>` API plus `sending` / `error` state, so the presentational `MessagePopover` and the heroes that use it stay recipient-agnostic. The VC hero does NOT have a Message button (FR-030).
  Earlier drafts of this document said a single `useSendMessageHandler` covered both verticals — that was incorrect; the mutations have different input shapes and cannot share one wrapper.
- **No mutations against the entity itself** are fired from any of the three public profile pages; the only mutations are `sendMessageToUsers` (User + Organization). VC is fully read-only. None of these mutations affect the entity document, so no refetch is required after sending a message.
- **Bundle isolation**: each `CrdXxxProfilePage` is its own React.lazy chunk. The shared `CompactContributorCard` primitive lives in the small `crd-common` chunk that's already shared across CRD pages. The new i18n namespace `crd-profilePages` is lazy-loaded.

### VC empty model card fallback (2026-05-06)

When `useVirtualContributorProfileWithModelCardQuery` returns no `modelCard` (or returns one with all-falsy flags), the VC mapper MUST still produce a fully-populated `VCContentView` — every section renders, just with safe defaults. The CRD mapper inlines a local `EMPTY_MODEL_CARD_FALLBACK` constant that mirrors the existing `EMPTY_MODEL_CARD` from `src/domain/community/virtualContributor/model/VirtualContributorModelCardModel.ts` (the constant is duplicated locally because the CRD layer must not import from `src/domain/`).

```ts
// Inside vcProfileMapper.ts (NOT imported from src/domain/):
const EMPTY_MODEL_CARD_FALLBACK = {
  spaceUsage: [
    { modelCardEntry: 'SPACE_CAPABILITIES', flags: [
      { name: 'SPACE_CAPABILITY_TAGGING', enabled: false },
      { name: 'SPACE_CAPABILITY_CREATE_CONTENT', enabled: false },
      { name: 'SPACE_CAPABILITY_COMMUNITY_MANAGEMENT', enabled: false },
    ]},
    { modelCardEntry: 'SPACE_DATA_ACCESS', flags: [
      { name: 'SPACE_DATA_ACCESS_ABOUT', enabled: false },
      { name: 'SPACE_DATA_ACCESS_CONTENT', enabled: false },
      { name: 'SPACE_DATA_ACCESS_SUBSPACES', enabled: false },
    ]},
    { modelCardEntry: 'SPACE_ROLE_REQUIRED', flags: [
      { name: 'SPACE_ROLE_MEMBER', enabled: false },
      { name: 'SPACE_ROLE_ADMIN', enabled: false },
    ]},
  ],
  aiEngine: {
    isExternal: false,
    isAssistant: false,
    hostingLocation: '',
    isUsingOpenWeightsModel: false,
    isInteractionDataUsedForTraining: null,
    canAccessWebWhenAnswering: false,
    areAnswersRestrictedToBodyOfKnowledge: '',
    additionalTechnicalDetails: '',
  },
  monitoring: { isUsageMonitoredByAlkemio: true },
};
```

This produces a `VCContentView` where (a) all Functionality bullets render with the `Minus` glyph in muted text, (b) AI Engine cards render with safe defaults (Open Model: "No"; Data Usage: "Unknown" because of the `null`; Knowledge Restriction: empty string from `areAnswersRestrictedToBodyOfKnowledge` — the view falls back to "Unknown" via the i18n string when the value is empty; Web Access: "No"; Physical Location: empty → falls back to localized "Unknown"; Technical References: empty href → "Not available" caption), and (c) Monitoring renders unchanged. Cards never collapse or hide — the page maintains a stable visual rhythm.

Parity with current MUI's `modelCard ?? EMPTY_MODEL_CARD` fallback in `VCProfileContentView.tsx`.
