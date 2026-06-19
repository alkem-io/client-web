# Quickstart: Hiding tabs/phases

> **Implementation layer: CRD.** This feature is built in the CRD design system (`src/crd/`) and its
> integration layer (`src/main/crdPages/`), NOT the legacy MUI InnovationFlow editor. The admin
> affordance lives in the CRD Space-Settings Layout column kebab (`LayoutPoolColumn`) + the CRD
> `ConfirmationDialog`; member-facing filtering lives in `useCrdSubspace` / `useCrdSpaceTabs` via the
> shared `filterVisibleStates` selector. See `plan.md` → Source Code for the file map. (The behavioral
> UI/GraphQL contracts in `contracts/` remain accurate; only their file-path hints predate the CRD rework.)

## What this feature does

Space/subspace admins can hide a phase/tab (innovation-flow state) from the member-facing UI.
Hiding is UI-only — content stays reachable by direct URL. Admins still see and can unhide all
phases.

## Try it (manual)

Prereq: a space where you hold admin (Update) rights, and a backend exposing
`InnovationFlowStateSettings.visible` (see external dependency). Seed CRD/MUI surface via
`localStorage('alkemio-design-version')` if you want to verify a specific design version.

1. `pnpm install`
2. `pnpm start` (dev server on `localhost:3001`, backend on `localhost:3000`)
3. Open **Space settings > Layout** (or a subspace's **Manage innovation flow**).
4. On any phase card, open the per-phase **menu** → **Hide**.
5. Confirm in the dialog — note it states the hide is UI-only and content stays reachable by URL.
6. As a non-admin member, reload the space: the phase is gone from phase navigation.
7. Open the hidden phase's direct URL as that member: the content still loads.
8. Back as admin, open the phase menu → **Show** to restore it (no confirmation needed).

## Where the code lives

- Menu item: `src/domain/collaboration/InnovationFlow/InnovationFlowDragNDropEditor/InnovationFlowStateMenu.tsx`
- Confirmation + indicator: `.../InnovationFlowDragNDropEditor.tsx`
- Domain action: `.../InnovationFlowDialogs/useInnovationFlowSettings.tsx` (`toggleStateVisibility`)
- Member filter: `.../InnovationFlow/utils/filterVisibleStates.ts`, applied in
  `src/domain/space/layout/SubspacePageLayout.tsx` and the tabbed-layout state source.
- GraphQL: `.../InnovationFlow/graphql/InnovationFlowStates.fragment.graphql`,
  `.../graphql/UpdateInnovationFlowStates.graphql`
- Copy: `src/core/i18n/en/translation.en.json` (`components.innovationFlowSettings.stateEditor.*`)

## Run the gates

```bash
pnpm vitest run        # unit tests (includes filterVisibleStates.test.ts)
pnpm build             # production build
pnpm lint              # TypeScript + Biome + ESLint
```

## Graceful degradation

If the backend does not expose `settings.visible`, the Hide/Show menu item is not rendered and
members see all phases (current behavior). When the server field ships, run `pnpm codegen`
against a live backend and commit regenerated `apollo-hooks.ts` / `graphql-schema.ts`.
