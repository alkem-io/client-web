# Quickstart: Innovation Hub UI (story #9910)

## Run the app

```bash
pnpm install
pnpm start          # localhost:3001, expects backend at localhost:3000
```

Navigate to an Innovation Hub home (`/hub/<slug>`, or a hub subdomain). The Spaces
section should show compact cards, a search box (when the hub has Spaces), a
"Showing N Spaces" counter, and a "Load more" button when the hub has > 12 Spaces.

## Standalone CRD preview (no backend)

```bash
pnpm crd:dev        # localhost:5200
```

The CRD design-system preview renders components with mock data — useful for
iterating on `HubSpacesSection` visually without the platform backend.

## Local exit gates (must all pass before PR)

```bash
pnpm vitest run     # unit/integration tests (incl. new HubSpacesSection.test.tsx)
pnpm build          # production build
pnpm lint           # TypeScript + Biome + ESLint
```

## Verify forbidden imports stayed out of src/crd

```bash
# Should print nothing:
grep -REn "@mui/|@emotion/|@apollo/client|@/core/apollo|@/domain/|react-router-dom|formik" \
  src/crd/components/innovationHub/HubSpacesSection.tsx \
  src/crd/components/innovationHub/InnovationHubHome.tsx
```

## Manual acceptance checks

1. Hub with > 12 Spaces → only 12 cards + "Load more"; click reveals more.
2. Type part of a Space name → grid narrows; counter updates; batch resets.
3. Clear search → full list returns.
4. Search with no match → "no results" empty state + Clear search.
5. List hub → curated order preserved; visibility hub → only that visibility.
6. Keyboard-only: tab to search, type, tab to "Load more", activate with Enter/Space.
