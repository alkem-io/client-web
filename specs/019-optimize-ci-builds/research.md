# Research: Optimize CI Builds

**Feature**: 019-optimize-ci-builds | **Date**: 2026-03-09

## 1. Apple Silicon Runner Labels

**Decision**: Use `[self-hosted, macOS, ARM64, apple-silicon, m4]` as `runs-on` value for all Node.js CI jobs.

**Rationale**: Matches the labels used by the server repository (PR #5906) and the provisioned runner group in the `alkem-io` organization. The M4 label ensures jobs land on the latest Apple Silicon hardware.

**Alternatives considered**:
- `[self-hosted, macOS, ARM64]` — Too broad; could match older Intel-to-ARM transition runners
- Keeping `arc-runner-set` — Slower builds, no ARM64 benefits

## 2. pnpm Store Caching Strategy

**Decision**: Use explicit `actions/cache@v4` with key `pnpm-${{ runner.os }}-${{ runner.arch }}-${{ hashFiles('pnpm-lock.yaml') }}` and restore-key `pnpm-${{ runner.os }}-${{ runner.arch }}-`.

**Rationale**: Content-addressed caching keyed on OS, architecture, and lockfile hash ensures cache correctness across platform changes. The restore-key prefix enables partial cache hits when the lockfile changes (new dependency added but most of the store is still valid). This is the same pattern used in the server repository.

**Alternatives considered**:
- `actions/setup-node` built-in `cache: 'pnpm'` — Cannot coexist with explicit `actions/cache`; less control over key composition and restore behavior
- No caching — Slower installs on every run; wasted bandwidth and compute

**pnpm store path**: Determined dynamically via `pnpm store path --silent` and stored in an output variable for the cache step. This is the standard approach used by the pnpm documentation and the reference implementation.

## 3. Removing `actions/setup-node` Cache Parameter

**Decision**: Remove `cache: 'pnpm'` from all `actions/setup-node` steps that use explicit `actions/cache`.

**Rationale**: The `cache` parameter in `actions/setup-node` activates its own internal caching mechanism which conflicts with an explicit `actions/cache` step — both try to save/restore the same store path, leading to race conditions or duplicate cache entries. The server PR confirmed this conflict.

## 4. pnpm/action-setup Compatibility

**Decision**: Add `dest: ${{ runner.temp }}/setup-pnpm` parameter to `pnpm/action-setup@v4` for Apple Silicon compatibility.

**Rationale**: The server PR (#5906) discovered that `pnpm/action-setup` needs an explicit `dest` on macOS ARM64 runners to avoid path resolution issues. The `runner.temp` directory is always writable and unique per job.

## 5. Docker Workflow Modernization

**Decision**: Replace the manual `Prepare` step with `docker/metadata-action@v5` for automatic semver tag generation.

**Rationale**: The current `Prepare` step contains ~25 lines of shell-based tag parsing that duplicates what `docker/metadata-action` does natively. The metadata action provides:
- Automatic semver extraction from git tags (`v{{version}}`, `v{{major}}.{{minor}}`, `v{{major}}`)
- Automatic `latest` tag management (only on non-prerelease)
- OCI-compliant labels via `${{ steps.meta.outputs.labels }}`
- Battle-tested edge cases (schedule, PR, branch naming)

**Alternatives considered**:
- Keep manual parsing — Harder to maintain, error-prone, already replaced in the server repo
- Custom composite action — Over-engineering for a single workflow

### Docker Action Version Updates

| Action | Current | Target | Reason |
|--------|---------|--------|--------|
| `actions/checkout` | `v3.0.2` | `v4` | Major version behind; security patches |
| `docker/setup-qemu-action` | `v3.0.0` | `v3` | Use floating minor for auto-patches |
| `docker/setup-buildx-action` | `v3.0.0` | `v3` | Use floating minor for auto-patches |
| `docker/login-action` | `v3.0.0` | `v3` | Use floating minor for auto-patches |
| `docker/build-push-action` | `v5.0.0` | `v5` | Use floating minor for auto-patches |
| *(new)* `docker/metadata-action` | — | `v5` | Replaces manual tag parsing |

## 6. Docker Build Args — Sentry Auth Token

**Decision**: No changes needed — already fixed by commit `f40537dd3` (PR #9378).

**Rationale**: FR-008 notes that `ARG_SENTRY_AUTH_TOKEN` was being passed as a Docker build argument, which leaked it into image layer history. This was already addressed by using `--mount=type=secret` in the Dockerfile. The Docker workflow modernization in this feature only touches tag generation and action versions.

## 7. K8s Deployment Workflows

**Decision**: Leave all `build-deploy-k8s-*.yml` workflows unchanged on `ubuntu-latest`.

**Rationale**: These workflows use Docker commands (`docker build`, `docker push`) and Kubernetes tooling that require a Linux environment. The Docker daemon is not available on macOS runners. Per FR-006, these workflows are explicitly out of scope.

## 8. Metadata-Action Tag Configuration

**Decision**: Use the following `docker/metadata-action` tag configuration:

```yaml
tags: |
  type=semver,pattern=v{{version}}
  type=semver,pattern=v{{major}}.{{minor}}
  type=semver,pattern=v{{major}}
  type=raw,value=latest,enable=${{ !github.event.release.prerelease }}
```

**Rationale**: Produces the same tag set as the current manual parsing logic:
- Full version tag: `alkemio/client-web:v1.2.3`
- Minor version tag: `alkemio/client-web:v1.2`
- Major version tag: `alkemio/client-web:v1`
- Latest tag: only for non-prerelease (matches current `if [[ $VERSION =~ ^v[0-9]... ]]` logic)

This matches the pattern established in the server repository.
