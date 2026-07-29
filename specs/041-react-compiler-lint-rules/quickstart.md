# Quickstart: React Compiler Lint Rules

## What Changed

Manual memoization is **prohibited and hard-enforced**. ESLint fails (error, not warn) on
`useMemo`, `useCallback`, `memo`/`React.memo`, `PureComponent`, and `shouldComponentUpdate`
— in both the bare (`useMemo(...)`) and namespaced (`React.useMemo(...)`) forms. The React
Compiler handles memoization and render bail-outs automatically. Because the pre-commit hook
runs `pnpm eslint .`, a new usage is **blocked at commit time**.

## For Developers

### Writing new code

Write plain expressions and functions — let the compiler optimize:

```tsx
// Before (fails lint)
const sorted = useMemo(() => items.sort(compareFn), [items]);
const handleClick = useCallback(() => doSomething(id), [id]);
export default memo(MyComponent);

// After (correct)
const sorted = items.sort(compareFn);
const handleClick = () => doSomething(id);
export default MyComponent;
```

### Handling a genuine exception

If a third-party library truly needs a stable reference, add an `eslint-disable` **with a
reason**. The reason is mandatory and itself linted — a bare disable fails
(`@eslint-community/eslint-comments/require-description`):

```tsx
// eslint-disable-next-line no-restricted-syntax -- TipTap editor requires a stable callback reference across re-renders
const handleUpdate = useCallback(() => { ... }, [deps]);
```

If you later remove the memoization, delete the disable comment too — a disable that no
longer suppresses anything also fails lint (`reportUnusedDisableDirectives`).

### Running lint

```bash
pnpm lint          # typecheck:native + biome ci + eslint . (what CI runs)
pnpm eslint .      # just the ESLint pass (React Compiler + no-memoization rules)
```

`pnpm lint` already includes the ESLint pass, so it is the single command to run before
committing.

### Checking React Compiler coverage

```bash
pnpm compiler:healthcheck   # % of src/ components the compiler optimizes (KPI; expect ~100%)
```

## Documented Exceptions

The rule is at **error** level with every remaining usage annotated — currently **28
`no-restricted-syntax` exceptions across 13 files** (plus one `react-compiler` exception in
`GlobalErrorContext.tsx`). They fall into two groups:

- **Genuinely necessary** (real technical reason in the comment): the collaborative editor
  (Yjs `Y.Doc`, TipTap provider/extensions in `useCollaboration.ts`), Apollo `onError` links
  and `ApolloClient` stability (`src/core/apollo/**`), Excalidraw `debounce` wrappers and
  effect-dependency object stability (`src/domain/common/whiteboard/excalidraw/**`), the
  cookie-consent ref callback (`App.tsx`).
- **Retained pending React Compiler migration** (CRD-hook handler APIs in
  `src/main/crdPages/**` and `src/main/pushNotifications/**`): technically redundant with the
  compiler; a follow-up migration can remove them and shrink the exception surface.

> Note: `src/crd/app/**` (prototype/demo pages) is excluded from ESLint (`ignores` in
> `eslint.config.mjs`), so the policy does not apply there.
