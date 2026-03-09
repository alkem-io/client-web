# Tasks: Optimize CI Builds

**Input**: Design documents from `/specs/019-optimize-ci-builds/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new files or directories needed — all changes are in-place modifications. This phase is intentionally empty.

*No setup tasks required — all changes modify existing workflow files.*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Verify that Apple Silicon runners are available and understand current workflow structure before making changes.

**⚠️ CRITICAL**: Confirm runner availability before modifying workflows.

- [x] T001 Review the reference implementation at `alkem-io/server` PR #5906 to confirm patterns for runner labels, pnpm caching, and `pnpm/action-setup` dest parameter
- [x] T002 Verify current workflow files exist and match expected structure in `.github/workflows/ci-test.yml`, `.github/workflows/ci-build.yml`, `.github/workflows/ci-lint.yml`, and `.github/workflows/build-release-docker-hub.yml`

**Checkpoint**: Current state understood — user story implementation can now begin.

---

## Phase 3: User Story 1 — Apple Silicon Runner Migration for Node.js CI Workflows (Priority: P1) 🎯 MVP

**Goal**: Migrate `ci-test.yml`, `ci-build.yml`, and `ci-lint.yml` from `arc-runner-set` to Apple Silicon self-hosted runners so CI jobs benefit from native ARM64 performance.

**Independent Test**: Push a PR and verify that all three CI workflows execute on runners with labels `[self-hosted, macOS, ARM64, apple-silicon, m4]` in the workflow logs.

### Implementation for User Story 1

- [x] T003 [P] [US1] Change `runs-on` from `arc-runner-set` to `[self-hosted, macOS, ARM64, apple-silicon, m4]` in `.github/workflows/ci-test.yml`
- [x] T004 [P] [US1] Change `runs-on` from `arc-runner-set` to `[self-hosted, macOS, ARM64, apple-silicon, m4]` in `.github/workflows/ci-build.yml`
- [x] T005 [P] [US1] Change `runs-on` from `arc-runner-set` to `[self-hosted, macOS, ARM64, apple-silicon, m4]` in `.github/workflows/ci-lint.yml`
- [x] T006 [P] [US1] Add `dest: ${{ runner.temp }}/setup-pnpm` to `pnpm/action-setup@v4` step in `.github/workflows/ci-test.yml` for macOS ARM64 compatibility
- [x] T007 [P] [US1] Add `dest: ${{ runner.temp }}/setup-pnpm` to `pnpm/action-setup@v4` step in `.github/workflows/ci-build.yml` for macOS ARM64 compatibility
- [x] T008 [P] [US1] Add `dest: ${{ runner.temp }}/setup-pnpm` to `pnpm/action-setup@v4` step in `.github/workflows/ci-lint.yml` for macOS ARM64 compatibility

**Checkpoint**: All three Node.js CI workflows now target Apple Silicon runners. Push a PR to verify runner labels in workflow logs.

---

## Phase 4: User Story 2 — Dependency Caching for CI Workflows (Priority: P2)

**Goal**: Add pnpm dependency caching with content-addressed keys to all three Node.js CI workflows so repeated builds reuse cached dependencies and install faster.

**Independent Test**: Push two consecutive commits to a PR; verify cache miss on first run and cache hit on second run via workflow logs.

### Implementation for User Story 2

- [x] T009 [P] [US2] Remove `cache: 'pnpm'` from `actions/setup-node` step in `.github/workflows/ci-test.yml` to avoid conflict with explicit cache
- [x] T010 [P] [US2] Remove `cache: 'pnpm'` from `actions/setup-node` step in `.github/workflows/ci-build.yml` to avoid conflict with explicit cache
- [x] T011 [P] [US2] Remove `cache: 'pnpm'` from `actions/setup-node` step in `.github/workflows/ci-lint.yml` to avoid conflict with explicit cache
- [x] T012 [P] [US2] Add "Get pnpm store directory" step (id: `pnpm-cache`) that runs `echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_OUTPUT` in `.github/workflows/ci-test.yml` after pnpm setup
- [x] T013 [P] [US2] Add "Get pnpm store directory" step (id: `pnpm-cache`) in `.github/workflows/ci-build.yml` after pnpm setup
- [x] T014 [P] [US2] Add "Get pnpm store directory" step (id: `pnpm-cache`) in `.github/workflows/ci-lint.yml` after pnpm setup
- [x] T015 [P] [US2] Add "Setup pnpm cache" step using `actions/cache@v4` with path `${{ steps.pnpm-cache.outputs.STORE_PATH }}`, key `pnpm-${{ runner.os }}-${{ runner.arch }}-${{ hashFiles('pnpm-lock.yaml') }}`, and restore-keys `pnpm-${{ runner.os }}-${{ runner.arch }}-` in `.github/workflows/ci-test.yml`
- [x] T016 [P] [US2] Add "Setup pnpm cache" step using `actions/cache@v4` with same key pattern in `.github/workflows/ci-build.yml`
- [x] T017 [P] [US2] Add "Setup pnpm cache" step using `actions/cache@v4` with same key pattern in `.github/workflows/ci-lint.yml`

**Checkpoint**: All three CI workflows now have pnpm store caching. Push two commits to verify cache miss → cache hit behavior.

---

## Phase 5: User Story 3 — Docker Release Workflow Cleanup (Priority: P3)

**Goal**: Modernize `build-release-docker-hub.yml` to use `docker/metadata-action@v5` for tag generation, replacing the manual shell-based `Prepare` step, and update all action versions.

**Independent Test**: Create a test release (e.g., `v99.0.0-test.1` as prerelease) and verify correct Docker tags are generated in the "Docker metadata" step output.

### Implementation for User Story 3

- [x] T018 [US3] Update `actions/checkout` from `@v3.0.2` to `@v4` in `.github/workflows/build-release-docker-hub.yml`
- [x] T019 [US3] Update `docker/setup-qemu-action` from `@v3.0.0` to `@v3` in `.github/workflows/build-release-docker-hub.yml`
- [x] T020 [US3] Update `docker/setup-buildx-action` from `@v3.0.0` to `@v3` in `.github/workflows/build-release-docker-hub.yml`
- [x] T021 [US3] Update `docker/login-action` from `@v3.0.0` to `@v3` in `.github/workflows/build-release-docker-hub.yml`
- [x] T022 [US3] Update `docker/build-push-action` from `@v5.0.0` to `@v5` in `.github/workflows/build-release-docker-hub.yml`
- [x] T023 [US3] Remove the entire manual `Prepare` step (id: `prep`) with ~25 lines of shell-based tag parsing from `.github/workflows/build-release-docker-hub.yml`
- [x] T024 [US3] Add `docker/metadata-action@v5` step (id: `meta`) with `images: alkemio/client-web` and semver tag patterns (`v{{version}}`, `v{{major}}.{{minor}}`, `v{{major}}`, latest only for non-prerelease) in `.github/workflows/build-release-docker-hub.yml`
- [x] T025 [US3] Update `docker/build-push-action` to use `${{ steps.meta.outputs.tags }}` and `${{ steps.meta.outputs.labels }}` instead of `${{ steps.prep.outputs.tags }}` and manual labels in `.github/workflows/build-release-docker-hub.yml`
- [x] T026 [US3] Remove the `ARG_SENTRY_AUTH_TOKEN` build-arg from `docker/build-push-action` if still present (already fixed by PR #9378 but verify) in `.github/workflows/build-release-docker-hub.yml`
- [x] T027 [US3] Verify the Docker workflow still uses `runs-on: ubuntu-latest` (must NOT be changed to Apple Silicon — Docker daemon unavailable on macOS) in `.github/workflows/build-release-docker-hub.yml`

**Checkpoint**: Docker release workflow modernized. Create a test prerelease to verify tag generation.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all modified workflows.

- [x] T028 Verify K8s deployment workflows are unchanged: `.github/workflows/build-deploy-k8s-dev-hetzner.yml`, `.github/workflows/build-deploy-k8s-sandbox-hetzner.yml`, `.github/workflows/build-deploy-k8s-test-hetzner.yml`
- [ ] T029 Run quickstart.md verification checklist against actual workflow run logs
- [x] T030 Review all modified workflow YAML files for syntax correctness (valid YAML, proper indentation, correct step ordering)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Empty — no setup needed
- **Foundational (Phase 2)**: No dependencies — start immediately
- **User Story 1 (Phase 3)**: Depends on Phase 2 — runner migration
- **User Story 2 (Phase 4)**: Depends on Phase 2 — can run in parallel with US1 (different YAML sections), but logically sequenced after US1 since caching config depends on the runner platform
- **User Story 3 (Phase 5)**: Depends on Phase 2 — fully independent of US1 and US2 (different workflow file)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories — modifies `runs-on` and `pnpm/action-setup` in 3 CI files
- **User Story 2 (P2)**: Logically follows US1 (cache keys include `runner.os` and `runner.arch` which change with runner migration), but technically modifiable in parallel since they touch different YAML sections
- **User Story 3 (P3)**: Fully independent — modifies only `build-release-docker-hub.yml` which is untouched by US1/US2

### Within Each User Story

- All tasks marked [P] within a story can run in parallel (they modify different files)
- US3 tasks T018–T027 are sequential within the same file — apply in order

### Parallel Opportunities

- T003, T004, T005 can run in parallel (different files)
- T006, T007, T008 can run in parallel (different files)
- T009–T011 can run in parallel (different files)
- T012–T014 can run in parallel (different files)
- T015–T017 can run in parallel (different files)
- US1 and US3 can be worked on in parallel (entirely different files)

---

## Parallel Example: User Story 1

```bash
# Launch all runner changes together (different files):
Task: "Change runs-on to Apple Silicon in .github/workflows/ci-test.yml"
Task: "Change runs-on to Apple Silicon in .github/workflows/ci-build.yml"
Task: "Change runs-on to Apple Silicon in .github/workflows/ci-lint.yml"

# Launch all pnpm/action-setup dest changes together (different files):
Task: "Add dest parameter in .github/workflows/ci-test.yml"
Task: "Add dest parameter in .github/workflows/ci-build.yml"
Task: "Add dest parameter in .github/workflows/ci-lint.yml"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (review reference, verify files)
2. Complete Phase 3: User Story 1 (runner migration)
3. **STOP and VALIDATE**: Push PR, verify Apple Silicon runner labels in logs
4. Merge if ready — immediate CI speed improvement

### Incremental Delivery

1. Complete Foundational → Ready to proceed
2. Add User Story 1 → Test runner migration → Push (MVP!)
3. Add User Story 2 → Test cache hit/miss → Push
4. Add User Story 3 → Test Docker tags → Push
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team reviews reference implementation together (Phase 2)
2. Once Foundational is done:
   - Developer A: User Story 1 + User Story 2 (same 3 CI files)
   - Developer B: User Story 3 (Docker workflow — independent file)
3. Stories integrate cleanly (no file conflicts between A and B)

---

## Notes

- All changes are in `.github/workflows/` YAML files only — no application code modified
- The reference implementation is `alkem-io/server` PR #5906
- FR-008 (Sentry auth token leak) is already fixed by PR #9378 — T026 is a verification step only
- K8s deployment workflows are explicitly out of scope (FR-006)
- Docker workflow must stay on `ubuntu-latest` (FR-006a)
