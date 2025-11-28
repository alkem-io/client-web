# Bundle Analysis

## Overview

Interactive bundle analysis using `rollup-plugin-visualizer` to visualize which modules take up the most space.

**Installed package:** `rollup-plugin-visualizer`

## Quick Start

Run any of these commands to build and analyze:

```bash
# Production build with analysis
pnpm analyze

# Development build with analysis
pnpm analyze:dev

# Production build with Sentry + analysis
pnpm analyze:sentry
```

This will:

1. Build your application
2. Generate `build/stats.html` with an interactive visualization
3. Automatically open it in your browser

## What You'll See

The visualization shows:

- **Module sizes** - Both original and gzipped/brotli sizes
- **Bundle composition** - Which packages/modules contribute most to bundle size
- **Interactive treemap** - Click to drill down into dependencies
- **Size metrics** - Stat size, parsed size, gzipped size, and brotli size

## Analyzing the Results

### Look For:

1. **Large dependencies** - Packages taking up significant space
2. **Duplicate modules** - Same module bundled multiple times
3. **Unused code** - Large imports when only small parts are needed
4. **Code splitting opportunities** - Large chunks that could be split

### Common Optimizations:

- Replace large libraries with smaller alternatives
- Use dynamic imports for code splitting
- Enable tree-shaking by using ES modules
- Check for accidentally imported test files or dev dependencies

## Manual Control

Set the `ANALYZE` environment variable:

```bash
# macOS/Linux
ANALYZE=true pnpm build

# Windows (PowerShell)
$env:ANALYZE="true"; pnpm build

# Windows (CMD)
set ANALYZE=true && pnpm build
```

## Configuration

The analyzer is configured in `vite.config.mjs` and `vite.sentry.config.mjs`:

```javascript
visualizer({
  open: true, // Auto-open in browser
  filename: 'build/stats.html',
  gzipSize: true, // Show gzipped sizes
  brotliSize: true, // Show brotli sizes
});
```

## Resources

- [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer)
- [Vite Build Guide](https://vitejs.dev/guide/build.html#build-optimizations)
