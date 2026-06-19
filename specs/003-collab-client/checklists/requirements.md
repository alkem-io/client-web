# Requirements Quality Checklist: client-web unified collaboration provider (WS-D)

**Purpose**: Validate that this sub-spec (`spec.md` + plan/research/data-model/
tasks) is complete, unambiguous, testable, and ready to drive T001–T006 **once the
OPEN clarifications are answered and the binding package ships**.
**Created**: 2026-06-19
**Feature**: [spec.md](../spec.md) · Workspace epic: `../../../agents-hq/specs/003-unify-collab-yjs/`

## Content Quality

- [x] CHK001 No premature implementation detail leaks into FRs — FRs state *what* the client must do (one provider, byte-compatible wire, preserved memo stack); *how* (y-websocket vs custom, file layout) lives in plan.md/research.md.
- [x] CHK002 Each user story is independently testable and maps to concrete scenarios (US1 whiteboard per-property; US2 memo no-regression; US5 reconnect) and tasks (Phase 2 / Phase 1 / T000.6+T002.3+T004.3).
- [x] CHK003 Written for the **client boundary** — does not re-specify the server (WS-C), the CRDT core (WS-A), or the binding internals (WS-B); those are consumed. Scope boundary explicit in the header note + Scope + Assumptions.
- [x] CHK004 Conforms to the reference sub-spec shape (spec/plan/research/data-model/quickstart/tasks/checklists), mirroring `collaboration-service/specs/001-collaboration-server/`.
- [x] CHK005 Terminology consistent with the epic + the client code (`documentId`, `Y.XmlFragment("default")`, id-keyed `Y.Map`, awareness/ephemeral/control, `CollabProviderLike`).

## Requirement Completeness

- [x] CHK006 Every epic client task (T001–T006) maps to ≥1 FR + ≥1 task: T001/T002→FR-002/004; T003/T004→FR-003/005/007; T005/T006→FR-008/009/011 (traced in tasks.md self-analyze).
- [x] CHK007 The wire contract the provider must speak is pinned to the **frozen** source (`contracts/ws-protocol.md`, `protocol.go`, `control.go`) — not guessed; the JSON `ControlMessage` field names match the Go tags verbatim.
- [x] CHK008 Every Success Criterion is observable in the client or the epic e2e harness (rendered convergence, footer parity, dep removal, prop-rename build, e2e contribution) — no vanity metric.
- [x] CHK009 Edge cases enumerated and tied to a story/OPEN: control-parity gap, inactivity downgrade, room-closed, mixed-version (cutover-handled), guest auth, binding absent.
- [x] CHK010 Out-of-scope is explicit: server, CRDT core, binding internals, migration/cutover orchestration, the e2e harness itself, editor feature sets, version history.
- [x] CHK011 Key entities listed with their layer (UnifiedCollabProvider client-runtime; memo binding unchanged; whiteboard binding consumed; control/ephemeral wire shapes).

## Requirement Clarity & Consistency

- [x] CHK012 No conflicting requirements across spec/plan/research/data-model/tasks (cross-checked in the self-analyze pass at the end of tasks.md).
- [x] CHK013 Each FR is singular and verifiable (no compound obligation hiding a second untested one).
- [x] CHK014 Nothing is marked implemented — this is SPEC/DESIGN only; tasks are all unchecked and gated.
- [x] CHK015 The big-bang-cutover gating + legacy-warm rollback is stated as a rollout requirement (FR-008/plan Rollout/T006.3), so the client never runs mixed old/new on one live document.

## Ambiguities & Open Decisions

- [x] CHK016 Genuinely unknown items are surfaced as **OPEN-1..4**, each grounded by reading the actual client code + the Wave-1 server (not guessed), each with a recommendation.
- [x] CHK017 Each OPEN names the task it gates (OPEN-1→T002.2/T004.2, OPEN-2→T000.1, OPEN-3→T003.0, OPEN-4→T002.2) so it is resolved before the dependent task, not before authoring.
- [x] CHK018 No `[NEEDS CLARIFICATION]` placeholders remain in the FRs — the FRs are decided; only the four cross-boundary integration details are OPEN.
- [x] CHK019 OPEN-1 (control parity) is correctly framed as a **proposed additive extension** to an already-frozen contract (optional `reason`), with a no-server-change fallback — so it does not silently destabilize the epic wire.

## Feature Readiness

- [x] CHK020 The blocking dependency (`@alkemio/excalidraw-yjs-binding` unpublished) is called out in spec Assumptions, plan R1, tasks T003.0, and the report — the whiteboard half cannot start until it ships.
- [x] CHK021 The packaging/sequencing (binding publish → `@alkemio/excalidraw` bump → prop rename, atomic) is consistent across plan, research D5, and tasks T003.1/T003.2.
- [x] CHK022 Memo (unblocked) and whiteboard (blocked) are cleanly separable into two PRs; the plan + tasks order them so memo can land first.
- [x] CHK023 The client's e2e-harness contribution (FR-011/SC-006) is an explicit deliverable (T006.2), not assumed.
- [x] CHK024 The branch is `feat/003-unify-collab-yjs` off `develop`, mirroring the epic per-repo branch convention; the spec dir is `specs/003-collab-client/`.

## Notes

- The single residual UX risk is OPEN-1 (read-only **reason** / collaborator-mode parity): the unified `ControlMessage` is narrower than today's `readOnlyCode`/`collaborator-mode reason`. Recommended fix is a small additive server `reason` field; the documented fallback is a generic reason with flagged lost granularity.
- OPEN-2 recommendation (adopt `y-websocket` + register type-2/3 handlers) should be verified against the chosen `y-websocket` version's `messageHandlers` API before T000.3.
- Re-run `/speckit-analyze` after OPEN-1..4 are answered and before implementation, to re-baseline coverage honestly.
