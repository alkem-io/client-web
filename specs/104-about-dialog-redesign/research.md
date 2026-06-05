# Phase 0 Research: About Dialog Redesign (Prototype → CRD)

This feature has no open `NEEDS CLARIFICATION` markers (the one scope-sensitive choice — host contact — was resolved as an Assumption in the spec). Research below records the concrete decisions that anchor the design so Phase 1 and `/speckit.tasks` are unambiguous.

## R1. Scope of change: which files actually move

- **Decision**: Redesign the two CRD presentational files `src/crd/components/space/SpaceAboutView.tsx` (body) and `src/crd/components/space/SpaceAboutDialog.tsx` (shell + header). Keep `CommunityGuidelinesBlock.tsx` as the guidelines slot. Adjust the integration components (`CrdSpaceAbout.tsx`, `CrdSubspaceAbout.tsx`) only if the prototype layout requires a new prop/callback.
- **Rationale**: Both the L0 `/about` route, the subspace `/about` route, and the sidebar "About this Space" trigger render the **same** `SpaceAboutDialog`/`SpaceAboutView`. Changing those two files propagates the redesign to every entry point with no duplication (DRY, FR-010). The `src/domain/space/about/*` files are the legacy MUI dialog — out of scope.
- **Alternatives considered**: (a) A brand-new parallel component — rejected: duplicates logic, risks divergence between entry points, contradicts "refresh in place." (b) Redesigning per-route — rejected: breaks the single-source-of-truth and parity guarantee.

## R2. Header: space name + tagline vs. generic "About" title

- **Decision**: Move the space **name** into the visible `DialogTitle` and render the **tagline** beneath it (italic), per the prototype. Keep an accessible description for screen readers. The generic `t('about.title')` ("About This Space") is no longer the visible heading but is retained for `aria`/sr-only context where useful.
- **Rationale**: Matches the prototype (FR-001) and gives the dialog a recognizable identity. Name/tagline are business data already passed via `SpaceAboutData` (`data.name`, `data.tagline`).
- **Alternatives considered**: Keep generic title — rejected: diverges from prototype, lower information scent.

## R3. Space-information panel (the dark accent card)

- **Decision**: Build a prominent space-info panel containing the description, a meta row (location + member count), and the leads, matching the prototype's dark accent treatment — implemented with Tailwind + design tokens (not the prototype's literal `rgb(29,56,74)`/inline styles). Admin edit affordances on the panel map to existing callbacks: "edit space profile" → `onEditDescription` (settings `…/about#description`), "manage community" → `onEditMembers` (settings `…/community#members`).
- **Rationale**: FR-001/FR-002 (layout + all data present); CRD CLAUDE.md mandates tokens over literal colors and Tailwind over inline styles. Reusing existing callbacks preserves edit destinations (FR-005) with no integration churn.
- **Alternatives considered**: Reproduce literal hex/inline styles — rejected by CRD styling rules. Keep the current two-card (Members + Leads) top row — rejected: doesn't match the prototype's consolidated panel.
- **Open color choice (defer to implementation/visual review)**: which existing token approximates the prototype's dark blue (e.g. a `bg-primary`/`bg-foreground` family vs. a dedicated accent). This is a visual-token decision, not a functional one; chosen during build against the prototype reference.

## R4. Why / Who / References / Hosted-by section treatment

- **Decision**: Render Why and Who as bordered cards with leading icons (Target for Why, Users for Who) and an edit pencil when permitted. Render References as bordered tiles with an external-link affordance and host domain. Render "Hosted by" as a card with the host avatar, name, location, and the existing contact-host affordance.
- **Rationale**: Direct prototype parity (FR-001) while preserving every data field and edit destination already supplied by the integration layer (FR-002, FR-005, FR-007, FR-015). Icons come from `lucide-react` (already used).
- **Alternatives considered**: Flat sections (current view) — rejected: not the prototype look.

## R5. Community guidelines + "Read more"

- **Decision**: Continue using `CommunityGuidelinesBlock` for the guidelines slot; it already truncates and exposes a "Read more" that opens the full text in a nested dialog (satisfies FR-006). Visually align its header (icon + title) with the prototype's guidelines card; no behavioral change.
- **Rationale**: Reuse over rebuild (DRY); read-more already implemented and tested via the existing block. Keeps the integration wiring (`guidelinesSlot`) intact.
- **Alternatives considered**: Inline a new read-more in `SpaceAboutView` — rejected: duplicates existing, working behavior.

## R6. Host contact behavior

- **Decision**: Preserve the current host-contact affordance (a link to the host within the "Hosted by" block), restyled to the prototype. Do **not** implement the prototype's standalone in-app message-compose sub-dialog.
- **Rationale**: Spec Assumption + "no functionality affected negatively" + migration guide's "don't over-migrate." The prototype's compose dialog is mock-only ("in production this would send a message") and would require a real send flow (recipient resolution + mutation) — new functionality, out of scope (FR-015).
- **Alternatives considered**: Build the compose dialog now — rejected: scope creep beyond a functional-parity migration; can be raised in `/speckit.clarify` if stakeholders want it.

## R7. Sticky header / scrollable body

- **Decision**: Keep the dialog as a bounded flex column: `shrink-0` sticky header (title + close), `flex-1 min-h-0 overflow-y-auto` body. Use a viewport-relative height cap.
- **Rationale**: Required by the migration guide's dialog rule and FR-009/SC-005; the current dialog already follows this and must not regress.
- **Alternatives considered**: Scroll on `DialogContent` — rejected: anti-pattern (title/close scroll away).

## R8. Primitives & dependencies

- **Decision**: No new primitives or runtime dependencies. Reuse existing `tooltip`, `scroll-area`, `avatar`, `separator`, `button`, `dialog` from `src/crd/primitives/` (all confirmed present).
- **Rationale**: Everything the prototype needs already exists in the CRD primitive set.
- **Alternatives considered**: Port new shadcn primitives — unnecessary.

## R9. i18n

- **Decision**: Add only the new design-system labels the redesign introduces (e.g. specific edit-affordance `aria-label`s / tooltips such as "Edit space profile", "Manage community", and any section labels not already present) to `src/crd/i18n/space/space.en.json`, then mirror them into `nl/es/bg/de/fr`. Business text (name, tagline, description, why, who, references, host) stays as props. Reuse existing `about.*` keys wherever they already cover the label.
- **Rationale**: CRD i18n rules (manual/AI-assisted, not Crowdin) + the `space.parity.test.ts` requires identical key sets across all 6 files. Most needed labels already exist (`about.edit`, `about.members`, `about.leads`, `about.hostedBy`, `about.references`, `about.contactHost`, `about.readMore`, `about.close`, `about.lockTooltip`, `about.context.*`).
- **Alternatives considered**: Hardcode tooltips — rejected (constitution + CRD rules forbid hardcoded copy).

## R10. Verification & regression safety

- **Decision**: Verify via the standalone preview (`pnpm crd:dev`, `SpacePage.tsx` mock data) for visual parity and via the main app for functional parity (apply flow, edit navigation, lock state, both entry points). Run `pnpm lint`, `pnpm vitest run` (incl. `space.parity.test.ts`), and confirm no MUI imports entered `src/crd/`.
- **Rationale**: SC-001..SC-006 are largely review/observation criteria; the parity test + lint guard the mechanical invariants (i18n completeness, no forbidden imports).
- **Alternatives considered**: Add new unit tests for the view — optional; the view is presentational. Keep the existing parity/lint gates as the required automated checks; add targeted render tests only if a section gains non-trivial conditional logic.
</content>
