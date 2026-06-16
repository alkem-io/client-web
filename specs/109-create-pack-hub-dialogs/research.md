# Research: CRD Create Innovation Pack & Innovation Hub Dialogs (revised)

Phase 0 decisions, **revised after the Clarifications session (2026-06-15)** which chose **strict MUI parity** on all three open questions. Format: Decision / Rationale / Alternatives. R1/R3 reverse the first-draft refinements; the reversal is recorded explicitly.

## R1 — Description: required + markdown editor (REVERSED from first draft)

**Decision**: In both create dialogs, **description is required** and rendered with the CRD **`MarkdownEditor`** (`@/crd/forms/markdown/MarkdownEditor`), max 8000 chars (`MARKDOWN_TEXT_LENGTH`). Submission is blocked until description is non-empty.

**Rationale**: Clarifications 2026-06-15 → strict MUI parity (the user's original "same functionality / same as MUI" instruction). The MUI `InnovationPackForm` / `InnovationHubForm` validate description with `MarkdownValidator(MARKDOWN_TEXT_LENGTH, { required: true })` and render `FormikMarkdownField`. CRD already has the editor and the integration glue (`useMarkdownEditorIntegration`), and the Create Subspace dialog already uses it for a required-ish markdown description — so this is a well-trodden path, not new ground.

**Consequence**: the already-shipped CRD `CreateInnovationPackDialog` (plain `<Textarea>`, description optional) **must be modified** — it is no longer reusable as-is. The dialog gains `MarkdownUploadProps` and renders the markdown editor; the connector supplies `onImageUpload`/`iframeAllowedUrls`/`onError`.

**Alternatives considered**: optional + plain textarea (first-draft R1/R2). Rejected by the clarification.

## R2 — Markdown needs account-scoped storage context (the Create Space connector pattern)

**Decision**: Each dialog is mounted by a **connector** in `src/main/crdPages/` that wraps `StorageConfigContextProvider locationType="account" accountId={accountId} skip={!open}` + a **local `Suspense fallback={null}`** boundary, and wires `useMarkdownEditorIntegration({ temporaryLocation: true })` → the dialog's `onImageUpload`/`iframeAllowedUrls`/`onError`. This is exactly `CrdCreateSpaceDialog`.

**Rationale**: The markdown editor's image upload requires an ambient storage bucket; before the resource exists, uploads use the account bucket at a temporary location (server-cleaned if abandoned). The local Suspense boundary prevents the lazy editor/namespace first-load suspension from remounting the whole account tab (the documented gotcha in `CrdCreateSpaceDialog`).

**Alternatives considered**: inline the storage context in the account tab. Rejected — duplicates the wrapper across two tabs × two dialogs; a per-dialog connector is the established, DRY pattern.

## R3 — No post-create navigation (REVERSED from first draft)

**Decision**: On success, **close + refetch + success toast, no navigation.** The user returns to the account tab with the refreshed list. The new CRD connector passes an `onCreated` that **ignores the `url`** and does not navigate.

**`useCreateInnovationPack` signature is kept unchanged** (NOT simplified): it is still consumed by the legacy MUI `src/domain/community/contributor/Account/ContributorAccountView.tsx`, which destructures `onCreated: ({ url }) => … navigate(…)`. Changing the hook to drop `url` would break that caller. The follow-up `useAdminInnovationPackLazyQuery` lookup therefore stays; the small extra round-trip when launched from CRD is an accepted cost to avoid touching the legacy caller (see analysis finding I1, 2026-06-15).

**Rationale**: Clarifications 2026-06-15 → strict MUI parity (the MUI dialogs only close + refetch + toast). Achieving parity at the **CRD entry point** does not require changing the shared hook — just not navigating from the new connector — which is the safest reconciliation with the still-live MUI consumer.

**Refetch sets** (unchanged from MUI): pack → `['AccountInformation','AdminInnovationPacksList','InnovationLibrary']`; hub → `['AdminInnovationHubsList','AccountInformation']`.

**Alternatives considered**: navigate to settings (first-draft R3, shipped pack-hook behavior). Rejected by the clarification.

## R4 — Name validation: 3–128 via the shared CRD create-flow idiom

**Decision**: Name is **required, 3–128 chars, not blank/spaces-only**. Reuse the **existing CRD create-flow validation idiom** (do not invent a new one): a `yup` schema validated on submit, `displayName: yup.string().trim().min(3,'min3').max(SMALL_TEXT_LENGTH,'maxSmall').required('required')`, with codes mapped through `t('validation.*')` — identical to `useCreateSpace`/`useCreateSubspace`. `SMALL_TEXT_LENGTH = 128`, `MARKDOWN_TEXT_LENGTH = 8000` from `@/core/ui/forms/field-length.constants`.

**Rationale**: Clarifications 2026-06-15 chose MUI parity (the MUI forms use `displayNameValidator` = min 3 / max 128, not-blank). The clarification explicitly asked to reuse existing validation if a fit exists rather than repeat ad-hoc logic — the CRD create flows already standardize this exact yup-on-submit + message-map pattern, and `useCreateSubspace` is the closest analog. Cloning it satisfies DRY and gives consistent error messages/keys.

**Alternatives considered**: non-blank only (shipped pack dialog). Rejected by the clarification. A brand-new validator. Rejected — duplicates an existing idiom.

## R5 — Subdomain validation (client format) + uniqueness (server)

**Decision**: Subdomain **required, length 3–25, `^[a-z0-9-]*$`** (lowercase letters/digits/hyphens), validated on the client (mirroring the `useCreateSpace` `nameId` rule but max 25). **Uniqueness is server-enforced**; a duplicate is surfaced as an error toast/message with input preserved and the dialog open.

**Rationale**: Matches the MUI `subdomainValidator` (built on `nameIdValidator`). The `useCreateSpace` schema already encodes the same lowercase-alnum-hyphen + min-3 rule for slugs — reuse that shape with max 25. No live availability probe (the MUI flow has none).

**Alternatives considered**: live availability check. Rejected — not in the MUI flow; out of scope.

## R6 — Hub dialog & hook, mirroring the subspace/pack pattern

**Decision**: Build `CreateInnovationHubDialog` (pure CRD: subdomain `Input`, name `Input`, tagline `Input`, markdown description) and `useCreateInnovationHub` sending the **verified MUI variables**:

```
hubData: {
  accountID,
  subdomain: values.subdomain,
  profileData: { displayName: values.name, tagline: values.tagline, description: values.description },
  type: InnovationHubType.List,
  spaceListFilter: [],
}
```
`refetchQueries: ['AdminInnovationHubsList','AccountInformation']`, `useTransition` for the in-flight state, `onCreated(id)` (no navigation).

**Rationale**: Reuses a proven shape; `type: List` + empty `spaceListFilter` match the MUI dialog exactly (FR-006).

**Alternatives considered**: a generic shared create-account-resource dialog over pack + hub. Rejected — field sets differ (subdomain, tagline); premature abstraction over two call sites; ISP favors two focused components.

## R7 — Validation lives in the connector; component only renders errors

**Decision**: Each connector computes `errors` (yup-on-submit + a "block submit when invalid" `canSubmit`/disabled-Create derivation) and passes them in; the CRD component renders per-field errors and disables Create on blocking errors. The component performs no validation itself.

**Rationale**: CRD golden rule — no business logic in components. Matches `useCreateSpace`/`useCreateSubspace`, where the hook owns the schema and the dialog is presentational.

**Alternatives considered**: validate inside the component. Rejected — violates the CRD boundary; not standalone-previewable.

## R8 — Discard-on-close guard

**Decision**: Each connector uses `useDialogCloseGuard` (`@/crd/components/dialogs/useDialogCloseGuard`) with `isDirty` derived from the form values and `blockClose` while submitting, so Esc / outside-click / X prompt `DiscardChangesDialog` once the user has authored content.

**Rationale**: CRD rule #9 — dialogs holding authored input must guard close. With a required markdown description, these dialogs hold real authored content (unlike the trivial name-only draft). `CreateSubspaceDialog` is the reference.

**Alternatives considered**: silent close. Rejected — violates CRD rule #9.

## R9 — i18n namespaces

**Decision**: Pack strings stay in **`crd-templates`** (`createPack.*`, already registered) — verify six-language parity and add any missing markdown/validation labels. Hub strings go to **`crd-innovationHub`** under a new **`createHub.*`** group, added to all six language files. Both namespaces are already registered in `crdNamespaceImports`. Validation messages reuse/extend the `validation.*` keys already used by the create-flow connectors.

**Rationale**: Both namespaces exist; co-locating create strings with their feature is natural; no new namespace registration needed. Glossary: "Space/Subspace/Post/template/Layout/Virtual Contributor" stay English (nl-enforced); "Innovation Pack/Hub" follow existing namespace precedent.

**Alternatives considered**: a dedicated namespace. Rejected — unnecessary.

## R10 — Account scoping, entitlement gating, account-name subtitle

**Decision**: Keep the existing per-tab `tryCreate(resourceKey, entitled.X, openDialog)` gating untouched (it shows the no-entitlement "contact us" dialog and does not open the create dialog when the entitlement is absent). Pass `accountId` (`account.id`) and the account display name (`accountHostName`, already in both tabs) for the subtitle (FR-018).

**Rationale**: Entitlement logic is upstream and already correct; `accountId`/`accountHostName` are already computed in both tabs. Mirrors `CrdCreateSpaceDialog`'s `accountName`.

**Alternatives considered**: move gating into the dialogs. Rejected — account/license business logic belongs in the integration layer.

## Summary of decisions vs. first draft

| Item | First draft | Revised (this plan) | Source |
|---|---|---|---|
| Description | optional, plain textarea | **required, markdown editor** | Clarification → R1 |
| Pack dialog reuse | reuse as-is | **modify** (markdown + validation) | R1 consequence |
| Storage context | not needed | **required** (markdown uploads) | R2 |
| Post-create | navigate to settings | **no navigation** (close+refetch+toast) | Clarification → R3 |
| Name rule | non-blank | **3–128, shared yup idiom** | Clarification → R4 |
| Subdomain | 3–25 lowercase/hyphen | unchanged | R5 |
| Discard guard | not noted | **required** (authored markdown) | R8 |
