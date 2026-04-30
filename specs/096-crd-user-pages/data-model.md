# Phase 1 — Data Model & Mapping (Public Profile Pages)

This document enumerates the entities consumed by the CRD public profile pages for the three actor types — **User**, **Organization**, and **Virtual Contributor** — the GraphQL hooks they originate from, the CRD prop shapes the views expect, and the mapping rules that bridge the two. Every CRD prop type listed here is plain TypeScript (no generated GraphQL imports) per FR-005.

The mapper for each page lives at `src/main/crdPages/topLevelPages/<vertical>/publicProfile/<page>Mapper.ts` and is the only place GraphQL types are visible. Sibling spec `097-crd-user-settings` covers the User Settings tabs' data model — see `specs/097-crd-user-settings/data-model.md`.

---

## Source GraphQL hooks (existing — unchanged)

### User profile

| Hook | File | Purpose |
|---|---|---|
| `useUserQuery` | `src/core/apollo/generated/apollo-hooks.ts` | Public profile data (`User`, `profile.*`, `firstName`, `lastName`) |
| `useUserAccountQuery` | same | Hosted resources (`account.spaces`, `account.virtualContributors`) for the Resources Hosted section |
| `useUserContributionsQuery` | same | Memberships (`rolesUser.spaces`, nested subspaces) for the User profile resource sections |
| `useUserOrganizationIdsQuery` | same | Org IDs the user is associated with (sidebar Organizations list) |
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
| `pickColorFromId` | `src/crd/lib/pickColorFromId.ts` | Deterministic gradient generator for hero banner fallback |
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
    bannerImageUrl: string | null;  // null → render gradient via pickColorFromId(id)
    avatarImageUrl: string | null;
    displayName: string;
    location: string | null;        // "City, Country" — null if both empty
  };
  bio: string | null;               // markdown — null if empty
  organizations: AssociatedOrganizationCard[];
  resources: PublicProfileResources;
};
```

### Entity: `PublicProfileResources` (User profile right column section data)

```ts
type PublicProfileResources = {
  hostedSpaces: SpaceCardItem[];          // user-hosted L0 spaces
  hostedVirtualContributors: VCCardItem[]; // user-hosted VCs
  spacesLeading: SpaceCardItem[];          // spaces where the user holds host/admin/lead
  spacesMember: SpaceCardItem[];           // remaining memberships
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
```

**Tab → section filter** (User profile, per the prototype `prototype/src/app/pages/UserProfilePage.tsx`):

| Active tab | Sections rendered |
|---|---|
| `All Resources` | Resources Hosted (with "Spaces" + "Virtual Contributors" sub-sections) + Spaces Leading + Member of |
| `Hosted Spaces` | Resources Hosted → Spaces sub-section only |
| `Virtual Contributors` | Resources Hosted → Virtual Contributors sub-section only |
| `Leading` | Spaces Leading only |
| `Member Of` | Member of only |

A section is *omitted* (not rendered as an empty container) when its item list is empty (FR-015).

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
    bannerImageUrl: string | null;         // null → render gradient via pickColorFromId(id)
    avatarImageUrl: string | null;
    displayName: string;
    location: string | null;               // "City, Country" — null if both empty
    verified: boolean;                     // organization.verification.status === VerifiedManualAttestation (FR-020)
    settingsUrl: string | null;            // null → hide gear icon. Set to buildSettingsUrl(profile.url) when canEdit (FR-021)
  };
  sidebar: {
    bio: string | null;                    // markdown
    tagsets: TagsetGroup[];                // Keywords + Capabilities (FR-023)
    references: ReferenceLink[];           // profile.references[]
    associates: AssociatesView | null;     // null when canReadUsers is false (FR-023)
  };
  rightColumn: {
    accountResources: AccountResourcesGroup | null;   // null when all three account resource lists are empty (FR-024)
    leadSpaces: SpaceCardItem[];                       // filtered via useFilteredMemberships(contributions, [RoleType.Lead])
    memberOf: SpaceCardItem[];                         // remaining memberships
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
  associates: CompactContributorCardItem[]; // capped at first N for sidebar (current MUI shows full list — parity)
  totalCount: number;                       // metrics[Associate]
};

type CompactContributorCardItem = {
  id: string;
  displayName: string;
  avatarImageUrl: string | null;
  caption: string | null;                   // role label (e.g., "Admin") or null
  href: string;                             // contributor's profile URL
};

type AccountResourcesGroup = {
  spaces: SpaceCardItem[];
  innovationPacks: InnovationPackCardItem[];
  innovationHubs: InnovationHubCardItem[];
};

type InnovationPackCardItem = {
  id: string;
  url: string;
  displayName: string;
  description: string | null;
  avatarImageUrl: string | null;
};

type InnovationHubCardItem = {
  id: string;
  url: string;
  displayName: string;
  description: string | null;
  avatarImageUrl: string | null;
};
```

**Section omission rules (Organization right column)**:

| Section | Omitted when | Otherwise |
|---|---|---|
| Account Resources | `spaces.length === 0 && innovationPacks.length === 0 && innovationHubs.length === 0` (current MUI's `hasAccountResources` check) | Render section |
| Lead Spaces | `leadSpaces.length === 0` | Render section |
| All Memberships | Never omitted — always render section, with empty-state caption "No memberships yet" when `memberOf.length === 0` | Render section |

---

### Entity: `VCPublicProfile`

```ts
type VCPublicProfile = {
  id: string;
  slug: string;                            // nameID
  isOwn: boolean;                          // viewer is the VC's provider (uncommon)
  hasUpdatePrivilege: boolean;             // vc.authorization.myPrivileges includes Update (FR-031)
  hero: {
    bannerImageUrl: string | null;         // null → render gradient via pickColorFromId(id)
    avatarImageUrl: string | null;
    displayName: string;
    settingsUrl: string | null;            // null → hide gear icon. Set to buildSettingsUrl(profile.url) when hasUpdatePrivilege (FR-031)
    // NOTE: no Message button for VCs (FR-030)
  };
  sidebar: {
    description: string | null;            // markdown — vc.profile.description
    host: CompactContributorCardItem | null;  // vc.provider.profile mapped to compact card; null when no provider
    references: ReferenceLink[];           // non-social only — filter via isSocialNetworkSupported (FR-032)
    bodyOfKnowledge: BodyOfKnowledge | null;  // null only for VCs with no BoK at all (rare)
  };
  contentView: VCContentView;              // right column data
};

type BodyOfKnowledge =
  | {
      kind: 'space';
      spaceId: string | null;              // null when private/not visible
      spaceProfile: SpaceProfileSummary | null;  // null when hasReadAccess is false → render "Private space" placeholder
      hasReadAccess: boolean;
      description: string | null;          // vc.bodyOfKnowledgeDescription
    }
  | {
      kind: 'knowledgeBase';
      description: string;                 // useKnowledgeBase().knowledgeBaseDescription
      hasReadAccess: boolean;
      visitUrl: string;                    // ${vc.profile.url}/${KNOWLEDGE_BASE_PATH}
    }
  | {
      kind: 'external';
      engineLabel: 'assistant' | 'other';  // derived from vc.aiPersona.engine === OpenaiAssistant
    };

type SpaceProfileSummary = {
  id: string;
  url: string;
  displayName: string;
  level: 'L0' | 'L1' | 'L2';
  avatarImageUrl: string | null;
};

type VCContentView = {
  modelCard: ModelCardSummary;             // existing VirtualContributorModelCardModel mapped to plain prop shape
  socialReferences: SocialReferenceItem[]; // filtered via isSocialNetworkSupported (the "social" group)
};

type ModelCardSummary = {
  aiEngine: {
    name: string;                          // e.g., "OpenAI Assistant", "External"
    isExternal: boolean;
  };
  prompts: {
    persona: string | null;
    constraints: string | null;
  };
  dataPrivacy: {
    summary: string | null;
  };
};

type SocialReferenceItem = {
  id: string;
  name: string;                            // 'LinkedIn' | 'Bluesky' | 'GitHub' | 'X' | …
  uri: string;
  brand: 'linkedin' | 'bluesky' | 'github' | 'x' | 'generic';
};
```

---

## Validation rules (carried over from MUI parity)

- **Reference URI**: must be a syntactically valid URL (existing `referenceSegmentSchema` regex). The view does not validate — invalid URIs are filtered or rendered with a generic Link icon.
- **Avatar / Banner image URL**: trusted from the API; the view never validates. When `null`, the deterministic gradient fallback runs.
- **Markdown content** (Bio / Description / VC.description): rendered via the existing CRD `MarkdownContent` component; sanitization is provided by that component.
- **`isSocialNetworkSupported`**: the existing predicate from `src/domain/shared/components/SocialLinks/models/SocialNetworks.ts` — returns true for `LinkedIn` / `Bluesky` / `GitHub` / `X` (plus a few others). Used to split references into "social" (right column on VC; not surfaced on User/Org public profile) vs. "other" (sidebar on VC; sidebar on Org).

---

## State transitions

### Send-message popover (User + Organization)

```
idle ── click Message ──▶ popover open (textarea empty)
popover open ── type ──▶ textarea has draft text (Send button enabled when non-empty)
popover open ── click × / press Escape ──▶ popover closed (draft discarded)
popover open ── click Send ──▶ pending (Send button spinner)
pending ── mutation success ──▶ popover closes (draft cleared)
pending ── mutation failure ──▶ popover stays open, inline error appears, draft preserved (user can retry)
```

### User profile resource tab strip

```
mount ── default ──▶ activeTab = 'allResources'
click any tab ──▶ activeTab = clicked-tab-key (sections re-filter; no URL change)
on smaller-than-md viewport ── activeTab change ──▶ active tab auto-scrolled into view
```

### VC profile load lifecycle

```
mount ── useUrlResolver pending ──▶ render Loading
useUrlResolver resolved ── useVirtualContributorProfileWithModelCardQuery pending ──▶ render Loading
query success + Read privilege missing ──▶ useRestrictedRedirect runs → navigation away
query success + Read privilege OK ──▶ render page
query Apollo not-found error ──▶ render Error404 inside CRD layout
query other error ──▶ surface CRD error display (parity with current MUI)
```

---

## Cross-page invariants

- **Slug → entity resolution**: each page resolves its actor entity via the existing facade hook (`useUserProvider` / `useOrganizationProvider` / `useUrlResolver` for VC); the same entity feeds the hero, sidebar, and main column in the same render cycle.
- **`canEditSettings`** (User profile only) is computed via `useCanEditSettings()` from the `useUserPageRouteContext` user id + the current viewer's `hasPlatformPrivilege(PlatformAdmin)` — exactly the same predicate the sibling settings spec 097 uses (FR-008a). The User profile uses it to decide whether to render the Settings (gear) icon button. Organization and VC use their own per-entity predicates (`canEdit`, `Update` privilege respectively) — they do NOT share `useCanEditSettings`.
- **Send-message mutation**: the User and Organization heroes share one wrapped helper hook (`useSendMessageHandler`) that calls the same `useSendMessageToUsersMutation` against different recipient IDs. The presentational hero components are recipient-agnostic — they only call `onSendMessage(text)`. The VC hero does NOT have a Message button (FR-030).
- **No mutations against the entity itself** are fired from any of the three public profile pages; the only mutations are `sendMessageToUsers` (User + Organization). VC is fully read-only. None of these mutations affect the entity document, so no refetch is required after sending a message.
- **Bundle isolation**: each `CrdXxxProfilePage` is its own React.lazy chunk. The shared `CompactContributorCard` primitive lives in the small `crd-common` chunk that's already shared across CRD pages. The new i18n namespace `crd-profilePages` is lazy-loaded.
