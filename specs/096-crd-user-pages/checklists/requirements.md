# Specification Quality Checklist: CRD Public Profile Pages (User, Organization, VC)

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-04-29 (updated 2026-04-30 — split out User Settings into sibling spec 097, then expanded to add Organization + VC profile pages; updated 2026-05-06 — VC profile re-categorised from "parity restyle" to "redesign per updated prototype" with hero badge / skill-tag chips and a rebuilt right column rendering Functionality / AI Engine / Monitoring card grids)
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs) — implementation-style references (mutation names, hook names, route paths) are deliberate parity anchors to the existing MUI pages, not new design proposals
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined for each of the three user stories — VC story now covers 18 scenarios after the 2026-05-06 redesign (hero badge / chip row, three new right-column sections, empty model card, null `isInteractionDataUsedForTraining`, empty `additionalTechnicalDetails`, Trans rendering of HTML-tagged copy, and the deliberate sidebar-References divergence from MUI)
- [x] Edge cases are identified — anonymous viewers, stale slug redirects, `/me` shorthand, long lists, message send failure, CRD toggle mid-session, VC private BoK, Org empty sections, VC 404, VC empty `modelCard`, VC `additionalTechnicalDetails` empty, VC missing Keywords tagset
- [x] Scope is clearly bounded — three public profile views only; settings/admin shells (User, Org, VC) are explicitly out of scope (User settings owned by 097; Org/VC settings remain in MUI); the MUI VC source files (including `useTemporaryHardCodedVCProfilePageData.ts`) are explicitly NOT modified
- [x] Dependencies and assumptions identified — CRD shell, space-card primitive, `CompactContributorCard`, `MessagePopover`, `SocialLinks` (User+Org only — VC is no longer a consumer), existing data hooks, prototype role per actor type, three new VC content-view CRD components introduced under `src/crd/components/virtualContributor/` (Functionality grid, AI Engine grid, Monitoring section)

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria — FR-010..015a (User), FR-020..025 (Organization), FR-030..037 (VC) each map to scenarios in their user story
- [x] User scenarios cover primary flows — three independently testable user stories (one per actor type)
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- This spec was originally drafted on 2026-04-29 covering only the User profile + 7 settings tabs. On 2026-04-30 the seven settings tabs were split into sibling spec `097-crd-user-settings`, then this spec was expanded to add the Organization and Virtual Contributor public profile pages. On **2026-05-06** the VC profile was re-categorised from "parity restyle of `VCProfilePageView` + `VCProfileContentView`" to "redesign per the updated prototype `prototype/src/app/pages/VCProfilePage.tsx`". The redesign rebuilds the hero (adds a "Virtual Contributor" type badge + Keywords skill-tag chip row, drops the banner) and the right column (replaces the three MUI `PageContentBlock`s — currently rendered with hard-coded English strings via `dangerouslySetInnerHTML` — with three card-grid sections: Functionality, AI Engine, Monitoring). The VC sidebar is largely a parity restyle with two narrow tweaks: sticky positioning on `lg+` and a flat References list (no social/non-social split). The data-extraction logic of the existing MUI hook `useTemporaryHardCodedVCProfilePageData(modelCard)` is reused (re-implemented in plain TypeScript inside the CRD data mapper), and all hard-coded English copy moves to `crd-profilePages` i18n keys with `<Trans>` rendering. The MUI source files are NOT modified.
- The supporting artifacts in this folder — `plan.md`, `data-model.md`, `research.md`, `quickstart.md`, `tasks.md`, and `contracts/` — were generated against an earlier scope. They need to be **regenerated** to incorporate the 2026-05-06 VC redesign (in addition to the earlier 2026-04-30 expansion). Re-run `/speckit.plan` and `/speckit.tasks` to refresh them. Until that happens, those artifacts are out of date relative to this spec — in particular, `data-model.md`'s `VCContentView` shape (currently `{ modelCard, references }`) needs to be replaced by structured Functionality / AI Engine / Monitoring shapes that mirror FR-034.
- Prototype references: User profile uses `prototype/src/app/pages/UserProfilePage.tsx`; **VC profile now uses `prototype/src/app/pages/VCProfilePage.tsx`** (updated 2026-05-06). There is still **no prototype** for the Organization profile — that page continues to adopt the User profile's CRD design language and stays parity-only with current MUI for content and data.
- Implementation-style references in the spec (mutation names, hook names, file paths, component names) are deliberate and serve as **traceability anchors** to the existing MUI implementation that must be preserved at parity. They are not new design proposals.
- Items marked incomplete require spec updates before `/speckit.clarify` or `/speckit.plan`.
