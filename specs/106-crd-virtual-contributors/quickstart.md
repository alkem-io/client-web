# Quickstart: CRD Virtual Contributors Migration

**Feature**: `106-crd-virtual-contributors` | **Branch**: `106-crd-virtual-contributors`

## Prerequisites

- Node ≥ 24, pnpm ≥ 10.17 (`pnpm install`).
- Backend at `localhost:3000` for live data (`pnpm start` serves the app at `localhost:3001`).
- CRD is the default design version. To be explicit / reset a device:
  ```js
  localStorage.setItem('alkemio-design-version', '2'); location.reload();
  ```
- Standalone CRD preview (mock data, no backend): `pnpm crd:dev` → `localhost:5200` — useful for iterating on the wizard/KB/prompt-graph visuals.

## The golden rules (enforced in review)

- **`src/crd/` purity**: no `@mui/*`, `@emotion/*`, `@apollo/client`, `@/domain/*`, `@/core/auth/*`, `react-router-dom`, or `formik` imports; props are plain TS (never generated GraphQL types); all behavior via callback props; icons from `lucide-react`; styling Tailwind via `cn()`; all text via `useTranslation('crd-…')`.
- **`src/main/crdPages/` purity**: no `@mui/*` / `@emotion/*`. This is where GraphQL hooks + mappers live.
- **URLs**: build via `@/main/routing/urlBuilders` only — no inline path templates.
- **No new runtime deps** — including the prompt-graph editor (shadcn Accordion + custom rows, no graph library).
- **React Compiler is on** — do NOT add `useMemo`/`useCallback`/`React.memo`.

## Where things go (mirror the existing VC CRD layout)

| Layer | Path |
|---|---|
| Presentational (pure) | `src/crd/components/virtualContributor/**`, `src/crd/components/common/VirtualContributorBadge.tsx` |
| Integration (hooks/mappers/pages) | `src/main/crdPages/topLevelPages/vcPages/**`, `src/main/crdPages/space/dialogs/**` |
| Routing | `src/main/crdPages/topLevelPages/vcPages/CrdVCRoutes.tsx`, `src/main/routing/TopLevelRoutes.tsx` |
| i18n | `src/crd/i18n/contributorSettings/*` (+ `crd-community`/`crd-common` for badge/add-VC) |

## Build order (each is independently shippable)

1. **Prompt-graph card (US4)** — add `VCPromptGraphCard` + extend `useVcSettingsTabData`/`vcSettingsMapper`. Verify it renders in `/vc/:nameId/settings/settings` only when `promptGraphEditingEnabled` and the user has `Update`. *The other four settings cards are already live — don't touch them.*
2. **VC badge + notifications (US5)** — create `VirtualContributorBadge`; render in `CommentItem` when author is a VC (resolve the comment-author `type` field first; codegen if needed). Verify both VC notification types render in the CRD `NotificationsPanel`.
3. **Add-to-community (US3)** — wire `VirtualContributorInviteConnector` into the CRD community surface; add `VirtualContributorPreview`; confirm legacy MUI invite/browse dialogs are unreachable when CRD is active.
4. **Knowledge Base (US2)** — build `CrdVCKnowledgeBasePage`; repoint the `/vc/:nameId/knowledge-base` route from the MUI route to the CRD page; reuse `useKnowledgeBase` + `CalloutsGroupView`.
5. **Creation wizard (US1)** — build `VCCreationWizardView` + step views + sub-dialogs; relocate `useVirtualContributorWizard` logic into `useVcCreationWizard`; add `buildCreateVirtualContributorUrl`; switch the four CRD launch points from inline dialog → `navigate(...)`.

## Verify

```bash
pnpm lint                 # TS + Biome + ESLint (react-compiler rule)
pnpm vitest run           # mappers + access guards (mirror vcProfileMapper.test.ts / useCanEditVcSettings.test.ts)
```

**Manual (CRD on):**
- Create a VC end-to-end from the CRD dashboard AND from the user/org account tab → no MUI styling at any step (SC-001).
- Open a VC's Knowledge Base from the profile and via deep link `/vc/<id>/knowledge-base` → CRD page, refresh + empty state work (SC-002).
- Add an existing VC to a community from the CRD community surface → search → preview → add/invite; confirm no legacy MUI VC dialog appears (SC-003).
- As a non-admin, confirm refresh/prompt/visibility/prompt-graph controls are hidden (SC-004).
- Flip to legacy design (`'1'`) → all VC screens unchanged (SC-005).

## Gotchas

- **Sticky dialog chrome** for retained dialogs (wizard sub-dialogs, VC picker): `flex flex-col overflow-hidden` + `max-h-[..vh]` on `DialogContent`, `shrink-0` header/footer, `flex-1 min-h-0 overflow-y-auto` body. The wizard/KB are **pages**, not dialogs.
- **Avatar/banner fallback**: use `pickColorFromId(vcId)`; leave `bannerUrl`/`avatarUrl` undefined when absent (deterministic gradient — never stock placeholders).
- **Typography**: use semantic tokens (`text-hero`, `text-page-title`, …) per the migration guide, not raw Tailwind size combos.
- **i18n**: add keys to all six languages (en, es, nl, bg, de, fr) in the same PR (CRD namespaces are hand-maintained, not Crowdin). Keep "Virtual Contributor" English per glossary.
- **CalloutsGroupView in a CRD page** (US2): confirm it renders acceptably under `.crd-root`; add a thin adapter only if needed.
