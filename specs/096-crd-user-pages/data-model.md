# Phase 1 — Data Model & Mapping (Public Profile)

This document enumerates the entities consumed by the CRD public **User Profile** page, the GraphQL hooks they originate from, the CRD prop shapes the views expect, and the mapping rules that bridge the two. Every CRD prop type listed here is plain TypeScript (no generated GraphQL imports) per FR-005.

The mapper for the public profile lives at `src/main/crdPages/topLevelPages/userPages/publicProfile/publicProfileMapper.ts` and is the only place GraphQL types are visible. Sibling spec `097-crd-user-settings` covers the settings tabs' data model — see `specs/097-crd-user-settings/data-model.md`.

---

## Source GraphQL hooks (existing — unchanged)

| Hook | File | Purpose |
|---|---|---|
| `useUserQuery` | `src/core/apollo/generated/apollo-hooks.ts` | Public profile data (`User`, `profile.*`, `firstName`, `lastName`) |
| `useUserAccountQuery` | same | Hosted resources (`account.spaces`, `account.virtualContributors`) for the Resources Hosted section |
| `useUserContributionsQuery` | same | Memberships (`rolesUser.spaces`, nested subspaces) for the resource sections (Hosted Spaces, Leading, Member Of) |
| `useUserOrganizationIdsQuery` | same | Org IDs the user is associated with (sidebar Organizations list) |
| `useSendMessageToUsersMutation` | same | In-hero compose surface on the public profile |

## Existing facade hooks reused

| Hook | File | Purpose |
|---|---|---|
| `useUserProvider` | `src/domain/community/user/hooks/useUserProvider.ts` | Resolve the profile-being-viewed user from the URL `:userSlug`; handles canonical URL redirects |
| `useCurrentUserContext` | `src/domain/community/userCurrent/useCurrentUserContext.ts` | Current viewer identity + `hasPlatformPrivilege(...)` (used by `useCanEditSettings`) |
| `useFilteredMemberships` | `src/domain/community/user/hooks/useFilteredMemberships.ts` | Splits memberships into "filtered" (lead/host/admin) vs. "remaining" (member-of) |

---

## Entities consumed (CRD prop shapes)

### Entity: `UserPublicProfile` (public profile + sidebar)

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

### Entity: `PublicProfileResources` (right column section data)

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

**Tab → section filter** (per the prototype, per `prototype/src/app/pages/UserProfilePage.tsx`):

| Active tab | Sections rendered |
|---|---|
| `All Resources` | Resources Hosted (with "Spaces" + "Virtual Contributors" sub-sections) + Spaces Leading + Member of |
| `Hosted Spaces` | Resources Hosted → Spaces sub-section only |
| `Virtual Contributors` | Resources Hosted → Virtual Contributors sub-section only |
| `Leading` | Spaces Leading only |
| `Member Of` | Member of only |

A section is *omitted* (not rendered as an empty container) when its item list is empty (FR-015).

---

## State transitions

### Send-message popover

```
idle ── click Message ──▶ popover open (textarea empty)
popover open ── type ──▶ textarea has draft text (Send button enabled when non-empty)
popover open ── click × / press Escape ──▶ popover closed (draft discarded)
popover open ── click Send ──▶ pending (Send button spinner)
pending ── mutation success ──▶ popover closes (draft cleared)
pending ── mutation failure ──▶ popover stays open, inline error appears, draft preserved (user can retry)
```

### Resource tab strip

```
mount ── default ──▶ activeTab = 'allResources'
click any tab ──▶ activeTab = clicked-tab-key (sections re-filter; no URL change)
on smaller-than-md viewport ── activeTab change ──▶ active tab auto-scrolled into view
```

---

## Cross-page invariants

- **Slug → user resolution**: the public profile resolves the profile-being-viewed user via `useUserPageRouteContext()` (a thin wrapper around `useUserProvider`); the same user object feeds the hero, sidebar, and resource sections in the same render cycle. When the user navigates to `/user/:slug/settings/*`, the same helper is reused by the sibling spec `097-crd-user-settings` route guard.
- **`canEditSettings`** is computed via `useCanEditSettings()` from the `useUserPageRouteContext` user id + the current viewer's `hasPlatformPrivilege(PlatformAdmin)` — exactly the same predicate the sibling settings spec uses (FR-008a). The public profile uses it to decide whether to render the Settings (gear) icon button.
- **No mutations against the User entity** are fired from the public profile page; the only mutation is `sendMessageToUsers`, which does not affect the User document, so no refetch is required.
