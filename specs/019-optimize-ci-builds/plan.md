# Implementation Plan: Optimize CI Builds

**Branch**: `019-optimize-ci-builds` | **Date**: 2026-03-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/019-optimize-ci-builds/spec.md`

## Summary

Migrate Node.js CI workflows (test, build, lint) from `arc-runner-set` to Apple Silicon self-hosted runners, add pnpm dependency caching with content-addressed keys, and modernize the Docker release workflow to use `docker/metadata-action` for tag generation. Reference implementation: [alkem-io/server#5906](https://github.com/alkem-io/server/pull/5906).

## Technical Context

**Language/Version**: GitHub Actions YAML workflows; Node.js 22.22.0 (via `actions/setup-node`)
**Primary Dependencies**: `actions/checkout@v4`, `actions/setup-node@v6`, `actions/cache@v4`, `pnpm/action-setup@v4`, `docker/metadata-action@v5`, `docker/build-push-action@v5`
**Storage**: N/A (CI workflows only)
**Testing**: Manual verification via workflow run logs (runner labels, cache hits, Docker tags)
**Target Platform**: GitHub Actions — Apple Silicon self-hosted runners (macOS ARM64) for Node.js jobs; `ubuntu-latest` for Docker/K8s jobs
**Project Type**: CI/CD infrastructure (workflow YAML files only)
**Performance Goals**: Faster CI execution via native ARM64 performance + pnpm store caching; no specific latency targets
**Constraints**: Docker daemon unavailable on macOS runners → Docker workflows must stay on `ubuntu-latest`; `actions/setup-node` `cache` param must be removed when explicit `actions/cache` is used
**Scale/Scope**: 7 workflow files; 3 modified (ci-test, ci-build, ci-lint), 1 rewritten (build-release-docker-hub), 3 unchanged (k8s deploy workflows)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                          | Applicable? | Status | Notes                                                                                                                  |
| ---------------------------------- | ----------- | ------ | ---------------------------------------------------------------------------------------------------------------------- |
| I. Domain-Driven Boundaries        | No          | N/A    | CI workflows are infrastructure, not domain code                                                                       |
| II. React 19 Concurrent UX         | No          | N/A    | No React components affected                                                                                           |
| III. GraphQL Contract Fidelity     | No          | N/A    | No GraphQL schema changes                                                                                              |
| IV. State & Side-Effect Isolation  | No          | N/A    | No application state changes                                                                                           |
| V. Experience Quality & Safeguards | Partially   | PASS   | CI workflows SHOULD enforce linting, testing, and type generation (Governance §CI). All existing checks are preserved. |
| Architecture Standards §4          | No          | N/A    | No Vite/build config changes                                                                                           |
| Engineering Workflow §5            | No          | N/A    | No debugging/root cause changes                                                                                        |

**Gate Result**: PASS — This feature modifies only CI workflow files. No constitution principles are violated. Existing CI checks (lint, test, build) continue to run with identical commands.

**Post-Design Re-check**: PASS — No application code is modified. Constitution compliance is maintained.

## Project Structure

### Documentation (this feature)

```text
specs/019-optimize-ci-builds/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (workflow change matrix)
├── quickstart.md        # Phase 1 output (verification guide)
└── contracts/           # Phase 1 output (N/A — no API contracts)
```

### Source Code (repository root)

```text
.github/workflows/
├── ci-test.yml                          # MODIFIED: runner + caching
├── ci-build.yml                         # MODIFIED: runner + caching
├── ci-lint.yml                          # MODIFIED: runner + caching
├── build-release-docker-hub.yml         # REWRITTEN: metadata-action tags
├── build-deploy-k8s-dev-hetzner.yml     # UNCHANGED
├── build-deploy-k8s-sandbox-hetzner.yml # UNCHANGED
└── build-deploy-k8s-test-hetzner.yml    # UNCHANGED
```

**Structure Decision**: No new files or directories. All changes are in-place modifications to existing workflow YAML files under `.github/workflows/`.

## Complexity Tracking

No constitution violations — this section is intentionally empty.
