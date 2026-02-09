# Requirements Quality Checklist: Whiteboard Image UX States & Messaging

**Purpose**: Validate that requirements clearly specify user-visible states, messaging, recovery affordances, and interaction/accessibility expectations for whiteboard image failures.
**Created**: 2026-01-21
**Feature**: ../spec.md

**Audience**: Spec author
**Depth**: Standard

**Note**: This checklist tests the *requirements writing*, not the implementation.

## Requirement Completeness

- [ ] CHK001 Are user-visible states specified for the full image lifecycle (newly added, pending availability, available, unavailable, recovering, failed) rather than only “success/failure”? [Gap, Spec §User Story 1.3, Spec §User Story 3]
- [ ] CHK002 Are requirements specified for how the user learns an image is unavailable (visual indicator, message placement, and persistence of the indicator) instead of leaving it implicit? [Gap, Spec §FR-003, Spec §FR-004]
- [ ] CHK003 Are requirements specified for recovery affordances per failure class (upload rejected, upload failed, retrieval failed during collaboration, retrieval failed on reopen) including what action is offered in each case? [Completeness, Spec §User Story 3, Spec §FR-004]
- [ ] CHK004 Are requirements specified for what happens to the image element when an image is unavailable (retained placeholder vs removed) so “no silent loss” is satisfied in UX terms? [Gap, Spec §FR-003, Spec §FR-004, Spec §SC-003]
- [ ] CHK005 Are requirements specified for how “blocked before placement” is communicated (error surface, message content expectations, and next steps)? [Completeness, Spec §FR-009, Spec §FR-010]
- [ ] CHK006 Are requirements specified for supported-format rejection messaging (what information to include and whether to suggest supported formats)? [Gap, Spec §FR-011]
- [ ] CHK007 Are requirements specified for oversize rejection messaging (include max size value, file name, and how to proceed) rather than only “clear message”? [Gap, Spec §FR-009]
- [ ] CHK008 Are requirements specified for a “pending availability” state when network is slow/unstable (including the user’s available actions while waiting)? [Completeness, Spec §User Story 1.3]
- [ ] CHK009 Are requirements specified for whether and when to surface technical details (error codes, diagnostics IDs) versus friendly guidance? [Gap, Spec §FR-007]

## Requirement Clarity

- [ ] CHK010 Is the term “clear message” defined with concrete guidance (tone, length, must-include fields, and where it appears), rather than left subjective? [Ambiguity, Spec §FR-009, Spec §FR-010, Spec §FR-011]
- [ ] CHK011 Is “recoverable state” defined with explicit criteria (what makes it recoverable, what constitutes a successful recovery, and when recovery is not possible)? [Ambiguity, Spec §FR-004, Spec §User Story 3]
- [ ] CHK012 Is the “not available yet” state described with precise wording and differentiation from “failed/unavailable” states? [Ambiguity, Spec §User Story 1.3]
- [ ] CHK013 Are timing expectations for user-visible transitions clearly stated (e.g., when to transition from pending to unavailable vs when to keep waiting)? [Gap, Spec §SC-001, Spec §User Story 1.3]
- [ ] CHK014 Are requirements explicit about whether recovery actions operate per-image or globally (single image vs all images in the scene)? [Gap, Spec §FR-004]

## Requirement Consistency

- [ ] CHK015 Do all requirements consistently distinguish between “blocked” (validation rejection) and “failed” (unexpected error) so messaging does not conflict across scenarios? [Consistency, Spec §FR-009, Spec §FR-010, Spec §FR-011, Spec §FR-004]
- [ ] CHK016 Do requirements align between collaboration and reopen scenarios regarding user-visible handling of missing images (same terminology and same recovery affordances unless explicitly different)? [Consistency, Spec §User Story 2, Spec §User Story 3, Spec §FR-004]
- [ ] CHK017 Do “no silent loss” requirements align with any proposed placeholders or hidden retries (no state where the user is unaware something is missing)? [Consistency, Spec §FR-003, Spec §SC-003]
- [ ] CHK018 Are success criteria (SC-003) consistent with the specified UX states (i.e., the spec defines what “user-visible” means in a way that can be evaluated)? [Consistency, Spec §SC-003]

## Acceptance Criteria Quality

- [ ] CHK019 Do acceptance scenarios explicitly cover user-visible messaging for each major failure class, rather than only describing end states? [Gap, Spec §User Story 3]
- [ ] CHK020 Are the minimum recovery actions explicitly enumerated in acceptance criteria (at least one action per failure class), matching FR-004? [Completeness, Spec §FR-004, Spec §User Story 3]
- [ ] CHK021 Are acceptance criteria written so a reviewer can objectively determine whether messaging/state requirements are met (not relying on subjective “clear”/“nice”)? [Measurability, Spec §FR-004]

## Scenario Coverage

- [ ] CHK022 Are requirements specified for the “multiple images quickly” scenario regarding message aggregation vs per-image messaging (avoid overwhelming the user)? [Gap, Spec §User Story 1.3]
- [ ] CHK023 Are requirements specified for late-join scenarios regarding what the joining user sees for images that are not immediately available? [Gap, Spec §Edge Cases]
- [ ] CHK024 Are requirements specified for mixed availability scenarios (some images available, some unavailable) including how the UI communicates which ones need attention? [Gap, Spec §FR-004]

## Edge Case Coverage

- [ ] CHK025 Are requirements specified for retry limits/backoff expectations from a user perspective (e.g., when to stop offering retry or suggest alternate path), rather than leaving “retry” indefinite? [Gap, Spec §FR-004]
- [ ] CHK026 Are requirements specified for what happens after repeated failures (escalation path such as “try again later”, “reload”, or “contact support” guidance)? [Gap, Spec §User Story 3]
- [ ] CHK027 Are requirements specified for how to handle unavailable storage/permission issues in messaging (user-friendly explanation without leaking sensitive details)? [Gap, Spec §Dependencies, Spec §FR-007]

## Non-Functional Requirements

- [ ] CHK028 Are accessibility requirements specified for all user-visible states and actions (keyboard operability, focus behavior, and announcement requirements for state changes)? [Gap]
- [ ] CHK029 Are localization requirements specified for all new user-visible strings (i18n usage, placeholders/variables, and avoidance of hard-coded copy)? [Gap, Plan §Constitution]

## Dependencies & Assumptions

- [ ] CHK030 Are requirements explicit about which information is assumed available for messaging (e.g., max file size value, supported formats list, and whether bucket config might be missing)? [Assumption, Spec §FR-009, Spec §FR-011, Spec §Dependencies]

## Ambiguities & Conflicts

- [ ] CHK031 Are there any terms used inconsistently across the spec (e.g., “unavailable”, “not available yet”, “failed”, “missing”) that should be normalized in the requirements? [Ambiguity, Spec §User Story 1.3, Spec §User Story 3]
- [ ] CHK032 Are requirements explicit about what is out of scope for UX handling (e.g., whether server-side incident messaging is required) so gaps are intentional? [Gap]
