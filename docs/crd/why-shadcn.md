# Why shadcn/ui? Component Library Decision Record

**Date**: 2026-03-31
**Status**: Confirmed
**Context**: CRD (Client Re-Design) migration — replacing MUI with a new design system

## Decision

Use **shadcn/ui** (Radix UI + Tailwind CSS v4) as the component foundation for the CRD design system.

## Project Requirements

| Requirement | Weight | Why |
|---|---|---|
| React 19 + React Compiler compatibility | Must-have | App uses React 19 with babel-plugin-react-compiler enabled |
| Tailwind CSS v4 | Must-have | Prototype (Figma Make) outputs Tailwind; chosen as the styling strategy |
| Code ownership (copy-paste, not npm) | Must-have | Multi-month migration across 765+ MUI files; need to freely modify/debug components |
| WCAG 2.1 AA accessibility | Must-have | Platform requirement for all interactive elements |
| Design flexibility (no opinionated visual style) | Must-have | Matching Figma designs, not adopting a library's look |
| Active community and ecosystem | High | Enterprise project needs battle-tested components, tutorials, and third-party resources |
| Small bundle, tree-shakeable | High | App is ~18k modules; every kilobyte counts |
| TypeScript-first | Must-have | Entire codebase is TypeScript |
| CSS coexistence with MUI during migration | Must-have | Both systems must run simultaneously without style conflicts |

## Alternatives Evaluated (March 2026)

### Tier 1: Viable Alternatives

#### Park UI (Ark UI + Tailwind styling)
- **Philosophy**: Copy-paste model like shadcn, built on Ark UI (Chakra team's headless library)
- **Pros**: Broader component set (DatePicker, ColorPicker, FileUpload); copy-paste ownership; Tailwind-native
- **Cons**: Community 10-50x smaller than shadcn; thinner documentation; less battle-tested
- **Verdict**: Closest rival. Worth monitoring for components shadcn lacks. Too risky as primary choice due to small ecosystem.

#### React Aria (Adobe)
- **Philosophy**: Accessibility-first headless hooks library
- **Pros**: Best-in-class accessibility (handles edge cases others miss: mobile screen readers, RTL, virtual keyboards); built-in i18n for 40+ locales; large community
- **Cons**: Steep learning curve; heavier bundle per component; more boilerplate; npm dependency (no code ownership); no pre-styled components
- **Verdict**: Not suitable as primary system, but excellent to supplement shadcn for complex accessible components (date pickers, complex forms) in the future.

#### Ark UI (Chakra team, headless)
- **Philosophy**: State-machine-driven headless components via Zag.js
- **Pros**: Predictable state machine internals; broader component set than Radix; framework-agnostic core
- **Cons**: Smaller community; Zag.js learning curve; npm dependency; switching from Radix means losing shadcn compatibility
- **Verdict**: Strong technical foundation, but adopting it means abandoning the shadcn ecosystem.

### Tier 2: Not Viable for This Project

| Library | Elimination Reason |
|---|---|
| **Radix UI (raw, no shadcn)** | Same primitives but no pre-styled starting points; significant extra work for no benefit |
| **Catalyst** (Tailwind Labs) | Only ~10 components; commercial license; too immature |
| **Headless UI** (Tailwind Labs) | Only ~10 components; not sufficient for enterprise app |
| **Mantine** | Uses own CSS modules — incompatible with Tailwind requirement |
| **HeroUI** (ex-NextUI) | Tailwind v4 support lagging; React 19 support incomplete; Framer Motion bundle cost |
| **Base UI** (ex-MUI Base) | Pre-1.0; too risky for enterprise; tiny community |

### Analysis: Was shadcn/ui the Right Choice?
  How the Decision Was Made

  The project docs show shadcn/ui was chosen implicitly — it came from Jeroen's prototype (Figma Make exports using Radix UI + Tailwind v4), and the CRD migration was designed around it. No formal comparison of alternative libraries was
   documented. That's exactly why your question matters.

  ---
  The Competitive Landscape (2025-2026)

  Here's how the serious alternatives stack up against your specific requirements:

  ┌─────────────────────────────┬──────────────────┬─────────────────┬─────────────┬───────────────┬────────────────┬──────────────────────────────────┐
  │           Library           │  Code Ownership  │   Tailwind v4   │  React 19   │     A11y      │   Community    │             Verdict              │
  ├─────────────────────────────┼──────────────────┼─────────────────┼─────────────┼───────────────┼────────────────┼──────────────────────────────────┤
  │ shadcn/ui                   │ Yes (copy-paste) │ Full            │ Full        │ Good (Radix)  │ Largest        │ Current choice                   │
  ├─────────────────────────────┼──────────────────┼─────────────────┼─────────────┼───────────────┼────────────────┼──────────────────────────────────┤
  │ Park UI (Ark UI)            │ Yes (copy-paste) │ Yes             │ Yes         │ Good          │ 10-50x smaller │ Closest rival                    │
  ├─────────────────────────────┼──────────────────┼─────────────────┼─────────────┼───────────────┼────────────────┼──────────────────────────────────┤
  │ React Aria (Adobe)          │ No (npm dep)     │ Full (headless) │ Yes         │ Best in class │ Large          │ Best a11y, complex API           │
  ├─────────────────────────────┼──────────────────┼─────────────────┼─────────────┼───────────────┼────────────────┼──────────────────────────────────┤
  │ Radix raw (no shadcn)       │ No (npm dep)     │ Full (headless) │ Yes         │ Good          │ Large          │ More work, less guidance         │
  ├─────────────────────────────┼──────────────────┼─────────────────┼─────────────┼───────────────┼────────────────┼──────────────────────────────────┤
  │ Ark UI (Chakra team)        │ No (npm dep)     │ Full (headless) │ Yes         │ Good          │ Small          │ Strong tech, small ecosystem     │
  ├─────────────────────────────┼──────────────────┼─────────────────┼─────────────┼───────────────┼────────────────┼──────────────────────────────────┤
  │ Catalyst (Tailwind Labs)    │ Yes (copy-paste) │ Full            │ Yes         │ OK            │ Small          │ Immature, limited components     │
  ├─────────────────────────────┼──────────────────┼─────────────────┼─────────────┼───────────────┼────────────────┼──────────────────────────────────┤
  │ Headless UI (Tailwind Labs) │ No (npm dep)     │ Full            │ Yes         │ OK            │ Large          │ Only ~10 components — not enough │
  ├─────────────────────────────┼──────────────────┼─────────────────┼─────────────┼───────────────┼────────────────┼──────────────────────────────────┤
  │ Mantine                     │ No (npm dep)     │ Poor (own CSS)  │ Yes         │ Good          │ Large          │ Incompatible with Tailwind       │
  ├─────────────────────────────┼──────────────────┼─────────────────┼─────────────┼───────────────┼────────────────┼──────────────────────────────────┤
  │ HeroUI (ex-NextUI)          │ No (npm dep)     │ Lagging         │ Partial     │ Good          │ Medium         │ React 19 + TW v4 gaps            │
  ├─────────────────────────────┼──────────────────┼─────────────────┼─────────────┼───────────────┼────────────────┼──────────────────────────────────┤
  │ Base UI (ex-MUI Base)       │ No (npm dep)     │ Full (headless) │ In progress │ Good          │ Tiny           │ Pre-1.0, too risky               │
  └─────────────────────────────┴──────────────────┴─────────────────┴─────────────┴───────────────┴────────────────┴──────────────────────────────────┘

  ---
  Why shadcn/ui is the Right Call for This Project

  1. Prototype alignment — The Figma Make prototype already outputs Radix + Tailwind. Choosing anything else means rewriting the designer's output for every future page migration. That's a huge ongoing cost.
  2. Code ownership matters here — You're running a multi-month migration with 765+ MUI files. You need to freely modify, extend, and debug components without waiting on upstream releases. Only shadcn, Park UI, and Catalyst offer this —
   and Catalyst is too limited.
  3. Tailwind v4 + React 19 + React Compiler — shadcn/ui is fully compatible with all three. HeroUI and Base UI have gaps. Mantine is incompatible with Tailwind entirely.
  4. Community and ecosystem — shadcn has the largest community of any copy-paste component system by a wide margin. More tutorials, examples, third-party extensions, and battle-testing. For an enterprise project, this reduces risk
  significantly.
  5. CSS isolation works — Your .crd-root scoping strategy for Tailwind coexistence with MUI is proven and working. This would be harder or impossible with Mantine's CSS-in-JS or HeroUI's Framer Motion dependencies.

  ---
  Known Risks to Watch

  1. Maintenance burden — When shadcn upstream fixes an a11y bug, you must manually diff and merge. No npm update. Assign someone to periodically check shadcn releases.
  2. Component gaps — shadcn lacks DatePicker, ColorPicker, FileUpload natively. If you need these later, consider supplementing with React Aria hooks inside shadcn-style wrappers.
  3. Theming limitations — shadcn's CSS-variable theming is simpler than MUI's ThemeProvider. Multi-brand or runtime theme switching requires custom work.
  4. Quality variance — Some shadcn components are more polished than others. Audit each component you port rather than blindly copying.
  ---
  Verdict

  shadcn/ui is the right decision for this project. It's not perfect — the maintenance cost of code ownership is real, and you'll likely need to supplement with React Aria for complex accessible components later. But given your
  constraints (Tailwind v4, React 19, code ownership, Figma prototype alignment, MUI coexistence), no alternative checks all the boxes as well.

  The only credible alternative would be Park UI (same copy-paste philosophy, broader component set via Ark UI), but its community is 10-50x smaller — a significant risk for enterprise adoption.


## Why shadcn/ui Wins

### 1. Prototype Alignment
The Figma Make prototype already outputs Radix + Tailwind components. Any other choice means rewriting the designer's output for every future page migration — an ongoing cost multiplied across every page in the CRD migration.

### 2. Code Ownership for a Multi-Month Migration
With 765+ files depending on MUI, the CRD migration will take months. During that time, we need to freely modify, extend, and debug every component without waiting on upstream releases or working around library opinions. Only shadcn, Park UI, and Catalyst offer this. Catalyst is too limited; Park UI's community is too small.

### 3. Full Stack Compatibility
shadcn/ui is fully compatible with React 19, React Compiler, Tailwind CSS v4, and Vite. No gaps, no workarounds. HeroUI and Base UI have compatibility issues that would block adoption.

### 4. Largest Ecosystem
shadcn has the largest community of any copy-paste component system. More third-party extensions, tutorials, Stack Overflow answers, and production deployments. For an enterprise project with multiple developers, this reduces onboarding time and debugging risk.

### 5. Proven CSS Coexistence
The `.crd-root` scoping strategy for Tailwind + MUI coexistence is working in production. Tailwind's utility-class approach makes scoping straightforward. This would be harder with Mantine's CSS-in-JS or HeroUI's Framer Motion animations.

## Known Risks and Mitigations

### Risk 1: Maintenance Burden
**What**: When shadcn upstream fixes a bug (especially a11y), we must manually diff and merge — no `npm update`.
**Mitigation**: Periodically review shadcn's changelog. The CRD components are few enough (~15 primitives) that manual updates are manageable.

### Risk 2: Component Gaps
**What**: shadcn lacks DatePicker, ColorPicker, FileUpload natively.
**Mitigation**: When needed, build these using React Aria hooks inside shadcn-style wrappers. The architectures are compatible — React Aria hooks can power Tailwind-styled components.

### Risk 3: Theming Limitations
**What**: shadcn's CSS-variable theming is simpler than MUI's ThemeProvider. Multi-brand or runtime theme switching requires custom work.
**Mitigation**: Current CRD design uses a single theme defined in `src/crd/styles/theme.css`. If multi-theme is needed later, CSS custom properties support runtime switching. Not a current requirement.

### Risk 4: Quality Variance
**What**: Some shadcn components are more polished than others.
**Mitigation**: Audit each primitive during porting (Phase 2 of migration). We copy from the prototype (which has been validated against Figma), not directly from shadcn's registry.

## Recommendation

**Stick with shadcn/ui as the primary system.** Supplement with React Aria for complex accessible components if needed in the future. No alternative checks all the boxes as well given the project's constraints.

The decision is not just about which library is "best" in isolation — it's about which choice minimizes total migration cost across 765+ files while maintaining quality, accessibility, and developer velocity.
