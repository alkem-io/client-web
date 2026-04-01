# Bundle Analysis & Performance Benchmarks

When asked to analyze the bundle, run benchmarks, compare performance, profile memory, or investigate LCP:

## How to use this skill

Ask Claude to run benchmarks in natural language. Examples:

**Bundle analysis:**

- "Analyze the bundle"
- "Run bundle analysis with Sentry"
- "Show me the bundle size"

**Before/after benchmarks:**

- "Benchmark before and after my changes"
- "Run a before/after performance comparison"
- "Benchmark the current state as 'before'"

**Specialized analysis:**

- "Run LCP analysis"
- "Profile memory usage"
- "Run memory leak detection"

**Comparing results:**

- "Compare the last two benchmarks"
- "Compare before.json and after.json"

Claude will determine from your request which workflow to run.

---

## Workflow 1: Bundle Analysis

Use when the user wants to see bundle size, chunk breakdown, or module dependencies.

### Steps

1. Run `pnpm analyze` (production build with visualizer)
2. Output is `build/stats.html` — an interactive treemap showing module sizes

### Variants

```bash
pnpm analyze          # Production build + stats.html
pnpm analyze:dev      # Development build + stats.html
pnpm analyze:sentry   # Production build with Sentry + stats.html
```

### Important

- `pnpm analyze` is equivalent to `ANALYZE=true pnpm build` — it produces a full production build in `build/` AND generates `build/stats.html`
- Build takes ~20s and uses up to 8GB memory
- The stats.html file auto-opens in the browser after build

---

## Workflow 2: Before/After Benchmark Comparison

Use when measuring the performance impact of code changes. This is the most common workflow.

### Steps

1. **Build the "before" state** (before applying changes):
   ```bash
   pnpm build
   ```
   Or use `pnpm analyze` to also get bundle stats.

2. **Serve the build**:
   ```bash
   pnpm serve:dev
   ```
   The app is accessed at `localhost:3000` via Traefik reverse proxy. `serve:dev` binds to port 3001 but Traefik routes `localhost:3000` to it.

   Run this in the background — it blocks the terminal.

3. **Run the "before" benchmark**:
   ```bash
   pnpm benchmark before
   ```
   Results saved to `performance-results/before-{timestamp}.json`.

4. **Stop the server** (kill the `serve:dev` process).

5. **Apply changes**, then rebuild:
   ```bash
   pnpm build
   ```

6. **Serve the new build**:
   ```bash
   pnpm serve:dev
   ```

7. **Run the "after" benchmark**:
   ```bash
   pnpm benchmark after
   ```
   Results saved to `performance-results/after-{timestamp}.json`.

8. **Stop the server** and **compare results**:
   ```bash
   pnpm benchmark:compare
   ```
   Auto-compares the two most recent results. Generates `performance-results/comparison-{timestamp}.md`.

9. **Read the comparison report** and present the summary to the user.

### Default behavior

- Build names default to `before` and `after` unless the user specifies otherwise
- Comparison auto-selects the two most recent result files unless specific files are given

---

## Workflow 3: Specialized Analysis

Use when the user wants to deep-dive into a specific performance aspect.

### Prerequisites

The app must be built and served before running any of these:

```bash
pnpm build       # or pnpm analyze
pnpm serve:dev   # runs in background, app available at localhost:3000
```

### LCP Analysis

Deep-dive into Largest Contentful Paint — identifies the LCP element, resource waterfall, critical path, blocking resources, and code coverage.

```bash
pnpm benchmark:lcp {buildName}
```

Output: `performance-results/lcp-analysis-{buildName}-{timestamp}.json`

### Memory Analysis

Detailed memory profiling — per-route heap snapshots, memory growth tracking, and leak detection.

```bash
pnpm benchmark:memory {buildName}
```

Output: `performance-results/memory-{buildName}-{timestamp}.json`

---

## Workflow 4: Compare Existing Results

Use when benchmark results already exist and the user just wants a comparison.

```bash
# Auto-compare the two most recent results
pnpm benchmark:compare

# Compare specific files
pnpm benchmark:compare {file1}.json {file2}.json
```

Output: `performance-results/comparison-{timestamp}.md` — a markdown report with side-by-side metrics, improvement/regression indicators, and summary.

---

## Important notes

- The app is served at `localhost:3000` via Traefik reverse proxy. `pnpm serve:dev` binds to port 3001, but Traefik routes traffic from `localhost:3000` to it.
- All benchmark commands require the app to be running at `localhost:3000` before execution.
- `pnpm serve:dev` runs in the foreground — use `run_in_background` or `&` to keep the terminal available.
- Results are stored in the `performance-results/` directory (gitignored).
- Benchmarks use Playwright and Lighthouse — they launch headless Chromium.
- For consistent results: close other applications, minimize background processes, and allow cool-down between runs.
- Full benchmark documentation: `scripts/BENCHMARK-GUIDE.md`
- Bundle analysis documentation: `docs/bundle-analysis.md`

## Script reference

| Command | Script | Purpose |
|---------|--------|---------|
| `pnpm analyze` | `ANALYZE=true pnpm build` | Production build + `build/stats.html` |
| `pnpm benchmark {name}` | `scripts/performance-benchmark.mjs` | Full benchmark (Lighthouse, bundle, runtime, memory, user journey) |
| `pnpm benchmark:lcp {name}` | `scripts/analyze-lcp.mjs` | LCP deep-dive |
| `pnpm benchmark:memory {name}` | `scripts/analyze-memory.mjs` | Memory profiling + leak detection |
| `pnpm benchmark:compare [f1 f2]` | `scripts/compare-benchmarks.mjs` | Generate comparison markdown report |
