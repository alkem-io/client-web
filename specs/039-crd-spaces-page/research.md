# Research: CRD Spaces Page Migration

**Branch**: `039-crd-spaces-page` | **Date**: 2026-03-26

## R1: Route Wiring Strategy (No Runtime Toggle)

**Decision**: Direct route wiring — `SpaceExplorerPage.tsx` imports the CRD view instead of the MUI view. No runtime toggle mechanism.

**Rationale** (updated per spec clarification):
- Migration is a code-level decision per route, not a runtime switch
- `SpaceExplorerPage.tsx` simply swaps the view import: `SpaceExplorerCrdView` replaces `SpaceExplorerView`
- The data hook (`useSpaceExplorer`) and layout wrapper (`TopLevelPageLayout`) remain unchanged
- No new Context provider, no localStorage, no URL params needed
- Future page migrations follow the same pattern: swap the view import in the page component

**Original research** (superseded): Initially researched React Context + `usePersistedState` for a runtime toggle. This was rejected during spec clarification — the user specified that routes are simply wired to CRD or MUI at the code level, with no runtime switching.

## R2: Tailwind CSS / Build Infrastructure Status

**Decision**: Install `@tailwindcss/vite` + `tailwindcss` v4.1.12 and add Vite plugin

**Current state**:
- CSS files ready: `src/crd/styles/theme.css` (design tokens) and `src/crd/styles/crd.css` (Tailwind entry with `@import 'tailwindcss'`)
- `cn()` utility ready: `src/crd/lib/utils.ts`
- Path alias `@/crd` works via existing `@/*` → `src/*` mapping
- CSS isolation via `.crd-root` scoping in `crd.css` — Tailwind resets only apply inside `.crd-root` wrapper, won't break MUI
- `clsx` (v2.1.1) and `tailwind-merge` (v3.5.0) already installed

**Missing (must install)**:
- `@tailwindcss/vite` — Vite plugin for CSS processing
- `tailwindcss` — core library
- `class-variance-authority` — component variant definitions (used by all shadcn primitives)
- `lucide-react` — icon library replacing `@mui/icons-material`
- Radix UI packages: `@radix-ui/react-slot`, `@radix-ui/react-select`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-avatar`

**Vite config change**: Add `tailwindcss()` to plugins array in `vite.config.mjs`

**CSS entry point**: Import `src/crd/styles/crd.css` in `src/index.tsx` or `src/root.tsx`

## R3: Data Shape Mapping (GraphQL → CRD SpaceCardData)

**Decision**: Pure mapper function in `src/main/topLevelPages/topLevelSpaces/` bridging `SpaceWithParent` → `SpaceCardData`

**Direct mappings** (11 fields):
| CRD Field | GraphQL Source |
| --- | --- |
| `id` | `space.id` |
| `name` | `space.about.profile.displayName` |
| `description` | `space.about.profile.tagline` (fallback to description if available) |
| `bannerImageUrl` | `space.about.profile.cardBanner?.uri` |
| `isPrivate` | `!space.about.isContentPublic` |
| `tags` | `space.about.profile.tagset?.tags ?? []` |
| `href` | `space.about.profile.url` |
| `leads` | Flatten `leadUsers` (type='person') + `leadOrganizations` (type='org') |
| `parent.name` | `space.parent?.about.profile.displayName` |
| `parent.href` | `space.parent?.about.profile.url` |
| `parent.avatarUrl` | `space.parent?.about.profile.avatar?.uri` |

**Derived fields** (need computation):
| CRD Field | Derivation |
| --- | --- |
| `initials` | First letter(s) of `displayName` words |
| `avatarColor` | Deterministic color from space ID hash (pick from a fixed palette) |
| `parent.initials` | Same logic from parent displayName |
| `parent.avatarColor` | Same logic from parent ID hash |

**Missing from current GraphQL**:
| CRD Field | Status | Resolution |
| --- | --- | --- |
| `memberCount` | Not in `SpaceExplorerSpace` fragment | Drop from initial CRD card or add to fragment in a follow-up |

**Rationale for dropping `slug`**: The prototype uses `slug` for routing (`/space/${slug}`). Production uses full URLs from `profile.url`. The CRD card receives `href` (the full URL) instead of constructing routes from slugs.

## R4: Primitives Required from Prototype

**Decision**: Port 6 primitives + cn() utility from `prototype/src/app/components/ui/` to `src/crd/primitives/`

| Primitive | Lines | Sub-components | Radix Package |
| --- | --- | --- | --- |
| `button.tsx` | 57 | Button, buttonVariants | `@radix-ui/react-slot` |
| `input.tsx` | 21 | Input | none |
| `badge.tsx` | 46 | Badge, badgeVariants | `@radix-ui/react-slot` |
| `select.tsx` | 189 | Select + 9 sub-components | `@radix-ui/react-select` |
| `dropdown-menu.tsx` | 257 | DropdownMenu + 14 sub-components | `@radix-ui/react-dropdown-menu` |
| `avatar.tsx` | 53 | Avatar, AvatarImage, AvatarFallback | `@radix-ui/react-avatar` |

**Also needed but not a primitive**:
- `skeleton.tsx` — for loading states (port from prototype if available, or create)

**Porting process**: Copy from prototype, update imports to use `@/crd/lib/utils` for `cn()`, verify zero MUI imports, commit.

## R5: Constitution Compliance

**One known tension**: Architecture Standard #2 states "Styling standardizes on MUI theming." The CRD migration intentionally introduces Tailwind CSS as a parallel styling system. This is justified because:
- The entire purpose of CRD is to replace MUI with shadcn/ui + Tailwind
- Both systems coexist during migration (MUI for unmigrated pages, Tailwind for CRD pages)
- CSS isolation via `.crd-root` scoping prevents conflicts
- MUI theming remains authoritative for all existing pages until they are individually migrated

This should be tracked as a justified violation in the plan's Complexity Tracking section, with a note that Architecture Standard #2 will need a constitution amendment once the migration is substantially complete.
