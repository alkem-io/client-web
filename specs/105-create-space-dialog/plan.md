# Implementation Plan: CRD Create Space Dialog

**Branch**: `105-create-space-dialog` | **Date**: 2026-06-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/105-create-space-dialog/spec.md`

## Summary

Replace the **MUI Create Space dialog** (rendered today inside the CRD contributor account pages) with a **CRD-native Create Space dialog**, closing a user-visible inconsistency: because the default design version is CRD, every new-design user who clicks "Create Space" is dropped into a mismatched MUI dialog, and `src/main/crdPages/**` transitively imports `@mui/*` solely because of it.

**Technical approach:** Build the dialog as a **clone of the already-migrated CRD Create Subspace dialog** (`CreateSubspaceDialog.tsx` + `useCreateSubspace.ts`) — the exact same 3-layer split, field layout (template + preview, display name, tagline, **markdown description**, tags), template-picker integration, image-resize pipeline, yup-on-submit validation, and `useDialogCloseGuard` discard guard — with these deltas:

- **Avatar → Page Banner** (`VisualType.Banner`, wide aspect); **Card Banner** unchanged (`VisualType.Card`).
- **+ URL slug field** (auto-derived from the name, editable, `nameId`-validated) — L0 needs a `nameID`; subspaces don't.
- **+ two checkboxes** at the bottom: **"Add Tutorials to this Space"** and a required **"I have read and accept the terms … for creating a Space"** (link opens a terms dialog).
- **+ account scoping** (target account from the account tab) and **license-plan selection** (`useSpacePlans` → first available Space plan; no plan = hard stop).
- **+ image crop dialog** (FR-004, research R16): selecting a page banner or card banner opens the shared `ImageCropDialog` for user-controlled cropping/positioning (the image is never used as-is); the cropped output is resized to the `VisualType.Banner` / `VisualType.Card` constraints from `useDefaultVisualTypeConstraintsQuery`, and the cropped files (plus their alt text) are uploaded post-create via `useSpaceCreation`'s `useUploadVisualsOnCreate`.

The markdown **Description is kept** (the Subspace dialog has it) — a deliberate choice to mirror the Subspace dialog rather than the MUI L0 form, which omits it. The MUI `CreateSpace` flow remains the source of truth for *behavior* (validation, plan selection, post-create side-effects, exact terms/tutorials copy); the prototype's inline `alkem.io/<slug>` row is a minor visual reference. The experimental AI "Guided Creation" chat is out of scope.

**No backend or GraphQL schema changes.** Every data hook already exists and is generated — `useCreateSpaceMutation`, `usePlansTableQuery`, `useAccountPlanAvailabilityQuery`, `useDefaultVisualTypeConstraintsQuery`, `useTemplateContentLazyQuery`. **No `pnpm codegen` required** (Constitution III). The MUI dialog stays in the codebase for legacy-design surfaces.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19 (React Compiler enabled — no manual `useMemo`/`useCallback`/`React.memo`)
**Primary Dependencies**: Apollo Client (generated hooks only); shadcn/ui + Tailwind v4 + Radix UI (`@/crd/primitives/*`); `lucide-react`; `react-i18next`; `yup` (validation on submit, decoupled from Formik). **No new runtime dependencies.**
**Storage**: N/A (frontend SPA). Page-banner/card-banner files are uploaded **after** Space creation via the existing `useUploadVisualsOnCreate` inside `useSpaceCreation` (to the new Space's profile bucket); the dialog only collects `File` objects + center-crop/resizes them to the platform `VisualType.Banner` / `VisualType.Card` constraints. Inline images in the markdown **description** upload *during* editing to a temporary account bucket via the shared `useMarkdownEditorIntegration({ temporaryLocation: true })`, with the connector wrapped in an account-scoped `StorageConfigContextProvider` (as the MUI `CreateSpace` already does).
**Testing**: Vitest + jsdom — mapper/validation/slug-derivation unit tests mirroring the existing subspace `resizeImageToConstraints.test.ts` and the dashboard mapper tests.
**Target Platform**: Web SPA (Vite), browsers with >90% global support per CLAUDE.md.
**Project Type**: web (single frontend repo)
**Performance Goals**: No added GraphQL round-trips beyond the legacy behavior (plans/constraints queries are `skip`-gated on dialog open); the dialog mounts on the already-loaded account page (no new route, no lazy chunk penalty).
**Constraints**: CRD layer purity inside `src/crd/` (no `@mui/*`, `@emotion/*`, `@apollo/client`, `@/domain/*`, `react-router-dom`, `formik`); all strings i18n'd in all six languages (en, nl, es, bg, de, fr) in the same PR; URLs via `@/main/routing/urlBuilders` / read off the created Space's `about.profile.url`; behavioral parity with the MUI flow in CRD visual language.
**Scale/Scope**: One CRD presentational component + one integration hook + one connector; two account-tab edits (user + org); one new i18n namespace (6 files); one optional standalone demo page. Reused: ~5 generated GraphQL hooks, `useSpaceCreation`, `useSpacePlans`/`usePlanAvailability`, `useTemplatePicker`, `resizeImageToConstraints`, `useDialogCloseGuard`, `TemplateContentPreview`, `TagsInput`, `MarkdownEditor` + `useMarkdownEditorIntegration`, `StorageConfigContextProvider`.

### Key discoveries from Phase 0 research

- **The dialog clones the Subspace dialog; Description is KEPT.** The user directed the dialog to be modeled on the Create Subspace dialog, which has a markdown description — so Create Space keeps it (diverging deliberately from the MUI L0 `CreateSpaceForm`, which omits a description input). The cost is low: the Subspace dialog already wires description uploads via the shared `useMarkdownEditorIntegration({ temporaryLocation: true })`, and the MUI `CreateSpace` already wraps creation in an account-scoped `StorageConfigContextProvider` — the connector combines both.
- **Visuals: Avatar → Page Banner.** The Subspace dialog's Avatar (`VisualType.Avatar`, `aspect-square`) is replaced by a **Page Banner** (`VisualType.Banner`, wide aspect); the Card Banner (`VisualType.Card`, `aspect-video`) is unchanged. Same `resizeImageToConstraints` pipeline, only the visual type swapped.
- **URL slug is the one net-new field vs. the subspace dialog.** The subspace dialog has no slug; Create Space needs `nameId`. Replicate the MUI `NameIdField`: show the platform origin as a **prefix** (`usePlatformOrigin()` + `/`, lowercased, resolved in the connector → `urlPrefix` prop) and derive the slug with the canonical **`createNameId`** helper (accent-fold, lowercase) until the user edits it. **No server availability check** — the MUI flow validates format only.
- **Refinements (post-review) — see research R13/R14, FR-002/004/007/020.** Banners render side by side on wide screens; the Accept-terms checkbox moves to the footer (shortened label); the subtitle names the org account; the shared `TemplateContentPreview` ScrollArea gets bottom padding to stop clipping the last accordion item.
- **Exact copy reused from MUI.** The terms/tutorials/no-plan strings reuse the existing MUI English values verbatim (`createSpace.terms.*`, `createSpace.addTutorialsLabel`, `createSpace.license.noPlansError`) so copy is identical across designs (research R10).
- **License plan = first available Space plan.** `useSpacePlans({ accountId })` → `availablePlans[0].id`. Empty list is a hard stop with a clear message (`createSpace.license.noPlansError` in the MUI flow). Both queries are `skip`-gated until the dialog opens and the account id is known.
- **Template "selectable" parity rule.** The MUI selector only lets you pick Space templates whose captured space has a **valid 4-state innovation flow**. Pre-filtering the CRD picker proved infeasible (the picker's card rows carry no innovation-flow data), so the rule is enforced **on selection**: `applyTemplate` rejects a non-conforming pick with a notification and applies nothing. No picker API change. See research R6 (corrected, round 6).
- **Both account tabs are identical wiring.** `CrdUserAccountTab.tsx:215` and `CrdOrgAccountTab.tsx:207` each render `<CreateSpace accountId={account.id} open={createSpaceOpen} onClose={…} />`. The swap is mechanical: replace with the CRD connector and drop the MUI import. The surrounding entitlement gate (`tryCreate('spaces', entitled.spaces, …)`) is unchanged.
- **Post-create side-effects are reused verbatim** from the MUI `CreateSpace` container: `addSpaceWelcomeCache(spaceId)`, the Sentry `info()` log, refetch `AccountInformation` (+ dashboard spaces), and navigate to `result.about.profile.url` (unless the caller passes an `onSpaceCreated` handler).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment | Status |
|---|---|---|
| **I. Domain-Driven Boundaries** | Space-creation business logic stays in the existing domain hooks (`useSpaceCreation`, `useSpacePlans`, `usePlanAvailability`) — reused unchanged. The new integration hook `useCreateSpace` lives under `src/main/crdPages/` and is the only GraphQL↔props seam. The CRD `CreateSpaceDialog` is purely presentational (plain-TS props, callback handlers). | ✅ Pass |
| **II. React 19 Concurrent UX** | Dialog mounts on the already-loaded account page (no new route); `skip`-gated queries; submit uses the existing async mutation with `submitting`/`aria-busy`; explicit empty/loading/error/no-plan states (FR-004/FR-011/FR-012). No legacy lifecycle patterns; no manual memoization. | ✅ Pass |
| **III. GraphQL Contract Fidelity** | All data via generated hooks; **no `.graphql` edits**, so **no codegen** and no schema diff. Component props are plain TS — no generated GraphQL types exported through the CRD contract. | ✅ Pass |
| **IV. State & Side-Effect Isolation** | Apollo cache + scoped React state in the hook; effects only in hooks. Visual files held in local state; upload side-effect lives in the reused `useSpaceCreation`. Navigation via `useNavigate` in the integration layer, never in the CRD component. | ✅ Pass |
| **V. Experience Quality** | WCAG 2.1 AA on every control (labeled inputs, `aria-invalid`, focus rings, `aria-busy` submit, accessible close); sticky header/footer per the dialog rule; `useDialogCloseGuard` for the dirty form (Rule #9); unit tests for slug derivation, validation, and image resize. | ✅ Pass |
| **Arch Std #2 (CRD design system)** | New dialog uses shadcn/Tailwind + semantic typography tokens; CRD purity rules enforced (no MUI in `src/crd/`); the swap removes the MUI dependency from the two `crdPages` entry points. | ✅ Pass |
| **Arch Std #3 (i18n)** | New `crd-createSpace` namespace, all six languages edited directly in the same PR (CRD scope, not Crowdin); do-not-translate "Space" per glossary. | ✅ Pass |
| **Arch Std #5 (no barrel exports)** | Explicit file-path imports throughout. | ✅ Pass |
| **Arch Std #6f (DRY)** | Reuses `resizeImageToConstraints`, `useDialogCloseGuard`, `useTemplatePicker`, `TemplateContentPreview`, `TagsInput`, and the `FieldShell`/`FileField` field patterns rather than re-implementing them. | ✅ Pass |

**No violations.** Complexity Tracking section omitted (nothing to justify).

## Project Structure

### Documentation (this feature)

```text
specs/105-create-space-dialog/
├── plan.md              # This file
├── research.md          # Phase 0 — decisions (prototype-vs-MUI, fields, slug, plan, template filter, namespace)
├── data-model.md        # Phase 1 — entities + CRD prop/state shapes (no schema changes)
├── quickstart.md        # Phase 1 — how to build/run/test/preview the dialog
├── contracts/           # Phase 1 — TypeScript prop interfaces
│   ├── createSpaceDialog.ts   # CreateSpaceDialogProps + form value/error/constraint types
│   └── useCreateSpace.ts      # UseCreateSpaceOptions + UseCreateSpaceResult (integration hook)
├── checklists/
│   └── requirements.md  # From /speckit.specify
└── tasks.md             # Phase 2 — created by /speckit.tasks (NOT here)
```

### Source Code (repository root)

```text
src/crd/components/space/                          # EXISTING — pure presentational space components
└── CreateSpaceDialog.tsx                          # NEW — clone of space/settings/CreateSubspaceDialog.tsx with:
                                                   #   template + preview, display name, URL slug (auto-derive), tagline,
                                                   #   markdown description, tags, PAGE BANNER + card banner (avatar→banner),
                                                   #   "Add Tutorials" + required "Accept terms" checkboxes (+ terms dialog),
                                                   #   no-plan message, sticky header/footer, useDialogCloseGuard.
                                                   #   Plain-props (+ MarkdownUploadProps, termsUrl); parent owns state/mutation.

src/crd/i18n/createSpace/                          # NEW namespace 'crd-createSpace'
└── createSpace.en.json (+ .es .nl .bg .de .fr)    # dialog title/subtitle, field labels/hints/placeholders,
                                                   #   validation messages, terms copy, no-plan error, buttons

src/main/crdPages/topLevelPages/createSpace/       # NEW — integration layer (no @mui/*)
├── CrdCreateSpaceDialog.tsx                        # Connector: { open, onClose, accountId, onSpaceCreated? } →
│                                                   #   wraps account StorageConfigContextProvider; renders
│                                                   #   <CreateSpaceDialog {...hook} {...mdCreate} termsUrl /> +
│                                                   #   <TemplatePicker {...picker} /> + overwrite-confirm.
│                                                   #   mdCreate = useMarkdownEditorIntegration({ temporaryLocation: true }).
├── useCreateSpace.ts                               # Hook: form state (incl. description) + yup validation + slug
│                                                   #   derivation + plan selection + image resize + reuse
│                                                   #   useSpaceCreation; post-create navigate/cache/log side-effects.
└── useCreateSpace.test.ts                          # Unit: slug auto-derive/lock, validation, no-plan guard

src/main/crdPages/topLevelPages/userPages/settings/account/CrdUserAccountTab.tsx          # MODIFY: drop MUI CreateSpace import; mount CrdCreateSpaceDialog
src/main/crdPages/topLevelPages/organizationPages/settings/account/CrdOrgAccountTab.tsx    # MODIFY: same swap (passes accountName = org display name)

src/crd/components/templates/TemplateContentPreview.tsx   # MODIFY (R14): bottom padding inside the ScrollArea so the last accordion item isn't clipped (shared fix)

src/main/crdPages/topLevelPages/spaceSettings/subspaces/resizeImageToConstraints.ts        # REUSE (import in useCreateSpace); option to relocate to a shared crdPages util

src/core/i18n/config.ts                            # MODIFY: register 'crd-createSpace' in crdNamespaceImports
@types/i18next.d.ts                                # MODIFY: register namespace types (if applicable)

src/crd/app/pages/CreateSpacePage.tsx              # NEW (P3, optional) — standalone demo with mock data
src/crd/app/CrdApp.tsx                             # MODIFY (P3) — route the demo page
```

**Structure Decision**: Follows the established CRD 3-layer pattern exactly (the Create Subspace precedent). The presentational dialog goes in `src/crd/components/space/` (L0 space domain, account-launched), its integration hook + connector in a new `src/main/crdPages/topLevelPages/createSpace/` folder, and the two account tabs are the only wiring edits. A dedicated `crd-createSpace` i18n namespace keeps the dialog reusable by both account tabs (and any future dashboard launch point) without coupling to the contributor-settings namespace.

## Complexity Tracking

> No Constitution Check violations — section intentionally empty.
