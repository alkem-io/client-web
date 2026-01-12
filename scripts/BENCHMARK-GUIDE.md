# Performance Benchmark Guide

This guide explains how to run comprehensive performance benchmarks to measure the impact of React Compiler, Vite upgrades, and chunking optimizations.

## Overview

The benchmark suite measures:

### 📊 Core Web Vitals & Loading

- **TTFB** (Time to First Byte)
- **FCP** (First Contentful Paint)
- **LCP** (Largest Contentful Paint)
- **TTI** (Time to Interactive)
- **Speed Index**
- **TBT** (Total Blocking Time)
- **CLS** (Cumulative Layout Shift)

### 📦 Bundle Analysis

- Total bundle size (JS/CSS)
- Number of chunks
- Largest chunk size
- Request waterfall
- Asset loading patterns

### ⚡ Runtime Performance

- JavaScript heap memory usage
- Long tasks (>50ms)
- Interaction latency
- Layout and script duration
- Main thread blocking

### 👤 User Journey Metrics

- Time to interactive
- Navigation performance
- Real user flow simulation

## Prerequisites

1. Install dependencies:

```bash
pnpm install
```

2. Build your application:

````bash
# For "before" and "after" build
npm run build:sentry

3. Serve your build on `localhost:3000`:

```bash
# Use any static server, e.g.:
npm run serve:dev  # This serves on port 3001, you may need to adjust

````

## Running Benchmarks

### Step 1: Benchmark the "Before" Build

1. Start the "before" build on `localhost:3000`
2. Run the benchmark:

```bash
npm run benchmark before
```

This will:

- Run Lighthouse audits on multiple routes
- Analyze bundle metrics
- Measure runtime performance
- Test user journeys
- Save results to `performance-results/before-{timestamp}.json`

### Step 2: Benchmark the "After" Build

1. Stop the previous server
2. Start the "after" build on `localhost:3000`
3. Run the benchmark:

```bash
npm run benchmark after
```

Results saved to `performance-results/after-{timestamp}.json`

### Step 3: Compare Results

```bash
npm run benchmark:compare
```

This automatically compares the two most recent benchmarks and generates a detailed markdown report with:

- Side-by-side metrics comparison
- Visual indicators (🟢 improvements, 🔴 regressions)
- Percentage changes
- Summary of key improvements

You can also specify which files to compare:

```bash
npm run benchmark:compare before-1234567890.json after-1234567891.json
```

## Customizing Benchmarks

### Adding Routes to Test

Edit `scripts/performance-benchmark.mjs`:

```javascript
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  testRoutes: [
    { path: '/', name: 'Home' },
    { path: '/welcome-space', name: 'Welcome Space' },
    { path: '/spaces', name: 'Spaces' },
    // Add your routes here
    { path: '/my-route', name: 'MyRoute' },
  ],
  waitAfterLoad: 2000,
};
```

### Adjusting Performance Thresholds

Lighthouse uses default thresholds. To customize, modify the `options` object in the `runLighthouseAudit` method.

### Adding Custom User Journeys

Extend the `measureUserJourney` method to test specific user flows:

```javascript
async measureUserJourney(journey) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(CONFIG.baseUrl);

    // Your custom journey
    await page.click('button[data-testid="login"]');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');

    // Measure metrics
    return {
      // Your custom metrics
    };
  } finally {
    await browser.close();
  }
}
```

## Understanding Results

### Performance Score

- **90-100**: Excellent
- **50-89**: Needs improvement
- **0-49**: Poor

### Key Metrics Targets

- **LCP**: < 2.5s (good), 2.5-4s (needs improvement), > 4s (poor)
- **FID/INP**: < 100ms (good), 100-300ms (needs improvement), > 300ms (poor)
- **CLS**: < 0.1 (good), 0.1-0.25 (needs improvement), > 0.25 (poor)
- **TBT**: < 200ms (good), 200-600ms (needs improvement), > 600ms (poor)

### Reading the Comparison Report

**Green indicators (🟢)**: Improvements

- Lower is better for: LCP, FCP, TTI, TBT, bundle size, memory
- Higher is better for: Performance score

**Red indicators (🔴)**: Regressions

- Investigate why metrics got worse

## Troubleshooting

### "Connection refused" errors

- Ensure your app is running on `localhost:3000`
- Check if another service is using port 3000

### Lighthouse fails

- Make sure Chromium can be launched
- Try running with `DEBUG=lighthouse:*` for verbose output

### Memory issues

- Close other applications
- Reduce number of test runs in CONFIG

### Inconsistent results

- Increase `runs` in CONFIG for better averages
- Ensure no other processes are consuming resources
- Disable browser extensions and other dev tools

## Best Practices

1. **Consistent environment**: Run benchmarks on the same machine with same conditions
2. **Multiple runs**: The default is 3 runs; increase for more statistical significance
3. **Close other apps**: Minimize background processes during benchmarks
4. **Cool down**: Wait between benchmarks to let the system stabilize
5. **Network consistency**: Benchmarks assume localhost, so network shouldn't vary
6. **Document changes**: Note what changed between builds in your git commits

## Output Files

- `performance-results/{buildName}-{timestamp}.json`: Raw benchmark data
- `performance-results/comparison-{timestamp}.md`: Comparison report
- Files are gitignored by default (add to .gitignore if needed)

## Contributing

To improve the benchmark suite:

1. Add new metrics in `performance-benchmark.mjs`
2. Update comparison logic in `compare-benchmarks.mjs`
3. Document new metrics in this guide
4. Test thoroughly before committing
