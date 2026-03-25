# React Compiler

## Overview

The React Compiler automatically optimizes React components by adding memoization, eliminating the need for manual `useMemo`, `useCallback`, and `React.memo`.

**Installed packages:**

- `babel-plugin-react-compiler` - Babel plugin for compilation
- `eslint-plugin-react-compiler` - ESLint rule to detect optimization issues

## Configuration

**Vite configs** (`vite.config.mjs`, `vite.sentry.config.mjs`):

```javascript
react({
  babel: {
    plugins: ['babel-plugin-react-compiler'],
  },
});
```

**ESLint** (`eslint.config.mjs`):

```javascript
'react-compiler/react-compiler': 'error',
```

## How It Works

The compiler automatically detects and optimizes:

- **Components**: PascalCase functions returning JSX
- **Hooks**: Functions starting with `use` that call hooks

It adds memoization logic during build to cache results when dependencies haven't changed.

## Benefits

- Automatic performance optimization without manual memoization
- Cleaner code with less boilerplate
- React 19 performance improvements

## Usage

No code changes needed! The compiler works automatically. Run `pnpm lint` to check for optimization issues.

## Troubleshooting

**Temporary opt-out** (if a component has issues):

```javascript
function ProblematicComponent() {
  'use no memo';
  // Component code
}
```

**Common issues**: Violating [Rules of React](https://react.dev/reference/rules) (e.g., conditional hooks, mutating props)

## Resources

- [React Compiler Docs](https://react.dev/learn/react-compiler)
- [Rules of React](https://react.dev/reference/rules)
