# Phase 0 Research — CRD User Pages

This document resolves the open architectural decisions identified during planning. Every "NEEDS CLARIFICATION" from the Technical Context is settled below; no unresolved item gates Phase 1.

---

## 1. Anonymous-viewer access to the public profile (parity check)

**Question**: FR-008 states the public profile MUST be reachable without authentication "(parity with current MUI)". But the current `TopLevelRoutes.tsx` wraps the entire `/user/*` route in `<NoIdentityRedirect>` — so anonymous viewers are in fact redirected to login before reaching the public profile today.

**Investigation**:
- `src/main/routing/TopLevelRoutes.tsx:209-220` wraps `<UserRoute />` (which contains both the public profile and the settings sub-routes) in `<NoIdentityRedirect>`.
- `src/core/routing/NoIdentityRedirect.tsx` is unconditional — any unauthenticated viewer hitting any descendant route is redirected to `${AUTH_REQUIRED_PATH}?return=…`.
- Therefore, the *actual* MUI parity behaviour today is: anonymous viewers cannot view another user's public profile — they are redirected to login.

**Decision**: **Mirror the actual MUI behaviour (anonymous viewers redirected to login).** The CRD `CrdUserRoutes` subtree will be wrapped in the same `<NoIdentityRedirect>` at the same point in the route tree. FR-008's prose ("public profile MUST be reachable without authentication") is treated as a descriptive inaccuracy of the current MUI; the spec's overarching principle is parity, so we match what MUI actually does. The Edge Cases bullet "Unauthenticated viewer on a public profile" (line 252) is consistent with this: it says "Settings routes (User Stories 2–8) redirect to login via the existing `NoIdentityRedirect` wrapper" — implying the wrapper still gates the entire `/user/*` tree.

**Rationale**: Diverging from current MUI behaviour for anonymous viewers would (a) be a behaviour change disguised as a "migration" and (b) require coordinating a routing-tree change that is outside the scope of a presentational migration. Parity wins.

**Alternatives considered**:
- Move `<NoIdentityRedirect>` to wrap only `/user/*/settings/*` and leave `/user/:userSlug` open. **Rejected** — this changes user-visible behaviour and is out of scope per the migration's "presentation-layer port" principle (Out of Scope first bullet).
- Add a clarification asking the user. **Rejected** — the existing Edge Case bullet (line 252) plus the parity principle is sufficient; pursuing this further is bureaucracy.

---

## 2. Tab labels on the public-profile resource strip

**Question**: An earlier clarification thread questioned the prototype's `All Resources / Hosted Spaces / Virtual Contributors / Leading / Member Of` tab labels. The user dropped the thread without prescribing a change.

**Decision**: **Keep the prototype's exact labels** (`All Resources`, `Hosted Spaces`, `Virtual Contributors`, `Leading`, `Member Of`). All five are defined as i18n keys under `src/crd/i18n/userPages/userPages.en.json` and translated into the other five languages.

**Rationale**: The prototype source `prototype/src/app/pages/UserProfilePage.tsx:91` defines exactly these five tabs; the user dropped the rename thread without alternative wording; the spec's narrative (line 30 / 32) is internally consistent with these labels. Per-tab section filtering is documented in `data-model.md`.

**Alternatives considered**:
- Rename `All Resources` to something else (e.g., `Account`, `Overview`). **Rejected** — without an explicit user direction, renaming would diverge from the prototype.

---

## 3. Account tab: how to invoke create / manage / delete flows

**Question**: The spec says the CRD Account tab should "preserve every action the current MUI `ContributorAccountView` exposes" (FR-041) without "a single button added or removed". `ContributorAccountView` itself imports `@mui/material`, `@mui/icons-material`, `@/core/ui/*`, and many MUI-only modules — embedding it inside a CRD page would violate FR-005 (no `@mui/*` imports in `src/crd/` or `src/main/crdPages/`).

**Decision**: **Navigate to the existing MUI routes for heavy flows; render simple confirmations as CRD dialogs.**

The CRD `AccountView` is a thin presentational shell:

1. Renders the four card groups (Hosted Spaces, Virtual Contributors, Innovation Packs, Innovation Hubs) using CRD primitives.
2. Each card has a kebab menu whose entries fire callback props (`onManageSpace(id)`, `onCreatePack()`, `onTransferHub(id)`, etc.).
3. The integration layer (`src/main/crdPages/topLevelPages/userPages/account/useAccountActions.ts`) wires those callbacks to `useNavigate(...)` calls that land the user on the existing MUI admin pages (e.g., `/admin/innovation-packs/<id>/manage`, `/admin/...`). The user then completes the flow in MUI and navigates back to `/user/<self>/settings/account` when done.

**Rationale**:
- Preserves "no new affordances" (Out of Scope) by reusing the exact existing flows.
- Honors FR-005 — no MUI import in any CRD or `crdPages` file.
- Keeps the migration scope tractable: the spec author flagged "only the visual shell changes" — the navigation-first approach IS only-visual.
- A user-experience cost (a brief MUI page-load on Manage / Create) is acceptable and clearly communicated by the existing route segment (`/admin/...` URL).

**Alternatives considered**:
- **Port every dialog to CRD** (`CreateVirtualContributorDialog`, `CreateInnovationPackDialog`, `TransferHubDialog`, etc.). **Rejected** — these dialogs are non-trivial multi-step wizards. Porting them all would inflate the spec to multiple PRs of work and introduce visual / behavioural drift between MUI and CRD until each port lands. Better to ship the migration first and tackle individual dialogs as follow-ups.
- **Render the existing MUI dialogs inside the CRD page**. **Rejected** — violates FR-005.
- **Wrap `ContributorAccountView` in a CRD shell**. **Rejected** — same FR-005 violation; the wrapper would still pull MUI imports through the View.

---

## 4. Push Subscriptions List — port vs. reuse

**Question**: FR-072 says the Notifications tab MUST "reuse the existing `PushSubscriptionsList` component (restyled with CRD primitives)". The existing component is at `src/domain/community/userAdmin/tabs/components/PushSubscriptionsList.tsx` and imports `@mui/material` (Box, Button, Typography). It cannot be embedded in CRD per FR-005.

**Decision**: **Build a CRD `PushSubscriptionsListCard` under `src/crd/components/user/settings/tabs/`** that mirrors the MUI component's structure (one row per subscription, name + last-used timestamp + a "remove" button) using CRD primitives only. Reuse the data hook(s) the MUI version uses (the GraphQL queries + the push-subscription removal mutation) inside the integration mapper at `src/main/crdPages/topLevelPages/userPages/notifications/usePushSubscriptionList.ts`.

**Rationale**:
- Spec wording "(restyled with CRD primitives)" makes the intent unambiguous: a CRD-styled equivalent, not a literal reuse.
- The MUI `PushSubscriptionsList` is small (one table + remove buttons); a CRD port is low-effort.
- Honors FR-005.

**Alternatives considered**:
- Embed the MUI component. **Rejected** — FR-005 violation.
- Defer Push Subscriptions to a follow-up spec. **Rejected** — FR-072 is in scope; the user expects parity in one PR.

---

## 5. Per-field save UX state machine

**Question**: The Q2 clarification settled the post-failure behaviour, but the in-flight (pending) phase needs a single canonical implementation note so the eight implementations don't drift.

**Decision**: **Single `EditableField` primitive, three explicit visual states.**

| State | Trigger | Visual |
|---|---|---|
| `idle` | initial; after Cancel; ~2 s after a successful save | Text-only render. Hovering reveals a subtle pencil glyph trailing the value. |
| `editing` | click the value or the pencil | Input becomes interactive. Save (check) and Cancel (×) icons appear inline. |
| `pending` | click Save (or press Enter on a single-line input) until the mutation resolves | Save and Cancel buttons disabled; input set to `aria-busy="true"`; a small spinner replaces the Save icon temporarily. |
| `idle + saved-toast` | mutation resolves successfully | Field returns to `idle` with a transient grayed-out "Saved" indicator next to the label for ~2 s, then the indicator clears. |
| `editing + error` | mutation rejects | Field stays in `editing`. The user's typed value is preserved. An inline error message appears beneath the input. The error clears the next time the user transitions out of `editing` (Save success or Cancel). |

This state machine lives in the `EditableField` primitive and is reused by `EditableTextField`, `EditableMarkdownField` (Bio — Enter inserts newline), `EditableSelectField` (Country dropdown), `EditableTagsField` (tagsets), and `EditableReferenceRow` (URL field in a social link row).

**Rationale**: A single state machine eliminates implementation drift across 9+ editable fields on the My Profile tab. The `pending` state surfaces `aria-busy` for assistive tech (FR-110). The post-failure rule (Q2 clarification) is encoded directly: stay in `editing`, preserve typed value, show error.

**Alternatives considered**:
- Optimistic UI (flip to `idle` immediately, revert on error). **Rejected** — clarification Q2 explicitly chose pessimistic behaviour with the typed value preserved on failure.

---

## 6. Reference (social-link) recognized vs. arbitrary

**Question**: The Q (about Identity / About You / Social Links exact field set) clarified Social Links as `LinkedIn`, `Bluesky`, `GitHub` recognized + arbitrary references list with name + URL + description. How do we distinguish "recognized" from "arbitrary" in the data?

**Decision**: **Mirror the current MUI `referenceSegmentWithSocialSchema` exactly.** Recognized references are matched by `reference.name` against the canonical set (`LinkedIn`, `Bluesky`, `GitHub`) — case-insensitive — and rendered with their dedicated icon tile. Everything else falls into the "Add Another Reference" arbitrary-references list with a generic Link icon and an editable name + URL + description per row. The recognized-reference rows render a dedicated single URL input (no name editing — name is fixed); the arbitrary rows render name + URL + description inputs.

**Rationale**: Parity with the current MUI exactly avoids rebuilding the recognition logic. The `referenceSegmentWithSocialSchema` already enumerates the recognized names, validation rules, and per-row icon mapping.

**Alternatives considered**:
- Treat all references as arbitrary, drop the special LinkedIn/Bluesky/GitHub tiles. **Rejected** — the current MUI surfaces these dedicated tiles, the prototype expects them, and the clarification (Q about field set) explicitly named the three.

---

## 7. Country selector — data source and component

**Question**: The spec specifies `Country (select from the existing COUNTRIES list)`. Where does the COUNTRIES list live, and which CRD primitive renders the selector?

**Decision**: **Reuse the existing `COUNTRIES` constant** (typically at `src/domain/common/location/Countries.ts` or similar — confirmed during implementation). The selector is built on the existing CRD `select.tsx` primitive — a Radix UI Select wrapped in shadcn/ui styling — used by other CRD pages already.

**Rationale**: The country list is a shared constant; copying or re-listing it would risk drift. The CRD `select` primitive is already in use across the migration and supports keyboard nav + searchable filtering out-of-the-box.

---

## 8. Notifications optimistic-overrides pattern

**Question**: FR-074 mandates "optimistic-overrides pattern (immediate UI update, then resync after server refetch) — parity with current MUI". How is this expressed in the integration layer?

**Decision**: **Local override dictionary keyed by `(group, property, channel)`.** When the user flips a `Switch`, the integration layer:

1. Writes the new value into a local override dictionary (`useState`-backed).
2. Fires `useUpdateUserSettingsMutation` with the new value.
3. The view receives `value = override[key] ?? serverValue[key]` for each switch — so the override wins until the server refetch lands.
4. On mutation success, the override is cleared (the refetch arrives with the authoritative value, which now matches).
5. On mutation failure, the override is rolled back to the prior server value and an inline error is surfaced.

**Rationale**: This is the same mechanism the current MUI `UserAdminNotificationsPage` uses (see its `optimisticOverrides` state). No new pattern introduced. The CRD layer just relocates this state from the MUI page to the integration mapper hook.

---

## 9. Membership Leave flow — exact mutation and refetch

**Question**: The spec mentions `useLeaveCommunityMutation` but the apollo-hooks file contains no such hook — the mutation is named `removeRoleFromUser`. How does Leave wire?

**Decision**: **Reuse `useContributionProvider` from `src/domain/community/profile/useContributionProvider/`.** This existing hook wraps `useRemoveRoleFromUserMutation` and exposes a `leaveCommunity()` function. The CRD integration mapper imports this hook the same way the MUI `ActionableContributionsView` does (used by `UserAdminMembershipPage:215-220`).

**Rationale**: Reusing the existing facade hook avoids reimplementing the role-removal mechanics in the CRD integration layer. The spec's `useLeaveCommunityMutation` wording was imprecise — the actual mechanism is `useContributionProvider.leaveCommunity` calling `useRemoveRoleFromUserMutation` under the hood.

**Alternatives considered**:
- Call `useRemoveRoleFromUserMutation` directly from the CRD integration. **Rejected** — `useContributionProvider` already encapsulates the parameter resolution (which roleSet, which contributorId) and the post-leave refetch; reimplementing it would duplicate logic.

---

## 10. Avatar upload — file-pick triggers the existing visual upload mutation

**Question**: FR-033 says avatar uploads commit on file-select. The current MUI flow uses an `EditableAvatar` / `VisualUploader` pattern. What's the CRD equivalent?

**Decision**: **The CRD `MyProfileAvatarColumn` component exposes an `onAvatarFilePicked(file: File): Promise<void>` prop.** The integration layer wires this to the existing `useUploadVisualMutation` (or the same upload helper the current MUI uses) targeting `profile.avatar.id`. While the upload is in flight the avatar shows a subtle overlay spinner; on success the new image renders immediately (the mutation refetches the user query); on failure a CRD `Toast` surfaces the error and the avatar reverts to the previous image (Edge Cases line 255).

**Rationale**: This isolates the file-picker UI in the CRD presentational layer (no Apollo coupling) while keeping the upload mechanism identical to MUI.

---

## 11. Kratos Security tab — minimum CRD wrapping

**Question**: How much CRD restyling do the Kratos-rendered fields receive?

**Decision**: **None this iteration.** Per the existing Out of Scope bullet ("No restyle of Kratos-rendered form fields"), the CRD Security tab renders only an outer CRD card shell (`UserSettingsCard` with title "Security") and mounts the existing Kratos `KratosForm` + `KratosUI` inside the body. The `REMOVED_FIELDS` filter (passwords / profile / OIDC link controls) is reused verbatim from `UserSecuritySettingsPage`. The "WebAuthn / Passkey is not enabled on this account" info alert is shown via a CRD `Alert` (or equivalent info banner primitive) when the flow has zero WebAuthn nodes.

**Rationale**: Restyling Kratos UI markup is out of scope; this iteration only re-skins the outer shell. A future spec may tackle Kratos itself.

---

## 12. i18n namespace registration

**Question**: How is the new `crd-userPages` namespace registered?

**Decision**: **Register `crd-userPages` in `src/core/i18n/config.ts` (as a lazy-loaded namespace) and add the type augmentation in `@types/i18next.d.ts`.** All six language files live under `src/crd/i18n/userPages/userPages.{en,nl,es,bg,de,fr}.json` and are edited manually in the same PR — no Crowdin involvement (per `src/crd/CLAUDE.md`).

**Rationale**: Mirrors the precedent set by `crd-spaceSettings`, `crd-search`, etc. Lazy loading prevents bloating the main bundle.

---

## 13. Performance targets

**Decisions**:
- **Tab switch latency**: target < 200 ms perceived; achieved by lazy-loading each tab as its own React.lazy chunk + React 19 `useTransition` so a slow render does not block paint.
- **Per-field save round-trip**: target < 3 s typical; surfaced via the `pending` state's spinner and `aria-busy`. The 90-s SC-001 budget covers a complete edit-many-fields flow.
- **Bundle delta**: ≤ +30 KB gzipped on the user-pages chunk over the prior build (SC-006). Verified post-implementation via `pnpm analyze`.

**Rationale**: These are the same performance budgets the prior CRD migrations set; no domain-specific reason to deviate.

---

## 14. Tests

**Decisions**:
- **Mappers** (one Vitest file per mapper) — pure functions transforming GraphQL fixtures to CRD prop shapes. Cover the public-profile tab → section filter, the recognized-vs-arbitrary reference sort, the membership filtering / search, the notification group privilege gating.
- **Route guards** — Vitest tests for `useCanEditSettings`, plus an integration test that a non-owner-non-admin viewer hitting `/user/<other>/settings/profile` redirects to `/user/<other>` (SC-007).
- **Per-field state machine** — Vitest tests on `EditableField` covering idle → editing → pending → idle (success), idle → editing → pending → editing+error (failure with typed value preserved), idle → editing → idle (cancel via × or Escape).
- **Push availability gating** — Vitest test that the master toggle is replaced by an info banner when `isPushSupported` / `isServerEnabled` / `requiresPWAMode` / `isPrivateBrowsing` flag combinations indicate unavailability.
- **i18n keys present in all six languages** — a small runtime test that each language file has the same key shape (existing pattern in the codebase).

**Rationale**: Unit-test the pure transformation logic and the per-field state machine; rely on manual smoke for the end-to-end editing flows (consistent with the prior CRD specs).

---

## Summary

All NEEDS CLARIFICATION items are resolved. No GraphQL schema change. No new runtime dependencies. The migration is a presentation-layer port plus one new CRD i18n namespace plus one architectural pattern (the `EditableField` per-field state machine). Phase 1 (`data-model.md`, `contracts/`, `quickstart.md`) follows.
