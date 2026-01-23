# Performance Benchmark

## Overview

Comprehensive performance benchmarking suite for comparing builds. Measures Lighthouse metrics, memory usage, bundle analysis, and user journey performance.

## Quick Start

### 1. Build and Serve the "Before" Version

```bash
git checkout <before-branch>
pnpm build:sentry
pnpm serve:dev
```

### 2. Run Benchmark

```bash
pnpm benchmark before
```

### 3. Build and Serve the "After" Version

```bash
git checkout <after-branch>
pnpm build:sentry
pnpm serve:dev
```

### 4. Run Benchmark

```bash
pnpm benchmark after
```

### 5. Compare Results

```bash
pnpm benchmark:compare
```

This compares the two most recent benchmark files. To compare specific files:

```bash
pnpm benchmark:compare before-<timestamp>.json after-<timestamp>.json
```

## Available Commands

| Command                        | Description                                              |
| ------------------------------ | -------------------------------------------------------- |
| `pnpm benchmark <name>`        | Full benchmark (Lighthouse + Memory + Bundle + Journeys) |
| `pnpm benchmark:compare`       | Compare two benchmark results                            |
| `pnpm benchmark:lcp <name>`    | Deep LCP analysis with resource waterfall                |
| `pnpm benchmark:memory <name>` | Detailed memory profiling                                |

## What Gets Measured

### Lighthouse Metrics

- Performance Score, FCP, LCP, TTI, Speed Index, TBT, CLS

### Memory Analysis

- Per-route peak memory and load impact
- Memory leak detection (3 navigation cycles)
- DOM nodes, event listeners, layout objects

### Bundle Analysis

- JS/CSS file counts and sizes
- Largest chunks

### User Journeys

- Time to Interactive
- Navigation timing across routes

## Output

Results are saved to `performance-results/`:

- `<name>-<timestamp>.json` - Raw benchmark data
- `comparison-<timestamp>.md` - Comparison report

## Routes Tested

- `/` (Home)
- `/welcome-space` (Welcome Space)
- `/spaces` (Spaces)

## Requirements

- Build served on `localhost:3000`
- Chrome installed (for Lighthouse)
