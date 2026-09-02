# MUI → CRD Migration — COMPLETED (story #9885)

> **Historical note.** This was the guide for migrating pages off MUI onto CRD
> (Client Re-Design — shadcn/ui + Tailwind CSS + Radix UI). **That migration is
> done.** MUI and Emotion were fully removed in story #9885 (epic #1888): the
> `@mui/*` and `@emotion/*` packages are uninstalled, no source file imports them,
> the legacy `src/core/ui/` MUI design system was removed (its surviving files were
> de-MUI'd in place — `src/core/ui/` remains as MUI-free shared modules, not deleted
> outright) and the `designVersion` toggle was deleted, and CRD is the sole design
> system. There is no MUI/CRD coexistence and
> no per-route toggle — every route renders its CRD page.
>
> There is nothing left to migrate. Build new client-facing features directly in
> CRD; never reintroduce `@mui/*` or `@emotion/*`. The final removal state is
> recorded in
> [`specs/111-remove-mui-library/mui-footprint-baseline.md`](../../specs/111-remove-mui-library/mui-footprint-baseline.md)
> and
> [`specs/111-remove-mui-library/mui-removal-inventory.md`](../../specs/111-remove-mui-library/mui-removal-inventory.md).

## Where the conventions live now

The architecture, layering rules, and patterns that this guide used to teach are
the everyday conventions of the codebase — read them in:

- **`src/crd/CLAUDE.md`** — the CRD design-system golden rules (no business logic,
  props-only, Tailwind-only, plain-TS props, accessibility), the i18n namespace
  model, semantic typography tokens, the Tailwind conversion reference, deterministic
  accent colours (`pickColorFromId`), the Share dialog / slot pattern, and the
  per-component checklist.
- **`CLAUDE.md`** (repo root) — the three-layer model (CRD presentational →
  `src/main/crdPages/` integration → route wiring), the URL-builder rule
  (`@/main/routing/urlBuilders`), and the CSS strategy.
- **`docs/crd/markdown-editor.md`** — the markdown editor + image-upload wiring.
- **`docs/i18n.md`** / **`docs/crd/translations.md`** — translation management.

## The model, in one paragraph

A CRD page has three layers. **CRD components** (`src/crd/`) are pure
presentational: data in via plain-TS props, behaviour in via callback props,
Tailwind for styling, `lucide-react` for icons, `useTranslation('crd-<feature>')`
for labels — no GraphQL, routing, auth, or app knowledge. The **integration layer**
(`src/main/crdPages/<page>/`) calls data hooks and maps GraphQL types to CRD props
via a data mapper. **Route wiring** (`TopLevelRoutes.tsx`) connects the URL to the
page, wrapped in `CrdLayoutWrapper` for the CRD shell. Global dialogs
(notifications, messaging) live at `root.tsx` level and work on every page.
