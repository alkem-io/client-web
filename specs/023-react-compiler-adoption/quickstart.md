# Quickstart: React Compiler Adoption — Remove Manual Memoization

**Feature Branch**: `023-react-compiler-adoption`

## What This Migration Does

Removes all manual `useMemo`, `useCallback`, and `React.memo` calls from the codebase and relies entirely on the React Compiler for automatic optimization. The compiler is already active in both dev and production builds.

## Prerequisites

- Node >= 22.0.0, pnpm >= 10.17.1
- The project builds and tests pass on `develop` branch

## How to Verify the Compiler Is Active

```bash
# Check compiler ESLint rule passes (should report 0 errors for compiler-compatible code)
pnpm eslint --no-error-on-unmatched-pattern "src/**/*.tsx"

# Build the project (compiler runs during build)
pnpm build

# Run tests
pnpm vitest run
```

## Removal Pattern

### useMemo → plain expression

```typescript
// Before
const filtered = useMemo(() => items.filter(i => i.active), [items]);

// After
const filtered = items.filter(i => i.active);
```

### useCallback → plain function

```typescript
// Before
const handleClick = useCallback(() => { doThing(id); }, [id]);

// After
const handleClick = () => { doThing(id); };
```

### React.memo → plain export

```typescript
// Before
export const MyComponent = memo<Props>(({ value }) => { ... });

// After
export const MyComponent = ({ value }: Props) => { ... };
```

## Validation After Each Batch

```bash
# 1. Run tests
pnpm vitest run

# 2. Check compiler compatibility
pnpm eslint --no-error-on-unmatched-pattern "src/**/*.tsx" "src/**/*.ts"

# 3. Type check
pnpm tsc --noEmit

# 4. Build
pnpm build

# 5. Bundle analysis (optional, for size comparison)
pnpm analyze
```

## Migration Order

1. **Phase 1**: Fix compiler bail-outs (6 known files)
2. **Phase 2**: Core/shared layer (`src/core/`, `src/domain/shared/`)
3. **Phase 3**: Domain components (18 subdirectories under `src/domain/`)
4. **Phase 4**: Add lint rules to prevent reintroduction

## Key Files

| File | Purpose |
| ---- | ------- |
| `vite.config.mjs` | React Compiler babel plugin config |
| `eslint.config.mjs` | Compiler ESLint rule + future no-restricted-syntax rules |
| `biome.json` | Primary linter (useExhaustiveDependencies is disabled) |
| `.lintstagedrc.json` | Pre-commit hooks (Biome only) |

## Important Notes

- The React Compiler handles memoization automatically at a finer granularity than manual hooks
- Do NOT re-add `useMemo`/`useCallback` "just in case" — trust the compiler, profile first
- Class error boundaries (2 files) are permanent exceptions — React requires class components for error boundaries
- Each documented exception needs an `eslint-disable` comment with a reason
