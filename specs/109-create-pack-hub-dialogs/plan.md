# Implementation Plan: CRD Create Innovation Pack & Innovation Hub Dialogs

**Branch**: `109-create-pack-hub-dialogs` | **Date**: 2026-06-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/109-create-pack-hub-dialogs/spec.md`

> **Rewrite note (2026-06-15):** This plan supersedes the first draft. The Clarifications session locked in **strict MUI parity** — description **required** and rendered as a **markdown editor**, name **3–128** via a shared validator, and **no post-create navigation**. Those answers reverse the earlier R1/R2/R3 refinements: the existing CRD pack create dialog (plain textarea, name-only validation, navigate-to-settings) **must be modified, not reused as-is**, and both dialogs now need the markdown-editor + account-storage-context plumbing the CRD Create Space dialog uses.

## Summary

Replace the two MUI creation dialogs the CRD account tabs still mount — **Create Innovation Pack** and **Create Innovation Hub** — with CRD-native dialogs at strict field/validation/behavior parity with the legacy MUI forms, removing the last `@mui/*` dependency the account tabs carry.

Both dialogs follow the **CRD Create Space / Create Subspace pattern**: a pure presentational dialog in `src/crd/` (controlled `value`/`onChange`/`errors`/`onCreate`, sticky header/footer, **markdown description via the CRD `MarkdownEditor`**), and an integration **connector** in `src/main/crdPages/` that mounts `StorageConfigContextProvider` (account-scoped, `temporaryLocation` uploads before the resource exists) + a local Suspense boundary, wires `useMarkdownEditorIntegration`, runs **yup-on-submit validation** (reusing the `useCreateSubspace`/`useCreateSpace` idiom — `SMALL_TEXT_LENGTH`/`MARKDOWN_TEXT_LENGTH`, `t('validation.*')` mapping), calls the create hook, and on success **closes + refetches + toasts (no navigation)**.

Work breakdown:

- **Innovation Pack — modify the existing CRD assets.** `src/crd/components/innovationPack/CreateInnovationPackDialog.tsx` exists but uses a plain `<Textarea>` and validates only a non-blank name; change it to a **markdown editor + required description + 3–128 name** error rendering. Add a **connector** (`CrdCreateInnovationPackDialog`) providing storage context + markdown integration + validation. **Leave `useCreateInnovationPack`'s signature unchanged** — it is still consumed by the legacy MUI `ContributorAccountView`, so the new connector passes an `onCreated` that ignores `url` and **does not navigate** (strict parity), rather than the hook being simplified.
- **Innovation Hub — build new from the subspace/pack template.** New pure dialog (`CreateInnovationHubDialog`, four fields, markdown description), new connector (`CrdCreateInnovationHubDialog`), new `useCreateInnovationHub` hook (fixed `type: List`, empty `spaceListFilter`, refetch, no navigation).
- **Wire both account tabs** (user + org) to mount the two connectors and delete the MUI imports.
- **i18n**: verify/extend `crd-templates` `createPack.*` and add `crd-innovationHub` `createHub.*` across all six languages, including markdown-editor and validation labels.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19 (React Compiler enabled — no manual `useMemo`/`useCallback`/`React.memo`)
**Primary Dependencies**: Apollo Client (generated hooks only); shadcn/ui + Tailwind v4 + Radix UI (`@/crd/primitives/*`); CRD `MarkdownEditor` (`@/crd/forms/markdown/MarkdownEditor`); `yup` (on-submit validation, matching the CRD create-flow precedent); `lucide-react`; `react-i18next`. **No new runtime dependencies.**
**Storage**: N/A backend. Markdown-image uploads go through the existing `uploadFileOnStorageBucket` mutation via `useMarkdownEditorIntegration`, into the account-scoped bucket with `temporaryLocation: true` (cleaned up server-side if the form is abandoned). Resource creation via existing `createInnovationPack` / `createInnovationHub`.
**Testing**: Vitest + jsdom. Unit tests for the new hub hook (variables/validation) and the hub validation schema; existing pack mapper tests stay green.
**Target Platform**: Web SPA (Vite), CRD route tree (design version `2`).
**Project Type**: Web (single SPA); CRD presentational layer + `crdPages` integration layer.
**Performance Goals**: No regressions; dialogs lazy-load their i18n namespace + the markdown editor behind a local Suspense boundary (so first-load suspension doesn't remount the host account tab).
**Constraints**: `src/crd/**` — zero `@mui/*`/`@emotion/*`, zero business-logic imports, props-only, Tailwind-only, WCAG 2.1 AA. `src/main/crdPages/**` — no `@mui/*`. Generated GraphQL hooks only. No `__typename` discrimination. i18n key parity across en/nl/es/bg/de/fr in the same PR. Discard-on-close guard (`useDialogCloseGuard`) required because the dialogs now hold authored markdown content.
**Scale/Scope**: 2 dialogs × 2 account-tab entry points. ~1 modified CRD component + 1 new CRD component + 2 new connectors + 2 hooks (1 modified, 1 new) + 1 new validation schema/types + i18n (2 namespaces × 6 langs) + standalone previews.

**No NEEDS CLARIFICATION** — the three open questions were resolved to strict MUI parity in the Clarifications session (2026-06-15).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Domain-Driven Frontend Boundaries** — PASS. Presentational dialogs in `src/crd/`; GraphQL/account/storage/validation orchestration in `src/main/crdPages/` connectors + hooks; no business logic in components.
- **II. React 19 Concurrent UX Discipline** — PASS. Creation runs through `useTransition`; markdown editor + i18n namespace lazy-load behind a local Suspense boundary with `null` fallback (modal). Explicit disabled/`aria-busy` states. No manual memoization.
- **III. GraphQL Contract Fidelity** — PASS. Reuses generated `useCreateInnovationPackMutation` / `useCreateInnovationHubMutation` / `useUploadFileMutation`. **No schema change → no `pnpm codegen`.** Component props are plain TS, never generated types.
- **IV. State & Side-Effect Isolation** — PASS. Mutation/cache/upload/validation effects confined to connectors + hooks; components hold only controlled-input visual state.
- **V. Experience Quality & Safeguards** — PASS. WCAG 2.1 AA (labeled inputs, `aria-invalid`/`aria-describedby`, `aria-busy`, sticky reachable footer); discard-guard protects authored markdown; unit tests for the hub hook + validation.

**Architecture Standards** — PASS. CRD-only for new UI (Standard #2); MUI dialogs untouched, left for legacy surfaces; new strings in CRD per-feature namespaces with six-language parity (Standard #3); explicit imports, no barrels (Standard #5); SRP/DRY honored by reusing the subspace/space create pattern + validation idiom and the shared markdown integration (Standard #6). The change *removes* `@mui/*` from `crdPages`, never adds it.

**Result: PASS — no violations; Complexity Tracking not required.**

## Project Structure

### Documentation (this feature)

```text
specs/109-create-pack-hub-dialogs/
├── plan.md              # This file (rewritten for strict parity)
├── research.md          # Phase 0 — decisions (R1–R9, revised)
├── data-model.md        # Phase 1 — value/error shapes + validation rules
├── quickstart.md        # Phase 1 — build/verify
├── contracts/
│   ├── create-innovation-pack.ts
│   └── create-innovation-hub.ts
└── checklists/requirements.md
```

### Source Code (repository root)

```text
# Innovation Pack — MODIFY existing CRD assets + add a connector
src/crd/components/innovationPack/
├── CreateInnovationPackDialog.tsx     # MODIFY — Textarea → MarkdownEditor; render description-required + name(3–128) errors; accept MarkdownUploadProps
└── types.ts                           # MODIFY — CreateInnovationPackValues unchanged; props gain MarkdownUploadProps + richer errors
src/main/crdPages/innovationPack/
├── CrdCreateInnovationPackDialog.tsx  # NEW — connector: StorageConfigContextProvider + Suspense + markdown integration + validation + discard guard
└── useCreateInnovationPack.ts         # UNCHANGED — signature kept (legacy MUI ContributorAccountView still consumes it); CRD connector ignores url + doesn't navigate

# Innovation Hub — NEW (mirror the subspace/pack pattern)
src/crd/components/innovationHub/
├── CreateInnovationHubDialog.tsx      # NEW — pure dialog: subdomain + name + tagline + markdown description
└── createInnovationHub.types.ts       # NEW — CreateInnovationHubValues/Errors/Props
src/main/crdPages/innovationHub/
├── CrdCreateInnovationHubDialog.tsx   # NEW — connector (storage context + markdown + validation + discard guard)
├── useCreateInnovationHub.ts          # NEW — createInnovationHub mutation (type:List, []), refetch, onCreated; no navigation
├── createInnovationHubSchema.ts       # NEW — yup schema (subdomain/name/tagline/description) + t('validation.*') mapping
└── __tests__/useCreateInnovationHub.test.ts   # NEW — variables + validation + no-accountId reject

# Entry points — EDIT both tabs (mount connectors, delete MUI imports)
src/main/crdPages/topLevelPages/userPages/settings/account/CrdUserAccountTab.tsx
src/main/crdPages/topLevelPages/organizationPages/settings/account/CrdOrgAccountTab.tsx

# i18n — pack keys EXIST (extend for markdown/validation); hub keys NEW
src/crd/i18n/templates/templates.<lang>.json          # verify/extend createPack.* (+ validation.*) ×6
src/crd/i18n/innovationHub/innovationHub.<lang>.json   # ADD createHub.* (+ validation.*) ×6

# Standalone preview
src/crd/app/...                                        # preview entries for both dialogs (mock markdown props)
```

**Structure Decision**: Adopt the **Create Subspace / Create Space connector pattern** for both dialogs — pure CRD dialog (markdown description) + a `crdPages` connector that owns storage context, markdown-image integration, yup-on-submit validation (reusing the existing `useCreate*` idiom and shared length constants), the create hook, the discard-close guard, and the close+refetch+toast success path (no navigation). The account tabs mount the two connectors. The MUI dialogs and their `src/domain/**` homes stay for legacy surfaces; only the two `crdPages` mount points (and their MUI imports) are removed.

## Complexity Tracking

> No Constitution Check violations — section intentionally empty.
