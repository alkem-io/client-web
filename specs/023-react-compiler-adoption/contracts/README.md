# Contracts: React Compiler Adoption

This feature is a code migration/refactoring task that does not introduce new APIs, endpoints, or external contracts.

## Affected Contracts

### ESLint Configuration Contract

The only external-facing contract change is the addition of lint rules to `eslint.config.mjs`:

**New rules** (added in Phase 4):
- `no-restricted-syntax` with selectors for `useMemo`, `useCallback`, `React.memo`
- Initially set to `warn`, transitioning to `error` after migration completes

### No GraphQL Changes

- No `.graphql` files are modified
- No schema changes
- No `pnpm codegen` required

### No API Changes

- No backend API changes
- No new HTTP endpoints
- No WebSocket protocol changes

## File Modification Contract

The migration modifies `.ts` and `.tsx` files only. Changes are mechanical:

1. **Remove imports**: `useMemo`, `useCallback`, `memo` from `react`
2. **Unwrap call sites**: Replace memoization wrappers with plain expressions
3. **Clean comments**: Remove orphaned eslint-disable comments
4. **Update exports**: Replace `memo(Component)` with `Component`

No functional behavior changes. The React Compiler produces equivalent optimized output.
