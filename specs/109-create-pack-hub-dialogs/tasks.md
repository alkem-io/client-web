---
description: "Task list for CRD Create Innovation Pack & Innovation Hub Dialogs (strict MUI parity)"
---

# Tasks: CRD Create Innovation Pack & Innovation Hub Dialogs

**Input**: Design documents from `/specs/109-create-pack-hub-dialogs/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

> **Strict MUI parity** (Clarifications 2026-06-15): required **markdown** description, name **3–128** via the shared validator, **no post-create navigation**. Both dialogs use the `CrdCreateSpaceDialog` connector pattern (storage context + Suspense + markdown integration + yup-on-submit + discard guard). The existing CRD pack dialog/hook are **modified**, not reused as-is.

**Tests**: Unit tests included for the new hub hook + validation schema (per plan.md "Testing"); the rest of the suite stays green. No other test tasks (not requested).

**Organization**: Grouped by user story. Work is asymmetric — the Pack assets exist and are **modified** (US1); the Hub is **built new** (US2).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1–US5 from spec.md
- All paths are absolute from repo root `/workspaces/client-web/`

## Path Conventions

CRD presentational layer: `src/crd/`. Integration layer: `src/main/crdPages/`. i18n: `src/crd/i18n/<feature>/`. Standalone preview: `src/crd/app/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm ground truth before coding.

- [X] T001 Confirm no schema/codegen change: verify `useCreateInnovationPackMutation`, `useCreateInnovationHubMutation`, `useUploadFileMutation`, `CreateInnovationPackOnAccountInput`, `CreateInnovationHubOnAccountInput`, `InnovationHubType.List` exist in `src/core/apollo/generated/{apollo-hooks,graphql-schema}.ts` (no `pnpm codegen`).
- [X] T002 Re-read the reference implementations to clone: `src/main/crdPages/topLevelPages/createSpace/CrdCreateSpaceDialog.tsx` (connector: `StorageConfigContextProvider` + `Suspense` + `useMarkdownEditorIntegration`), `src/main/crdPages/topLevelPages/spaceSettings/subspaces/useCreateSubspace.ts` (yup-on-submit + `t('validation.*')` mapping + `SMALL_TEXT_LENGTH`/`MARKDOWN_TEXT_LENGTH`), and `useDialogCloseGuard` usage in `src/crd/components/space/settings/CreateSubspaceDialog.tsx`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Cross-cutting i18n both dialogs rely on (markdown + validation labels). No story wiring until done.

**⚠️ CRITICAL**: Complete before Phase 3+.

- [X] T003 [P] Verify/extend `createPack.*` (incl. a `saveForMoreDetails` deferred-fields hint — FR-002/Edge "Deferred fields messaging") and the shared `validation.*` keys (min3, maxSmall, maxMarkdown, required) in all six `src/crd/i18n/templates/templates.{en,nl,es,bg,de,fr}.json` so the pack dialog renders the markdown editor, the deferred-fields hint, and every validation message in every language; add any missing keys/languages with strict parity.
- [X] T004 [P] Add `createHub.*` keys (`title`, `subdomain`, `subdomainPlaceholder`, `name`, `namePlaceholder`, `tagline`, `taglinePlaceholder`, `description`, `descriptionPlaceholder`, `saveForMoreDetails` deferred-fields hint, `create`, `cancel`, account-subtitle) plus the `validation.*` set (incl. `slugInvalid`/`subdomainFormat`, `min3`, `maxSubdomain`, `required`, `maxMarkdown`, `maxMid`) in all six `src/crd/i18n/innovationHub/innovationHub.{en,nl,es,bg,de,fr}.json`, with strict key parity; keep "Innovation Hub" per existing namespace precedent.

**Checkpoint**: i18n ready for both dialogs.

---

## Phase 3: User Story 1 - Create an Innovation Pack on the new design (Priority: P1) 🎯 MVP

**Goal**: The user account tab opens the CRD-native Create Innovation Pack dialog (name 3–128 + required markdown description), creates the pack in the user's account, closes + refetches + toasts (no navigation) — no MUI dialog.

**Independent Test**: Design version `2`, user account tab → Create Innovation Pack → name + markdown description → Create → pack listed, success toast, stays on the account tab, all CRD styling.

- [X] T005 [US1] Modify `src/crd/components/innovationPack/CreateInnovationPackDialog.tsx`: replace the plain `<Textarea>` with the CRD `MarkdownEditor` (`@/crd/forms/markdown/MarkdownEditor`); accept `MarkdownUploadProps` (`onImageUpload`/`iframeAllowedUrls`/`onError`); render both `errors.name` and `errors.description`; render the `createPack.saveForMoreDetails` deferred-fields hint (avatar/tags/references/visibility set later in settings); keep the sticky-header/footer layout, `aria-invalid`/`aria-describedby`, `aria-busy` Create. Zero `@mui/*`, no business logic.
- [X] T006 [US1] Update `src/crd/components/innovationPack/types.ts`: extend `CreateInnovationPackDialogProps` with `MarkdownUploadProps` + optional `accountName`; keep `CreateInnovationPackValues` (`{ name, description }`) per `contracts/create-innovation-pack.ts`.
- [X] T007 [US1] Leave `src/main/crdPages/innovationPack/useCreateInnovationPack.ts` **signature unchanged** — it is still consumed by the legacy MUI `src/domain/community/contributor/Account/ContributorAccountView.tsx` (which destructures `onCreated: ({ url }) => … navigate(…)`); do NOT change `onCreated`'s shape or drop the `url` lookup, or that caller breaks. The new CRD connector (T008) simply passes an `onCreated` that **ignores `url` and does not navigate** (strict parity = no navigation). The follow-up admin query stays for the MUI caller's benefit; the small extra round-trip when launched from CRD is acceptable.
- [X] T008 [US1] Create `src/main/crdPages/innovationPack/CrdCreateInnovationPackDialog.tsx` connector (clone `CrdCreateSpaceDialog`): `StorageConfigContextProvider locationType="account" accountId skip={!open}` + local `Suspense fallback={null}`; `useMarkdownEditorIntegration({ temporaryLocation: true })`; yup-on-submit validation (`displayName` trim/min3/maxSmall/required, `description` non-empty/maxMarkdown) mapped via `t('validation.*')`; `useCreateInnovationPack({ accountId, onCreated })` with `onCreated` closing + resetting + success toast; `useDialogCloseGuard({ isDirty, onClose, blockClose: creating })`; mount `<CreateInnovationPackDialog>` with validated props + markdown integration + `accountName`.
- [X] T009 [US1] In `src/main/crdPages/topLevelPages/userPages/settings/account/CrdUserAccountTab.tsx`: remove the MUI import `@/domain/InnovationPack/CreateInnovationPackDialog/...` and its JSX mount; mount `<CrdCreateInnovationPackDialog accountId={account.id} accountName={accountHostName} open={createPackOpen} onClose={() => setCreatePackOpen(false)} />` in the `{account?.id && (...)}` block; keep `tryCreate('innovationPacks', entitled.innovationPacks, () => setCreatePackOpen(true))`.
- [X] T010 [US1] Run `pnpm lint`; confirm `CrdUserAccountTab.tsx` no longer imports the MUI pack dialog; manually verify the pack create flow on the user tab (name+markdown description → create → no navigation, listed, toast; short name / empty description blocked).

**Checkpoint**: Pack creation works on the user account tab at strict parity (MVP).

---

## Phase 4: User Story 2 - Create an Innovation Hub on the new design (Priority: P1)

**Goal**: The user account tab opens a new CRD-native Create Innovation Hub dialog (subdomain + name + tagline + required markdown description), creates a List-type hub, closes + refetches + toasts (no navigation) — no MUI dialog.

**Independent Test**: Design version `2`, user account tab → Create Innovation Hub → subdomain (invalid → format error) + name + markdown description → Create → hub listed, success toast, stays on the account tab.

- [X] T011 [P] [US2] Create `src/crd/components/innovationHub/createInnovationHub.types.ts` with `CreateInnovationHubValues` (`subdomain`, `name`, `tagline`, `description`), `CreateInnovationHubErrors`, `CreateInnovationHubDialogProps` (`& MarkdownUploadProps`, `accountName?`) per `contracts/create-innovation-hub.ts`.
- [X] T012 [US2] Create `src/crd/components/innovationHub/CreateInnovationHubDialog.tsx` — pure CRD dialog cloning the pack dialog: sticky header/footer, controlled `value`/`onChange`, `Input` for subdomain + name + tagline, CRD `MarkdownEditor` for description, per-field `errors` with `aria-invalid`/`aria-describedby`, the `createHub.saveForMoreDetails` deferred-fields hint (tags/banner set later in settings), `creating` spinner + `aria-busy`, optional `accountName` subtitle, `useTranslation('crd-innovationHub')`. Zero `@mui/*`, no business logic. (Depends on T011.)
- [X] T013 [P] [US2] Create `src/main/crdPages/innovationHub/createInnovationHubSchema.ts`: yup schema (`subdomain` matches `^[a-z0-9-]*$` + min3 + max25 + required; `name` trim/min3/maxSmall/required; `tagline` maxMid notRequired; `description` non-empty/maxMarkdown) + a `getMessage` mapping codes to `t('validation.*')`, mirroring `useCreateSubspace`.
- [X] T014 [US2] Create `src/main/crdPages/innovationHub/useCreateInnovationHub.ts`: `useCreateInnovationHubMutation` sending `{ accountID, subdomain, profileData: { displayName, tagline, description }, type: InnovationHubType.List, spaceListFilter: [] }`, `refetchQueries: ['AdminInnovationHubsList','AccountInformation']`, `useTransition` for `creating`, reject when `accountId` missing, `onCreated(id)` (no navigation). (Depends on T013 for value typing.)
- [X] T015 [US2] Create `src/main/crdPages/innovationHub/CrdCreateInnovationHubDialog.tsx` connector mirroring `CrdCreateInnovationPackDialog` (T008): storage context + Suspense + `useMarkdownEditorIntegration` + validation via `createInnovationHubSchema` + `useCreateInnovationHub` + `useDialogCloseGuard`; close + refetch + toast on success. (Depends on T012, T013, T014.)
- [X] T016 [P] [US2] Create `src/main/crdPages/innovationHub/__tests__/useCreateInnovationHub.test.ts` (Vitest): assert mutation variables (fixed `type: List`, empty `spaceListFilter`, account/profile mapping), missing `accountId` rejects without firing, and `createInnovationHubSchema` flags bad subdomain / short name / empty description / over-length.
- [X] T017 [US2] In `CrdUserAccountTab.tsx`: remove the MUI import `@/domain/innovationHub/CreateInnovationHub/...` and its JSX mount; mount `<CrdCreateInnovationHubDialog accountId={account.id} accountName={accountHostName} open={createHubOpen} onClose={() => setCreateHubOpen(false)} />`; keep `tryCreate('innovationHubs', entitled.innovationHubs, () => setCreateHubOpen(true))`.
- [X] T018 [US2] Run `pnpm lint` + `pnpm vitest run src/main/crdPages/innovationHub --reporter=basic`; manually verify the hub create flow on the user tab (subdomain format error; valid → create → no navigation, listed, toast).

**Checkpoint**: Both pack and hub creation work on the user account tab via CRD dialogs.

---

## Phase 5: User Story 3 - Create a pack or hub in an organization account (Priority: P2)

**Goal**: The organization account tab offers the same two CRD dialogs, creating resources under the organization's account.

**Independent Test**: Org account tab (design version `2`) → create a pack and a hub → each owned by the org account, not the user's personal account.

- [X] T019 [US3] In `src/main/crdPages/topLevelPages/organizationPages/settings/account/CrdOrgAccountTab.tsx`: remove both MUI imports (`@/domain/InnovationPack/CreateInnovationPackDialog/...`, `@/domain/innovationHub/CreateInnovationHub/...`) and their JSX mounts.
- [X] T020 [US3] In the same file, mount `<CrdCreateInnovationPackDialog>` and `<CrdCreateInnovationHubDialog>` using the org `account.id` + `accountHostName` (same props as the user tab, T009/T017); keep both `tryCreate(...)` gates unchanged.
- [X] T021 [US3] Run `pnpm lint`; confirm `CrdOrgAccountTab.tsx` carries no `@mui/*` import; manually verify pack + hub creation under an organization account (resources owned by the org account).

**Checkpoint**: Both dialogs work identically on user and org account tabs.

---

## Phase 6: User Story 4 - Be told clearly when creation isn't possible (Priority: P2)

**Goal**: Entitlement gating, subdomain-format validation, and server-error handling all surface clear messages with no silent failure or orphaned resources.

**Independent Test**: Force no-entitlement (dialog must not open; "contact us" appears); invalid subdomain (format error before Create); duplicate subdomain (server error toast, dialog stays open, input preserved).

- [X] T022 [US4] Verify the connectors block submission and show inline field errors for: empty/short/over-length name, empty/over-length description, and malformed subdomain (`createInnovationHubSchema`), keeping Create disabled until valid (research R4–R7).
- [X] T023 [US4] Verify both connectors' `create` catch path shows a clear error toast and **keeps the dialog open with input preserved** on server error (e.g. duplicate subdomain), and that `creating` blocks double-submit and (via `useDialogCloseGuard` `blockClose`) dialog dismissal while in flight.
- [X] T024 [US4] Verify the existing no-entitlement path is untouched: `tryCreate` opens the no-entitlement `ConfirmationDialog` (contact CTA) and the create dialog does **not** open when `AccountInnovationPack` / `AccountInnovationHub` is absent, on both user and org tabs.

**Checkpoint**: All failure modes produce clear messages; no silent failures or orphaned resources.

---

## Phase 7: User Story 5 - Preview the dialogs in the standalone demo (Priority: P3)

**Goal**: Both create dialogs render with mock data in the standalone CRD preview, including validation-error and submitting states.

**Independent Test**: `pnpm crd:dev` → open each dialog → renders with mock data, no backend; exercise error + submitting states.

- [X] T025 [P] [US5] Add a standalone-preview entry for `CreateInnovationHubDialog` under `src/crd/app/` with mock `value`/`errors`/`onChange`/`onCreate`/`creating` + no-op `MarkdownUploadProps`, covering valid input, a subdomain-format error, and submitting.
- [X] T026 [P] [US5] Add a standalone-preview entry for the modified `CreateInnovationPackDialog` under `src/crd/app/` (mock props incl. markdown integration, name + description error states, submitting). Run `pnpm crd:dev` and visually confirm both.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T027 [P] Accessibility pass on both CRD dialogs (WCAG 2.1 AA): labeled inputs, visible `focus-visible:ring`, `aria-invalid`/`aria-describedby`, `aria-busy` Create, keyboard operability incl. the markdown editor, accessible close.
- [X] T028 [P] Confirm both CRD dialog components (`src/crd/components/innovationPack/CreateInnovationPackDialog.tsx`, `src/crd/components/innovationHub/CreateInnovationHubDialog.tsx`) have zero `@mui/*`/`@emotion/*` and no business-logic imports (Apollo/domain/routing/formik), and that `src/main/crdPages/**` carries no `@mui/*` introduced by these entry points (SC-006).
- [X] T029 Confirm the legacy MUI dialogs (`src/domain/InnovationPack/CreateInnovationPackDialog/...`, `src/domain/innovationHub/CreateInnovationHub/...`) remain untouched for legacy-design surfaces (FR-017).
- [X] T030 Final gate: `pnpm lint` + `pnpm vitest run` green; six-language key parity for `createPack.*`, `createHub.*`, and the `validation.*` set; run the quickstart manual checklist (user + org tabs, both resources, validation + failure cases, discard-on-close, 768px-tall viewport).

---

## Dependencies & Execution Order

- **Setup (Phase 1)** → **Foundational (Phase 2, i18n)** → user stories.
- **US1 (Phase 3)** depends on Foundational (T003). Order within: T005/T006 (dialog+types) → T007 (hook) → T008 (connector needs dialog+hook) → T009 (tab wiring needs connector) → T010. **MVP.**
- **US2 (Phase 4)** depends on Foundational (T004). T011 first; T012 needs T011; T013 [P] independent; T014 needs T013; T015 needs T012+T013+T014; T016 [P] needs T013/T014; T017 needs T015; T018 last. The hub component/hook/schema (T011–T016) can proceed in parallel with US1 (different files).
- **US3 (Phase 5)** depends on **US1 + US2** (it mounts both connectors on the org tab).
- **US4 (Phase 6)** is verification over the US1–US3 connectors/schema; run after them.
- **US5 (Phase 7)** needs the components (T005 modified, T012 new).
- **Polish (Phase 8)** last.

## Parallel Opportunities

- T003 ∥ T004 (i18n) in Foundational.
- T011 ∥ T013 ∥ T016 at the start of US2 (types / schema / test scaffolding — different files).
- US1's connector chain and US2's component/hook/schema run in parallel (different files); both edit `CrdUserAccountTab.tsx` (T009, T017), so **those two edits are sequential**.
- T025 ∥ T026 (previews); T027 ∥ T028 (polish).

## Implementation Strategy

- **MVP = US1** (Phase 3): modify the pack dialog to markdown + parity validation, add the connector, simplify the hook, wire the user tab. Delivers the pack at parity and proves the connector pattern the hub reuses.
- **Increment 2 = US2**: build the hub dialog + connector + hook + schema + test.
- **Increment 3 = US3**: mount both connectors on the org tab (mechanical).
- **Increment 4 = US4 + US5 + Polish**: failure-mode verification, previews, a11y, the no-`@mui` / parity gates.

## Total

30 tasks — Setup 2, Foundational 2, US1 6, US2 8, US3 3, US4 3, US5 2, Polish 4.
