# Specification Quality Checklist: CRD Contributor Settings (User + Organization)

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-04-30 (rewritten 2026-05-06)
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs) — spec mentions hooks/mutations by name only as parity references to current MUI behavior; no new APIs proposed
- [x] Focused on user value and business needs — every tab framed by the user goal it serves (User identity editing, Org admin governance, etc.)
- [x] Written for non-technical stakeholders — each user story uses plain-language scenarios; technical hooks appear only as parity anchors
- [x] All mandatory sections completed — User Scenarios, Edge Cases, Requirements, Key Entities, Success Criteria all present

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain — scope, edit-pattern decision, predicate split, namespace, and Account-tab dispatcher pattern all decided in the rewrite based on the prior 097's clarifications + new direction from user (add Organization, defer VC)
- [x] Requirements are testable and unambiguous — every FR phrased as MUST with a concrete observable outcome
- [x] Success criteria are measurable — SC-001 through SC-010 each include a number, time bound, or pass/fail predicate
- [x] Success criteria are technology-agnostic (no implementation details) — phrased in terms of user-facing behavior and route resolution
- [x] All acceptance scenarios are defined — every user story (12 total) has at minimum 3–8 Given/When/Then scenarios
- [x] Edge cases are identified — covers anonymous viewers (User + Org), unauthorized viewers (User + Org), CRD toggle off, mid-edit tab switch, upload failure, per-field save failure, reference URL validation, push permission denied, notifications optimistic resync, `/me` shorthand, long lists, per-actor authorization predicates, verification badge read-only
- [x] Scope is clearly bounded — Out of Scope section enumerates VC settings shell, public profile pages (sibling 096), backend changes, identity-provider restyle, MUI heavy-flow dialogs, MUI deletion, dirty-buffer behavior, verification mutation
- [x] Dependencies and assumptions identified — Assumptions section lists CRD shell precedents, sibling spec coupling (096), data hooks for both actors, identity-provider handling, verification scope, prototype role per actor, authorization model, i18n workflow, Account-tab dispatcher pattern

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria — each FR maps to one or more acceptance scenarios in its associated user story
- [x] User scenarios cover primary flows — 12 user stories: 7 User tabs (US1–US7) + 5 Org tabs (US8–US12), each independently testable
- [x] Feature meets measurable outcomes defined in Success Criteria — SC items cover edit-flow speed (User + Org), design-system toggle, notification parity, route parity (both actors), accessibility (all 12 tabs), bundle size, per-actor authorization redirects, role-assignment parity
- [x] No implementation details leak into specification — file paths appear only as parity references and architectural-rule anchors (per CLAUDE.md / migration-guide.md), not as implementation prescriptions

## Scope expansion notes (vs. prior 097)

This spec was rewritten on 2026-05-06 after the prior 097's User-only scope was expanded to also cover Organization settings (per direction: "we want the settings for both users and orgs; VCs are quite complex and we are going to leave that for later"). The rewrite:

- Renamed feature title (still "097" branch) to **CRD Contributor Settings (User + Organization)**.
- Added **5 new Org user stories** (US8–US12: Profile, Account, Community/Associates, Authorization, Settings).
- Generalized the settings shell to be actor-parametric (`SettingsShell` accepts `tabs[]`).
- Split the canonical edit-access predicate into two per-actor predicates (`canEditUserSettings` vs `canEditOrganizationSettings`) with different sources.
- Decided per-field save model for **both** User My Profile and Org Profile (deliberate divergence from MUI's Formik-with-single-Save on `OrganizationForm` — chosen for UX consistency across the contributor vertical).
- Single combined i18n namespace (`crd-contributorSettings`) covering both actors.
- Added a parallel routing dispatch in `CrdOrganizationRoutes.tsx` (currently delegates settings/* unconditionally to MUI) to enable the toggle path on the Org side.
- VC settings shell is explicitly out of scope; deferred to a future spec.

## Notes

- This spec is the "future spec" referenced by 096 line 282–283 ("The Organization settings/admin shell ... is a future spec"), expanded to also cover the User admin shell so both actor verticals migrate in lockstep.
- The two specs (096 + 097) ship as one CRD rollout cohort gated by the same `useCrdEnabled` toggle.
- Items marked incomplete require spec updates before `/speckit.clarify` or `/speckit.plan`.
