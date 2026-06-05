# Quickstart: About Dialog Redesign (Prototype → CRD)

## What this feature is

A visual re-skin of the **existing** CRD Space About dialog to match the updated prototype
(`prototype/src/app/components/space/AboutThisSpaceDialog.tsx`), preserving all current behavior.
The dialog is shared by the L0 `/about` route, the subspace `/about` route, and the sidebar
"About this Space" trigger — all three render `SpaceAboutDialog` → `SpaceAboutView`.

## Files you'll touch

| File | Change |
|---|---|
| `src/crd/components/space/SpaceAboutView.tsx` | **Primary** — rebuild body layout (space-info panel, Why/Who cards, References tiles, Hosted-by card) to match the prototype, using Tailwind + design tokens. |
| `src/crd/components/space/SpaceAboutDialog.tsx` | Header: visible title = space name, tagline beneath; keep sticky-header/scroll-body shell and `lockTooltipSlot`. |
| `src/crd/components/space/CommunityGuidelinesBlock.tsx` | Reused as the guidelines slot; align header styling only (read-more already works). |
| `src/crd/i18n/space/space.en.json` (+ `nl/es/bg/de/fr`) | Add any new edit/tooltip labels; keep all 6 files key-identical. |
| `src/main/crdPages/space/about/CrdSpaceAbout.tsx` | Only if the panel needs a new optional prop (e.g. `onEditProfile`). |
| `src/main/crdPages/subspace/about/CrdSubspaceAbout.tsx` | Mirror any `CrdSpaceAbout` prop change. |
| `src/crd/app/pages/SpacePage.tsx` | Ensure the standalone preview still passes valid mock props. |

> Do **not** touch `src/domain/space/about/*` — that's the legacy MUI dialog (untouched, still default until the toggle is removed).

## Reference the prototype

Open `prototype/src/app/components/space/AboutThisSpaceDialog.tsx` for the target layout. Remember:
- Replace the prototype's mock data with the existing props.
- Convert inline styles / literal colors to Tailwind + design tokens (CRD CLAUDE.md conversion table).
- Replace raw type classes with semantic typography tokens (`text-section-title`, `text-body`, etc.).
- Add `t()` for every label; icons from `lucide-react`; `aria-label` on icon-only buttons.
- The prototype's standalone "Contact Host" message-compose dialog is **out of scope** — keep the existing contact-host link affordance.

## Run & verify

```bash
# Standalone CRD preview (no backend) — fastest loop for visual parity
pnpm crd:dev          # http://localhost:5200 → Space page → open About

# Full app — verify functional parity (apply flow, edit nav, lock, both entry points)
pnpm start            # localhost:3001 (needs backend at :3000)

# Gates (run before staging)
pnpm lint             # TS + Biome + ESLint (incl. react-compiler) — must be clean
pnpm vitest run src/crd/i18n/space/space.parity.test.ts --reporter=basic  # i18n key parity
pnpm vitest run       # full suite
```

## Acceptance walk-through (maps to spec)

1. **Open from sidebar and `/about`** → identical dialog (FR-010, SC-003).
2. **Header** shows space name + tagline; lock icon present for no-read-access spaces (R2, FR-008).
3. **Space-info panel** shows description (rich text), location, member count, leads (FR-001/FR-002).
4. **Non-member** sees apply/join → existing flow; **member** sees member indication, no apply (FR-003/FR-004).
5. **Admin** sees edit pencils → land on the same settings destinations as before (FR-005).
6. **Guidelines** long text → "Read more" opens full text (FR-006).
7. **References** open in a new tab, dialog stays open (FR-007).
8. **Tall content on a short screen** → header/close pinned, body scrolls (FR-009, SC-005).
9. **Sparse space** (missing optional sections) → clean omission, no gaps (FR-011, SC-006).
10. **Keyboard-only** pass: tab to every control, visible focus, reachable close (FR-016).

## Definition of done

- Visual parity with the prototype for all sections (SC-004).
- Zero functional regressions vs. the current dialog (SC-002) across both entry points.
- `pnpm lint` clean, full Vitest suite green (incl. i18n parity), no `@mui/*`/`@emotion/*` in `src/crd/`.
</content>
