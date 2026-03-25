# Alkemio Redesign: Implementation Strategy

> **Source verified**: Production codebase at [alkem-io/client-web](https://github.com/alkem-io/client-web) (GitHub, main branch)

## The Question

We have approved Figma mockups built on shadcn/ui. The dev team is decoupling UI from components. How do we actually swap the design system?

---

## Current Production Stack (Verified from `client-web`)

| Layer | Current | Target |
|-------|---------|--------|
| **UI Library** | MUI v5 (`@mui/material`, `@mui/icons-material`, `@mui/x-data-grid`, `@mui/x-date-pickers`) | shadcn/ui (Radix UI primitives) |
| **Styling** | MUI `createTheme` + `sx` prop + `styled()` | Tailwind CSS v4 + `cn()` utility |
| **Icons** | `@mui/icons-material` (50+ icons used directly) | Lucide React |
| **Forms** | Formik + Yup | React Hook Form + Zod (shadcn default) |
| **Typography** | MUI `Typography` with custom variants (`PageTitle`, `BlockTitle`, `Caption`, etc.) | Tailwind typography utilities |
| **Spacing** | `gutters()` system (10px base, `GUTTER_PX = 10`) | Tailwind spacing scale |
| **Theme** | `RootThemeProvider` → `ThemeProvider` with `createTheme(themeOptions)` | CSS variables in `theme.css` |
| **Colors** | `palette.ts`: primary `#1D384A`, positive `#00D4B4`, negative `#D32F2F`, etc. | Already mapped in prototype's `theme.css` |
| **Fonts** | Montserrat (headings) + Source Sans Pro (body) | Preserve (these are brand fonts) |
| **Build** | Vite + manual chunk splitting (vendor-mui-core, vendor-mui-icons, etc.) | Vite (same, remove MUI chunks) |

### Key Complexity Points (things that make swapping harder)

| # | Issue | Impact | Migration Approach |
|---|-------|--------|--------------------|
| 1 | **Deep MUI `sx` prop usage** — `sx={{ padding: gutters(), color: 'primary.main' }}` everywhere | High — inline theme access in most component files | Replace with Tailwind classes + `cn()` per file |
| 2 | **Custom `gutters()` utility** — returns `n × 10px`, used in ~100+ files | High — spacing breaks if not mapped correctly | Create Tailwind spacing map (see table below) |
| 3 | **`SwapColors` pattern** — `ThemeProvider` wrapper that inverts colors for dark sections | Medium — used in nav bar, footers, accent blocks | Replace with CSS `data-theme="inverted"` class |
| 4 | **16 MUI component overrides** — Button, Dialog, Chip, Paper, etc. in `src/core/ui/themes/default/components/` | Medium — defines Alkemio-specific behavior (no ripple, custom focus) | Bake into shadcn component variants |
| 5 | **Custom Typography components** — `PageTitle`, `BlockTitle`, `Caption`, `CardText`, `Tagline` | Medium — used as imports across all pages | Create Tailwind-based wrappers with same component names |
| 6 | **Formik + Yup coupling** — all forms use Formik | High — shadcn uses React Hook Form + Zod | Migrate separately, after component swap |
| 7 | **`@mui/x-data-grid` & `@mui/x-date-pickers`** | Low — used in limited places (admin, settings) | Replace with TanStack Table + date-fns picker |

#### Gutters → Tailwind Spacing Map

| `gutters()` call | Pixels | Tailwind class | Rem |
|------------------|--------|----------------|-----|
| `gutters(0.5)` | 5px | `p-1.5` (6px) | 0.375rem |
| `gutters(1)` | 10px | `p-2.5` | 0.625rem |
| `gutters(1.5)` | 15px | `p-4` (16px) | 1rem |
| `gutters(2)` | 20px | `p-5` | 1.25rem |
| `gutters(3)` | 30px | `p-8` (32px) | 2rem |
| `gutters(4)` | 40px | `p-10` | 2.5rem |

#### Typography Component Map

| MUI Component | MUI Variant | Font / Size | Tailwind Equivalent |
|---------------|-------------|-------------|---------------------|
| `PageTitle` | `h2` → `<h1>` | Montserrat 18px bold | `font-heading text-lg font-bold` |
| `BlockTitle` | `h3` → `<h2>` | Montserrat 15px regular | `font-heading text-[15px]` |
| `BlockSectionTitle` | `h4` → `<h3>` | Montserrat 12px regular | `font-heading text-xs` |
| `Tagline` | `subtitle1` → `<h4>` | Montserrat 16px italic | `font-heading text-base italic` |
| `Text` | `body1` | Source Sans Pro 14px | `font-body text-sm` |
| `CardText` | `body2` | Source Sans Pro 12px, lightened | `font-body text-xs text-muted-foreground` |
| `Caption` | `caption` | Montserrat 12px | `font-heading text-xs` |
| `CaptionSmall` | `caption` | Montserrat 12px italic | `font-heading text-xs italic` |

---

## Recommended Approach: Staged Swap (Your Plan B, Refined)

Your instinct is right. The "clone → AI swap → evaluate" approach is the lowest-risk starting point. Here's why, and how to sharpen it.

### Phase 1: Proof of Concept (1 page, 2–3 days)

**Don't start with the whole app.** Pick **one representative page** — the **Dashboard** is ideal because it touches cards, layout, navigation, sidebar, and avatars without being the most complex page.

1. **Clone** `client-web` into a feature branch
2. **Install Tailwind CSS v4 + shadcn/ui** alongside MUI (they can coexist — MUI uses Emotion CSS-in-JS, Tailwind uses utility classes, no conflicts)
3. **Swap only Dashboard components**: replace MUI `Box`, `Paper`, `Button`, `Typography`, `Grid` with shadcn `Card`, `Button` + Tailwind classes, using your prototype's [component-inventory.md](../001-alkemio-design-brief/component-inventory.md) as the mapping guide
4. **Apply your design tokens** from the prototype's `theme.css` (you already have these defined — they match production's `palette.ts` values)
5. **Replace `gutters()` calls** in the Dashboard with Tailwind spacing (`gutters(1)` = `p-2.5` at 10px, `gutters(2)` = `p-5`, etc.)
6. **Compare side-by-side** with your Figma mockup

**What you're testing**: Can AI reliably do the MUI→shadcn component swap? How much manual cleanup is needed? What breaks?

### Phase 2: Evaluate & Decide (half day)

After the Dashboard PoC, you, your developer, and Simone sit down and score it:

| Criterion | Score (1-5) |
|-----------|-------------|
| Layout matches Figma mockup | |
| Component rendering is correct | |
| Spacing and typography feel right | |
| Interactive states work (hover, focus, active) | |
| No broken functionality | |

- **Average ≥ 3.5** → Proceed with AI-assisted swap for remaining pages (your Plan B)
- **Average < 3.5** → Switch to deterministic page-by-page rebuild (your Plan A)

### Phase 3: Full Rollout (either path)

#### Page Migration Priority Order

| Priority | Page | Route | Why this order |
|----------|------|-------|----------------|
| 1 | Dashboard | `/` | PoC page — already done |
| 2 | Space Home | `/space/[slug]` | Most visited page, sets the pattern for feeds/cards |
| 3 | Subspace Page | `/{slug}/challenges/{sub}` | Reuses Space Home patterns + adds banner/channels |
| 4 | User Profile | `/user/[slug]` | Standalone page, no shared state complexity |
| 5 | Community Tab | `/space/[slug]/community` | Member cards, avatar grid — reusable patterns |
| 6 | Subspaces Tab | `/space/[slug]/subspaces` | Card grid — already solved in Space Home |
| 7 | Knowledge Base | `/space/[slug]/knowledge-base` | Table/list layout — simpler |
| 8 | Post Detail Dialog | (modal) | Dialog + comments — tests shadcn Dialog |
| 9 | Account Settings (all tabs) | `/user/[slug]/settings/*` | Forms — Formik migration starts here |
| 10 | Space Settings (all tabs) | `/space/[slug]/settings/*` | Complex forms + toggles + sidebar nav |
| 11 | Create Space Modal | (modal) | Form + image upload |
| 12 | Template Library | `/innovation-library` | Card grid + search + filters |

#### Plan B (AI swap works) vs Plan A (deterministic rebuild)

| Aspect | Plan B: AI-Assisted Swap | Plan A: Deterministic Rebuild |
|--------|--------------------------|-------------------------------|
| **Method** | AI swaps MUI → shadcn per file, human reviews | Developer manually rebuilds using prototype code |
| **Speed** | Faster initial pass, variable cleanup time | Slower but predictable |
| **Accuracy** | Depends on PoC results | High — copying from working prototype |
| **Risk** | May introduce subtle layout bugs | Lower risk, higher effort |
| **Best for** | Simple pages (cards, lists, grids) | Complex pages (settings, forms, modals) |
| **Source of truth** | Prototype + Figma mockups | Prototype `src/app/components/` directly |

---

## Key Advantages You Already Have

| Asset | What it is | How it helps |
|-------|------------|-------------|
| **Component Inventory** | `component-inventory.md` — maps every MUI component to shadcn | Lookup table for every swap decision |
| **Working Prototype** | 20+ pages in React + shadcn + your design tokens | Copy-paste source for components and patterns |
| **Design Tokens** | `theme.css` with all colors, typography, spacing as CSS vars | Drop into `client-web`, instant token parity |
| **Dev Team Decoupling** | Ongoing work separating UI from business logic | Cleaner component boundaries = easier swaps |
| **40+ shadcn Components** | Pre-configured in prototype with Alkemio tokens | Ready-made component library, not starting from scratch |

---

## Practical Tips for the AI-Assisted Workflow

Based on what's actually in the `client-web` codebase:

| Tip | Why | How |
|-----|-----|-----|
| **Swap file by file**, not globally | AI works best with bounded context | One component or page per session |
| **Keep MUI installed** during transition | Avoids breaking unswapped pages | Remove only after last page migrated |
| **Use prototype as source of truth** | Your components already have Alkemio tokens | Reference `src/app/components/`, not generic shadcn docs |
| **Add `cn()` utility early** | Needed for all shadcn components | Copy from prototype's `src/lib/utils.ts` |
| **Map `gutters()` to Tailwind** | Used in 100+ files for spacing | See Gutters → Tailwind table above |
| **Don't touch forms yet** | Formik → React Hook Form is a separate effort | Swap visual components first, forms later |
| **Keep Typography component names** | `PageTitle`, `Caption`, etc. are imported everywhere | Create Tailwind wrappers with identical export names |
| **Replace `SwapColors` with CSS** | MUI ThemeProvider trick won't work in Tailwind | Use `data-theme="inverted"` + CSS variable overrides |
| **Create icon alias file** | 50+ MUI icons imported individually | Re-export Lucide icons with MUI names to avoid mass edits |

### Icon Migration Reference

| MUI Icon Import | Lucide Equivalent |
|-----------------|-------------------|
| `@mui/icons-material/Help` | `HelpCircle` |
| `@mui/icons-material/Send` | `Send` |
| `@mui/icons-material/Settings` | `Settings` |
| `@mui/icons-material/Search` | `Search` |
| `@mui/icons-material/Close` | `X` |
| `@mui/icons-material/Add` | `Plus` |
| `@mui/icons-material/Edit` | `Pencil` |
| `@mui/icons-material/Delete` | `Trash2` |
| `@mui/icons-material/ExpandMore` | `ChevronDown` |
| `@mui/icons-material/MoreVert` | `MoreVertical` |
| `@mui/icons-material/ForumOutlined` | `MessageSquare` |
| `@mui/icons-material/GitHub` | `Github` |
| `@mui/icons-material/Download` | `Download` |
| `@mui/icons-material/Fullscreen` | `Maximize` |
| `@mui/icons-material/ExitToApp` | `LogOut` |
| `@mui/icons-material/DashboardOutlined` | `LayoutDashboard` |
| `@mui/icons-material/DesignServices` | `Palette` |
| `@mui/icons-material/DrawOutlined` | `PenTool` |
| `@mui/icons-material/FolderCopyOutlined` | `FolderOpen` |
| `@mui/icons-material/HandshakeOutlined` | `Handshake` |
| `@mui/icons-material/TableChart` | `Table` |

---

## What NOT to Do

| Don't | Why |
|-------|-----|
| Swap everything at once | Too many issues to triage — you'll lose track of what broke |
| Skip the PoC | 2–3 days invested now saves weeks of wrong-direction work |
| Rebuild from scratch | The app has routing, auth, API integration, state management — you want to reskin, not rewrite |
| Ignore the prototype | It's not just mockups — it's working React code with your exact component implementations |
| Mix form migration with component swap | Formik → React Hook Form is a separate concern — do it after the visual swap |
| Hardcode colors/spacing | Always use design tokens (CSS variables) so the theme stays maintainable |

---

## Suggested First Session (You + Developer)

| Step | Action | Owner |
|------|--------|-------|
| 1 | Clone `client-web` → branch `redesign/shadcn-poc` | Developer |
| 2 | Add `tailwindcss@4`, `@tailwindcss/vite`, shadcn/ui deps, `lucide-react` | Developer |
| 3 | Copy design tokens (`theme.css`) from prototype | Developer |
| 4 | Copy `cn()` utility from prototype's `src/lib/utils.ts` | Developer |
| 5 | Create Tailwind-based Typography wrappers (`PageTitle`, `BlockTitle`, `Caption`, etc.) | Developer |
| 6 | Pick Dashboard page (`src/main/topLevelPages/myDashboard/`) | Both |
| 7 | AI-swap MUI components → shadcn equivalents (file by file) | Both (AI + review) |
| 8 | Run app, screenshot result | Developer |
| 9 | Compare screenshots to Figma mockups side-by-side | Jeroen |
| 10 | Document: what worked, what broke, time spent | Both |

That gives you a concrete data point to make the Plan A vs Plan B decision.
