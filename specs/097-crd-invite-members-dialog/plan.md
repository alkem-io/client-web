# Implementation Plan: CRD Invite Members Dialog

**Branch**: `097-crd-invite-members-dialog` | **Date**: 2026-05-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/097-crd-invite-members-dialog/spec.md`

## Summary

Migrate the User-flow of the legacy MUI `InviteContributorsDialog` to the CRD design system so that CRD-rendered space pages no longer leak MUI chrome. The presentational dialog lives under `src/crd/components/community/InviteMembersDialog.tsx`, the contributor input is a new `src/crd/forms/ContributorSelector.tsx` (a sibling of `UserSelector` that accepts a `User | Email` discriminated union), the role picker is a Popover + Checkbox group built from existing CRD primitives, and an integration connector under `src/main/crdPages/space/dialogs/InviteMembersDialogConnector.tsx` reuses the existing Apollo hooks (`useInviteUsersDialogQuery`, `useRoleSetApplicationsAndInvitations`) and the existing `emailParser`/`useContributors` modules from the legacy domain. A new `crd-community` i18n namespace holds all six language files. The legacy MUI dialog stays in place for the deferred VC flow.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Node ≥ 22 (Volta-pinned 24.14.0)
**Primary Dependencies**: shadcn/ui + Tailwind v4 (CRD layer), Radix UI primitives (`Dialog`, `Popover`, `Checkbox`), `lucide-react` icons; Apollo Client + existing domain hooks (integration layer only); `react-i18next`
**Storage**: N/A — server-side via the existing `inviteContributorsOnRoleSet` mutation, no client-side persistence
**Testing**: Vitest (jsdom). Component tests for `ContributorSelector` (chip add/remove, email parser integration boundary, validation error rendering) and `InviteMembersDialog` (view switching form ↔ result, Send disabled rules, focus trap on open). Integration tests for the connector are out of scope — the connector only wires hooks already covered by the legacy domain tests.
**Target Platform**: Web (Chrome ≥ recent, Firefox, Safari) under React 19 with React Compiler enabled. Mobile + desktop layouts.
**Project Type**: Web (single SPA — Vite-served). Three-layer split: presentational (`src/crd/`) + integration (`src/main/crdPages/`) + reused domain hooks (`src/domain/`).
**Performance Goals**: Dialog open ≤ 100 ms after click on a warm cache; autocomplete response ≤ 300 ms after debounced keystroke (existing `useContributors` debounce is 300 ms — preserved); chip add ≤ 16 ms (1 frame).
**Constraints**: Zero MUI imports under `src/crd/`. Zero direct Apollo imports under `src/crd/`. All six languages updated in the same PR. Legacy MUI `InviteContributorsDialog` stays intact for VC + non-CRD callsites.
**Scale/Scope**: One presentational dialog (~200 LoC), one new form (`ContributorSelector` ~180 LoC), one connector (~150 LoC), six new translation files (en source + 5 AI-translated mirrors), two CRD page edits (`CrdSpaceCommunityPage.tsx`, `CrdSpaceSettingsPage.tsx`). Estimated ≤ 800 lines of code added net of i18n.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| **I. Domain-Driven Frontend Boundaries** | PASS | Business rules (role validation, email parsing, mutation orchestration) stay in `src/domain/community/inviteContributors/` (existing); the connector under `src/main/crdPages/space/dialogs/` orchestrates the existing domain façade and never re-implements rules. CRD presentational layer is rule-free. |
| **II. React 19 Concurrent UX Discipline** | PASS | The connector uses `useTransition` for the Send mutation so the form stays responsive while the request is in flight (Send button shows `aria-busy`, not a blocking spinner). No legacy lifecycle methods. View switching (form ↔ result) is plain state — no async-in-render. |
| **III. GraphQL Contract Fidelity** | PASS | No new GraphQL operations introduced. Reuses existing generated hooks `useInviteUsersDialogQuery` and `inviteContributorsOnRoleSet` from `src/domain/access/ApplicationsAndInvitations/`. No raw `useQuery`. |
| **IV. State & Side-Effect Isolation** | PASS | All state lives in either the connector (Apollo cache, formik-equivalent local React state for the working batch) or the presentational dialog (visual state only — current view, popover open). Email parser and user search are existing `src/domain/` modules. |
| **V. Experience Quality & Safeguards** | PASS | Spec FR-012 enumerates WCAG 2.1 AA requirements; tasks include accessibility verification. All six languages updated per i18n constitution rule. |
| **Architecture Standards #2 (CRD design system)** | PASS | New dialog uses CRD layer exclusively. Migration is the entire point of the spec. |
| **Architecture Standards #3 (i18n)** | PASS | Only English source files edited directly under `src/crd/i18n/community/`. CRD translations are managed manually per `src/crd/CLAUDE.md` § i18n; the constitution's Crowdin rule applies only to `src/core/i18n/`, not CRD. |
| **Architecture Standards #5 (no barrel exports)** | PASS | All new files imported via explicit paths. |
| **Architecture Standards #6 (SOLID)** | PASS | SRP: `ContributorSelector` (input UI) split from `RoleMultiSelect` (role UI) split from `InviteMembersDialog` (composition + view switch) split from `InviteMembersDialogConnector` (data wiring). DIP: dialog depends on prop-injected handlers, never on Apollo. ISP: `ContributorSelector` props are only what an invitee picker needs (no role/message concerns). |

**No violations.** Complexity Tracking section deliberately omitted.

## Project Structure

### Documentation (this feature)

```text
specs/097-crd-invite-members-dialog/
├── plan.md              # This file
├── research.md          # Phase 0 output (decisions on selector reuse, role picker, namespace)
├── data-model.md        # Phase 1 output (Invitee, InvitationBatch, InvitationResult shapes)
├── quickstart.md        # Phase 1 output (how to manually verify the dialog)
├── contracts/
│   └── crd-invite-members-dialog.ts  # TypeScript prop contracts for the new components
├── checklists/
│   └── requirements.md  # Spec quality checklist (already created)
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/crd/
├── components/community/
│   └── InviteMembersDialog.tsx           # NEW — presentational dialog (form view + result view)
├── forms/
│   ├── ContributorSelector.tsx           # NEW — sibling of UserSelector that takes Invitee = User | Email
│   └── RoleMultiSelect.tsx               # NEW — Popover + Checkbox group; Member is fixed/disabled
└── i18n/community/
    ├── community.en.json                 # NEW — English source
    ├── community.nl.json                 # NEW — Dutch
    ├── community.es.json                 # NEW — Spanish
    ├── community.bg.json                 # NEW — Bulgarian
    ├── community.de.json                 # NEW — German
    └── community.fr.json                 # NEW — French

src/main/crdPages/space/
├── dialogs/
│   └── InviteMembersDialogConnector.tsx  # NEW — Apollo + emailParser + useContributors wiring
├── tabs/
│   └── CrdSpaceCommunityPage.tsx         # EDIT — replace `InviteContributorsDialog` import
└── ../topLevelPages/spaceSettings/
    └── CrdSpaceSettingsPage.tsx          # EDIT — replace `InviteContributorsDialog` import

src/core/i18n/
└── config.ts                             # EDIT — register `crd-community` in `crdNamespaceImports`

# Untouched (intentionally) — legacy MUI dialog stays for VC + non-CRD callsites:
src/domain/community/inviteContributors/
├── InviteContributorsDialog.tsx          # UNCHANGED — still routes by ActorType
├── users/InviteUsersDialog.tsx           # UNCHANGED — used only by non-CRD callsites going forward
├── virtualContributors/InviteVCsDialog.tsx  # UNCHANGED — VC flow deferred
└── components/FormikContributorsSelectorField/
    ├── emailParser.ts                    # REUSED from connector
    └── useContributors.ts                # REUSED from connector
```

**Structure Decision**: Three-layer CRD-migration structure — presentational components under `src/crd/` (no MUI, no Apollo), integration connector under `src/main/crdPages/space/dialogs/` (composes presentational + existing domain hooks), and the legacy domain layer stays untouched and continues to serve the deferred VC flow.

## Phase 0: Outline & Research

See [research.md](research.md) for the five focus decisions called out in user input. Summary:

| Decision | Outcome |
|---|---|
| Reuse `UserSelector` vs build `ContributorSelector` | **Build sibling.** UserSelector's `ShareUser[]` model can't accommodate email-only invitees without a breaking API change; sibling keeps both components focused (SRP). |
| Role picker primitive | **Popover + Checkbox group** (`RoleMultiSelect`). CRD has no `MultiSelect` primitive today; a Popover + Checkbox group is the smallest composition that handles "Member fixed + Lead/Admin optional" with proper a11y. |
| Connector location | **`src/main/crdPages/space/dialogs/InviteMembersDialogConnector.tsx`** — alongside existing `CrdSpaceAboutDialogConnector` and `CrdSpaceCommunityDialogConnector`. Same pattern. |
| Result view rendering | **Same dialog, internal view state.** `useState<'form' \| 'result'>('form')`. The Radix Dialog stays mounted; only the body and footer swap. Reset to `'form'` on close. |
| i18n namespace | **New `crd-community`.** The dialog opens from two namespaces (`crd-space` Community tab + `crd-spaceSettings` settings tab); duplicating strings into either is wrong. `crd-community` is the natural home and matches existing per-feature namespace pattern. |

## Phase 1: Design & Contracts

### Data model

See [data-model.md](data-model.md). Three view-model entities live entirely in the CRD/connector layer; nothing maps to a new GraphQL type:

- `Invitee` — discriminated union `{ kind: 'user', userId, displayName, avatarUrl?, location? } | { kind: 'email', email, validationError? }`. The connector builds these from autocomplete picks and email-parser output.
- `InvitationBatch` — `{ contributors: Invitee[], welcomeMessage: string, extraRoles: Role[] }`. The connector derives the mutation variables from this.
- `InvitationResult` — `{ invitee: Invitee, outcome: 'sent' | 'alreadyMember' | 'error', errorMessage?: string }`. One per invitee in the post-Send view.

### API contracts

See [contracts/crd-invite-members-dialog.ts](contracts/crd-invite-members-dialog.ts) for the TypeScript prop contracts. Three components:

1. `InviteMembersDialog` — props are pure data + handlers. No Apollo, no Formik, no domain types.
2. `ContributorSelector` — extends the `UserSelector` UX with `Invitee` union and `onAddEmail` handler.
3. `RoleMultiSelect` — Popover trigger + Checkbox list; `lockedRoles` (always selected, disabled) + `optionalRoles`.

The connector's external surface is just the prop boundary of `InviteMembersDialog` plus the Apollo mutations it triggers. No GraphQL contracts change.

### Quickstart

See [quickstart.md](quickstart.md) — manual verification steps for each user story, including the `localStorage.setItem('alkemio-design-version', '2')` toggle to render the CRD pages.

### Agent context update

The repository has no `update-agent-context.sh` automation that targets this CRD layer specifically (CRD rules live in `src/crd/CLAUDE.md` and the existing CRD page guidance is sufficient). The plan does not introduce new top-level technologies (React 19 + CRD + Radix + Tailwind already established). No agent context update needed for this feature.

## Re-evaluation (post-Phase 1 design)

| Principle | Status | Notes |
|---|---|---|
| All five (I–V) | PASS | Phase 1 design preserves the layering (presentational/connector/domain), keeps Apollo out of `src/crd/`, and surfaces every behavioural decision (view switching, role lock, email validation) as either a pure prop or a connector-owned hook. No new constitution risks. |
