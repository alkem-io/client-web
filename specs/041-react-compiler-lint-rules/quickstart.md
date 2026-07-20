# Quickstart: React Compiler Lint Rules

## What Changed

ESLint now warns when `useMemo`, `useCallback`, or `React.memo`/`memo()` are used. The React Compiler handles memoization automatically — manual memoization is prohibited.

## For Developers

### Writing new code

Do not use `useMemo`, `useCallback`, or `memo()`. Write plain expressions and functions:

```tsx
// Before (prohibited)
const sorted = useMemo(() => items.sort(compareFn), [items]);
const handleClick = useCallback(() => doSomething(id), [id]);
export default memo(MyComponent);

// After (correct)
const sorted = items.sort(compareFn);
const handleClick = () => doSomething(id);
export default MyComponent;
```

### Handling exceptions

If you genuinely need manual memoization (e.g., third-party library lifecycle requirements), add an eslint-disable with a reason:

```tsx
// eslint-disable-next-line no-restricted-syntax -- TipTap editor requires stable callback reference across re-renders
const handleUpdate = useCallback(() => { ... }, [deps]);
```

### Running lint

```bash
# Biome (formatting + Biome rules)
pnpm lint

# ESLint (React Compiler + no-memoization rules)
pnpm eslint src/

# Both together before committing
pnpm lint && pnpm eslint src/
```

### Warn → Error transition

The rules are currently at **warn** level. Once all domain migrations (T040-T042) are complete, change line 25 in `eslint.config.mjs` from `'warn'` to `'error'`.

## Documented Exceptions

These files retain manual memoization with documented reasons:

- **MarkdownInput ecosystem** (10 files in `src/core/ui/forms/`): TipTap editor lifecycle requires stable callback/memo references
- **Class error boundaries**: React requires class components for error boundaries (compiler permanent exception)
- **GlobalErrorContext.tsx**: Singleton module-level mutation pattern
