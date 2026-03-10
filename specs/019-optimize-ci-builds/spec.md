# Feature Specification: Optimize CI Builds

**Feature Branch**: `019-optimize-ci-builds`
**Created**: 2026-03-09
**Status**: Draft
**Input**: User description: "Move to Apple Silicon build runner. Use https://github.com/alkem-io/server/pull/5906 as a reference implementation."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Apple Silicon Runner Migration for Node.js CI Workflows (Priority: P1)

As a developer, I want the Node.js CI workflows (test, build, lint) to run on Apple Silicon self-hosted runners instead of `arc-runner-set`, so that CI jobs complete faster and benefit from native ARM64 performance.

**Why this priority**: This is the core ask — migrating from `arc-runner-set` to Apple Silicon runners directly improves CI speed for every pull request and push.

**Independent Test**: Can be fully tested by pushing a PR and verifying that `ci-test.yml`, `ci-build.yml`, and `ci-lint.yml` all execute on Apple Silicon runners (check runner labels in workflow logs).

**Acceptance Scenarios**:

1. **Given** a PR is opened against `develop`, **When** CI workflows trigger, **Then** `ci-test`, `ci-build`, and `ci-lint` jobs all run on runners with labels `[self-hosted, macOS, ARM64, apple-silicon, m4]`
2. **Given** a push to `develop` or `main`, **When** CI workflows trigger, **Then** all Node.js CI jobs run on Apple Silicon runners
3. **Given** Apple Silicon runners are temporarily unavailable, **When** CI workflows trigger, **Then** jobs queue and wait for an available runner (standard GitHub Actions behavior)

---

### User Story 2 - Dependency Caching for CI Workflows (Priority: P2)

As a developer, I want pnpm dependency caching with content-addressed keys in CI workflows, so that repeated builds reuse cached dependencies and install faster.

**Why this priority**: Caching amplifies the speed gains from the runner migration and reduces unnecessary network and compute overhead on every CI run.

**Independent Test**: Can be tested by pushing two consecutive commits to a PR and verifying cache hit on the second run via workflow logs.

**Acceptance Scenarios**:

1. **Given** a CI workflow runs for the first time on a branch, **When** dependencies are installed, **Then** the pnpm store is cached with a key based on `runner.os`, `runner.arch`, and the lockfile hash
2. **Given** a cached pnpm store exists for the current lockfile, **When** a subsequent CI run triggers, **Then** the cache is restored and `pnpm install` completes significantly faster
3. **Given** the lockfile changes (new dependency added), **When** CI runs, **Then** a new cache is created with the updated key while falling back to the closest matching cache

---

### User Story 3 - Docker Release Workflow Cleanup (Priority: P3)

As a maintainer, I want the Docker release workflow modernized to use `docker/metadata-action` for tag generation instead of manual shell-based tag parsing, so that the release process is simpler, more maintainable, and consistent with the server repository.

**Why this priority**: This is a maintenance improvement that reduces complexity and aligns with the pattern already established in the server repository.

**Independent Test**: Can be tested by creating a test release and verifying that correct Docker tags are generated and pushed.

**Acceptance Scenarios**:

1. **Given** a GitHub release is published, **When** the Docker workflow triggers, **Then** Docker tags are generated using `docker/metadata-action` with semver patterns (`v{{version}}`, `v{{major}}.{{minor}}`, `v{{major}}`, `latest`)
2. **Given** a pre-release is published, **When** the Docker workflow triggers, **Then** the `latest` tag is NOT applied (only version-specific tags)
3. **Given** the old manual tag-parsing logic existed, **When** the migration is complete, **Then** the legacy `Prepare` step with shell-based tag parsing is removed

---

### Edge Cases

- What happens if a workflow uses Docker commands (e.g., K8s deploy workflows)? They must remain on `ubuntu-latest` since Docker is not available on macOS runners.
- What happens if the pnpm cache key format changes? The workflow should gracefully fall back to a partial cache match via `restore-keys`.
- What happens if `actions/setup-node` cache parameter conflicts with explicit `actions/cache`? Only one caching mechanism should be used per workflow to avoid conflicts.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: CI workflows `ci-test.yml`, `ci-build.yml`, and `ci-lint.yml` MUST use `[self-hosted, macOS, ARM64, apple-silicon, m4]` as the `runs-on` value instead of `arc-runner-set`
- **FR-002**: CI workflows MUST include an explicit `actions/cache@v4` step for the pnpm store with cache keys incorporating `runner.os`, `runner.arch`, and lockfile hash
- **FR-003**: CI workflows MUST use `restore-keys` for partial cache matching when an exact cache key is not found
- **FR-004**: The `build-release-docker-hub.yml` workflow MUST be modernized to use `docker/metadata-action@v5` for tag generation, replacing the manual shell-based `Prepare` step
- **FR-005**: The Docker release workflow MUST use updated action versions (`actions/checkout@v4`, `docker/login-action@v3`, `docker/build-push-action@v5`)
- **FR-006**: K8s deployment workflows (`build-deploy-k8s-*.yml`) MUST remain on `ubuntu-latest` unchanged
- **FR-006a**: The Docker release workflow (`build-release-docker-hub.yml`) MUST remain on `ubuntu-latest` since the Docker daemon is unavailable on macOS runners
- **FR-007**: The `actions/setup-node` `cache` parameter MUST be removed from workflows that use explicit `actions/cache` to avoid conflicts
- **FR-009**: CI workflows using Apple Silicon runners MUST configure `pnpm/action-setup@v4` with `dest: ${{ runner.temp }}/setup-pnpm` to avoid path resolution issues on macOS ARM64 (per server PR #5906 findings)
- **FR-008**: The Docker release workflow MUST NOT pass build-time secrets (e.g., `ARG_SENTRY_AUTH_TOKEN`) as Docker build arguments that leak into the image layer history — _Already satisfied by commit `f40537dd3` (PR #9378); no additional work required. Retained as a reference constraint._

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: All Node.js CI workflows (test, build, lint) execute on Apple Silicon runners as verified by runner labels in workflow logs
- **SC-002**: Dependency installation achieves a cache hit on subsequent runs (verified by `actions/cache` "cache hit" log output), resulting in faster `pnpm install` compared to the initial uncached run
- **SC-003**: Docker release workflow produces correct semver tags matching the published release version
- **SC-004**: No CI workflow regressions — all existing checks continue to pass after migration
- **SC-005**: K8s deployment workflows continue to function on `ubuntu-latest` without modification to their runner configuration

## Clarifications

### Session 2026-03-09

- Q: What is the relationship between FR-008 and the already-merged commit `f40537dd3` (PR #9378)? → A: FR-008 is already satisfied by the merged commit; no additional Docker secrets work needed. Docker workflow modernization focuses only on tag generation and action version updates.
- Q: What runner should the Docker release workflow use? → A: Stay on `ubuntu-latest` since the Docker daemon is required and unavailable on macOS runners.

## Assumptions

- Apple Silicon self-hosted runners with labels `[self-hosted, macOS, ARM64, apple-silicon, m4]` are already provisioned and available in the GitHub Actions runner group for the `alkem-io` organization (same runners used by the server repository)
- The pnpm store path on macOS ARM64 runners is consistent and cacheable
- Node.js 22.x is available for macOS ARM64 via `actions/setup-node`
- The `actions/cache` action supports macOS ARM64 runners
- The current `arc-runner-set` runners can be decommissioned after successful migration (out of scope for this feature)
