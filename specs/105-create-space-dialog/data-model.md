# Phase 1 Data Model: CRD Create Space Dialog

**No GraphQL schema changes.** This document describes the **client-side shapes** (form state, CRD prop types, hook result) and the mapping to the **existing** `CreateSpaceOnAccountInput` mutation. Generated types are reused as-is; none are exported through the CRD component contract (Constitution III).

## Domain entities (existing — reference only)

| Entity | Source | Used for |
|---|---|---|
| **Space (L0)** | `createSpace` mutation result (`id`, `about.profile.url`, `SpaceAboutLight`, `ProfileVisuals`) | Navigate to / welcome-cache the new Space |
| **Account** | `useAccountPlanAvailabilityQuery` (`account.authorization.myPrivileges`, `account.license.availableEntitlements`) | Plan availability + entitlement gate (gate lives on the account page) |
| **License plan** | `usePlansTableQuery` → `platform.licensingFramework.plans` filtered to enabled, available `SpacePlan`, sorted by `sortOrder` | `licensePlanId = availablePlans[0].id` |
| **Space template** | `useTemplatePicker` (`mode:'select'`, `allowedTypes:['space']`) + `useTemplateContentLazyQuery` | Optional seed; preview + pre-fill |
| **Visual constraints** | `useDefaultVisualTypeConstraintsQuery` (`VisualType.Banner`, `VisualType.Card`) | Center-crop/resize banner & card files |

## Client-side state

### `CreateSpaceFormValues`

The dialog's editable state (held in `useCreateSpace`). Plain TypeScript — no GraphQL types.

| Field | Type | Required | Validation (parity with MUI) |
|---|---|---|---|
| `displayName` | `string` | ✅ | trim, `min 3`, `max SMALL_TEXT_LENGTH` |
| `nameId` | `string` | ✅ | `nameIdValidator` format rules; auto-derived from `displayName` via the canonical `createNameId` (accent-fold, lowercase) until edited |
| `tagline` | `string` | — | `min 3`, `max SMALL_TEXT_LENGTH` when non-empty |
| `description` | `string` | — | markdown; `max MARKDOWN_TEXT_LENGTH` (kept — matches the Subspace dialog) |
| `tags` | `string[]` | — | each `min 2` |
| `spaceTemplateId` | `string` | — | optional; `''` = blank Space |
| `bannerFile` | `File \| null` | — | **Page Banner** — resized to `VisualType.Banner` constraints; too-small → error (replaces the Subspace dialog's avatar) |
| `cardBannerFile` | `File \| null` | — | **Card Banner** — resized to `VisualType.Card` constraints; too-small → error |
| `addTutorialCallouts` | `boolean` | — | default `false` ("Add Tutorials to this Space") |
| `acceptedTerms` | `boolean` | ✅ | must be `true` to submit (terms checkbox + dialog) |

> The field set mirrors the Create Subspace dialog **plus** `nameId` (URL slug), `bannerFile` (Page Banner, replacing the avatar), `addTutorialCallouts`, and `acceptedTerms`. `addCallouts` is always `true` (not user-editable), passed straight to the mutation. Inline images in `description` upload to a temporary account bucket via `useMarkdownEditorIntegration({ temporaryLocation: true })`.

### Derived / control state

| Name | Type | Meaning |
|---|---|---|
| `isSlugEdited` | `boolean` | once `true`, `nameId` stops following `displayName` (research R4) |
| `errors` | `CreateSpaceFieldErrors` | `Partial<Record<keyof CreateSpaceFormValues, string>>` — translated messages |
| `submitting` | `boolean` | mirrors `useSpaceCreation` loading; drives `aria-busy` + `blockClose` |
| `canSubmit` | `boolean` | `displayName≥3 && nameId valid && acceptedTerms && hasAvailablePlan && !submitting` |
| `noPlanAvailable` | `boolean` | `availablePlans.length === 0` once plans load |
| `isDirty` | `boolean` | any field touched (name/slug/tagline/description/tags/template/banner/card/tutorials) — feeds `useDialogCloseGuard` |

### Display-only props (resolved by the connector, not form state)

| Prop | Source | Use |
|---|---|---|
| `urlPrefix` | `usePlatformOrigin()` + `/` (lowercased) | Prefix shown before the slug input (e.g. `https://dev-alkem.io/`) |
| `accountName` | the organization's display name (org tab only; omitted on the user's own account) | Drives the account-aware subtitle (FR-020) |

## State transitions

```
closed
  └─ openDialog(accountId) ──► open, reset()           # skip-gated queries fire (plans, constraints)
open
  ├─ onChange({displayName}) ─► derive nameId (unless isSlugEdited)
  ├─ onChange({nameId})      ─► isSlugEdited = true
  ├─ pick template           ─► fetch content, preview, pre-fill text fields (overwrite-guard if dirty)
  ├─ pick image              ─► resize to constraints → bannerFile/cardBannerFile (or field error)
  ├─ requestClose (dirty)    ─► DiscardChangesDialog ─► onClose | stay
  └─ onSubmit (canSubmit)
        ├─ validate() fails  ─► set errors, stay open
        ├─ no plan           ─► no-plan message, stay open
        ├─ mutation error    ─► notify, stay open (input retained)
        └─ success           ─► addSpaceWelcomeCache, Sentry log, refetch,
                                 onSpaceCreated(result) | navigate(url), close
```

## Mapping to the mutation (`CreateSpaceOnAccountInput`)

`useCreateSpace.onSubmit` → reused `useSpaceCreation.createSpace(...)`:

| Form value | Mutation field |
|---|---|
| `accountId` (from connector prop) | `spaceData.accountID` |
| `availablePlans[0].id` | `spaceData.licensePlanID` |
| `nameId` | `spaceData.nameID` |
| `spaceTemplateId \|\| undefined` | `spaceData.spaceTemplateID` |
| `displayName` | `spaceData.about.profileData.displayName` |
| `tagline` | `spaceData.about.profileData.tagline` |
| `description` | `spaceData.about.profileData.description` |
| `tags` | `spaceData.about.profileData.tags` |
| `bannerFile` / `cardBannerFile` | `about.profile.visuals.banner/cardBanner` → uploaded post-create by `useUploadVisualsOnCreate` |
| `addTutorialCallouts` | `spaceData.collaborationData.addTutorialCallouts` |
| `true` (constant) | `spaceData.collaborationData.addCallouts` |

`why` is not sent (empty). Result `{ id, about.profile.url }` drives navigation + welcome cache.
