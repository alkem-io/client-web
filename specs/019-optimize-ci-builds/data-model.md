# Data Model: Optimize CI Builds

**Feature**: 019-optimize-ci-builds | **Date**: 2026-03-09

> This feature modifies CI workflow files only — no application data models are involved. This document defines the workflow change matrix and configuration schema.

## Workflow Change Matrix

| Workflow File                          | Current Runner   | Target Runner                                    | Caching                | Docker Modernization                                    | Status        |
| -------------------------------------- | ---------------- | ------------------------------------------------ | ---------------------- | ------------------------------------------------------- | ------------- |
| `ci-test.yml`                          | `arc-runner-set` | `[self-hosted, macOS, ARM64, apple-silicon, m4]` | Add `actions/cache@v4` | N/A                                                     | **MODIFY**    |
| `ci-build.yml`                         | `arc-runner-set` | `[self-hosted, macOS, ARM64, apple-silicon, m4]` | Add `actions/cache@v4` | N/A                                                     | **MODIFY**    |
| `ci-lint.yml`                          | `arc-runner-set` | `[self-hosted, macOS, ARM64, apple-silicon, m4]` | Add `actions/cache@v4` | N/A                                                     | **MODIFY**    |
| `build-release-docker-hub.yml`         | `ubuntu-latest`  | `ubuntu-latest` (unchanged)                      | N/A                    | Replace `Prepare` step with `docker/metadata-action@v5` | **REWRITE**   |
| `build-deploy-k8s-dev-hetzner.yml`     | `ubuntu-latest`  | `ubuntu-latest` (unchanged)                      | N/A                    | N/A                                                     | **UNCHANGED** |
| `build-deploy-k8s-sandbox-hetzner.yml` | `ubuntu-latest`  | `ubuntu-latest` (unchanged)                      | N/A                    | N/A                                                     | **UNCHANGED** |
| `build-deploy-k8s-test-hetzner.yml`    | `ubuntu-latest`  | `ubuntu-latest` (unchanged)                      | N/A                    | N/A                                                     | **UNCHANGED** |

## CI Workflow Template (Node.js Jobs)

The three Node.js CI workflows (`ci-test`, `ci-build`, `ci-lint`) follow a common step pattern after modification:

```yaml
jobs:
  <job-name>:
    runs-on: [self-hosted, macOS, ARM64, apple-silicon, m4]
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          dest: ${{ runner.temp }}/setup-pnpm

      - name: Get pnpm store directory
        id: pnpm-cache
        shell: bash
        run: echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_OUTPUT

      - name: Setup pnpm cache
        uses: actions/cache@v4
        with:
          path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
          key: pnpm-${{ runner.os }}-${{ runner.arch }}-${{ hashFiles('pnpm-lock.yaml') }}
          restore-keys: |
            pnpm-${{ runner.os }}-${{ runner.arch }}-

      - name: Setup Node.js
        uses: actions/setup-node@v6.2.0
        with:
          node-version: '22.22.0'
          # NOTE: 'cache' parameter intentionally omitted — using explicit actions/cache above

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: <task-specific step>
        run: <task-specific command>
```

### Key Differences from Current Workflows

1. **`runs-on`**: `arc-runner-set` → `[self-hosted, macOS, ARM64, apple-silicon, m4]`
2. **`pnpm/action-setup`**: Added `dest: ${{ runner.temp }}/setup-pnpm` for macOS ARM64 compatibility
3. **New step**: `Get pnpm store directory` — captures store path for cache
4. **New step**: `Setup pnpm cache` — explicit `actions/cache@v4` with content-addressed key
5. **`actions/setup-node`**: Removed `cache: 'pnpm'` parameter to avoid conflict with explicit cache

## Docker Release Workflow Schema

The modernized `build-release-docker-hub.yml` replaces the manual `Prepare` step:

### Before (removed)

```yaml
- name: Prepare
  id: prep
  run: |
    # ~25 lines of shell-based tag parsing
    DOCKER_IMAGE=alkemio/client-web
    VERSION=noop
    # ... complex conditional logic ...
    echo "tags=${TAGS}" >> $GITHUB_OUTPUT
```

### After (replacement)

```yaml
- name: Docker metadata
  id: meta
  uses: docker/metadata-action@v5
  with:
    images: alkemio/client-web
    tags: |
      type=semver,pattern=v{{version}}
      type=semver,pattern=v{{major}}.{{minor}}
      type=semver,pattern=v{{major}}
      type=raw,value=latest,enable=${{ !github.event.release.prerelease }}

- name: Build and push
  uses: docker/build-push-action@v5
  with:
    tags: ${{ steps.meta.outputs.tags }}
    labels: ${{ steps.meta.outputs.labels }}
    # ... rest of build config
```

### Tag Output Comparison

| Release Type                 | Old Manual Tags                  | New Metadata-Action Tags               |
| ---------------------------- | -------------------------------- | -------------------------------------- |
| `v1.2.3` (release)           | `v1.2.3`, `v1.2`, `v1`, `latest` | `v1.2.3`, `v1.2`, `v1`, `latest`       |
| `v1.2.3-beta.1` (prerelease) | `v1.2.3-beta.1` only             | `v1.2.3-beta.1` only (latest disabled) |
