# Quickstart: Optimize CI Builds

**Feature**: 019-optimize-ci-builds | **Date**: 2026-03-09

## Prerequisites

- Push access to the `alkem-io/client-web` repository
- Apple Silicon self-hosted runners provisioned with labels `[self-hosted, macOS, ARM64, apple-silicon, m4]`
- GitHub Actions enabled on the repository

## Verification Steps

### 1. Node.js CI Workflows (Runner Migration + Caching)

**How to test**:

1. Push a commit to the `019-optimize-ci-builds` branch or open a PR against `develop`
2. Navigate to the Actions tab in GitHub
3. Verify each of the three CI workflows:

**ci-test.yml**:

- [ ] Job runs on a runner with label `apple-silicon` (visible in the runner info at the top of the job log)
- [ ] "Setup pnpm cache" step shows cache miss on first run, cache hit on subsequent runs
- [ ] Tests pass with the same results as on `arc-runner-set`

**ci-build.yml**:

- [ ] Job runs on an Apple Silicon runner
- [ ] pnpm cache is restored (after first run)
- [ ] Build completes successfully (`CI=false pnpm run build`)

**ci-lint.yml**:

- [ ] Job runs on an Apple Silicon runner
- [ ] pnpm cache is restored (after first run)
- [ ] Lint passes (`pnpm run lint:prod`)

### 2. Cache Effectiveness

1. Push a first commit → observe cache miss in all three workflows
2. Push a second commit (no lockfile change) → observe cache hit
3. Modify `pnpm-lock.yaml` (add/remove a dependency) → observe cache miss with restore-key fallback

### 3. Docker Release Workflow

**How to test**:

1. Create a test release (e.g., `v99.0.0-test.1` as prerelease)
2. Check the workflow run for:
   - [ ] "Docker metadata" step shows expected tags
   - [ ] For prerelease: only version-specific tags (no `latest`)
   - [ ] For full release: includes `latest`, `v{{major}}.{{minor}}`, `v{{major}}`
   - [ ] Action versions are updated (`actions/checkout@v4`, etc.)
   - [ ] Old `Prepare` step with shell parsing is removed

### 4. K8s Deployment Workflows (No Regression)

- [ ] `build-deploy-k8s-dev-hetzner.yml` still runs on `ubuntu-latest`
- [ ] `build-deploy-k8s-sandbox-hetzner.yml` still runs on `ubuntu-latest`
- [ ] `build-deploy-k8s-test-hetzner.yml` still runs on `ubuntu-latest`
- [ ] No changes to K8s workflow files

## Rollback

If Apple Silicon runners are unavailable or cause issues:

1. Revert `runs-on` to `arc-runner-set` in the three CI workflow files
2. Remove the `actions/cache` and `Get pnpm store directory` steps
3. Restore `cache: 'pnpm'` to `actions/setup-node`
4. Remove `dest` from `pnpm/action-setup`

All changes are isolated to `.github/workflows/` YAML files — no application code is affected.
