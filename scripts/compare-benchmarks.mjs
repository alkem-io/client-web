#!/usr/bin/env node

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = path.join(__dirname, '../performance-results');

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(2)} KB`;
}

function formatMs(ms) {
  return `${ms.toFixed(0)} ms`;
}

function calculateDiff(before, after, higherIsBetter = false) {
  const diff = after - before;
  const percentChange = ((diff / before) * 100).toFixed(1);
  const sign = diff > 0 ? '+' : '';
  const isImprovement = higherIsBetter ? diff > 0 : diff < 0;
  const emoji = isImprovement ? '🟢' : (diff === 0 ? '⚪' : '🔴');
  return `${emoji} ${sign}${percentChange}% (${sign}${formatMs(diff)})`;
}

function calculateDiffBytes(before, after) {
  const diff = after - before;
  const percentChange = ((diff / before) * 100).toFixed(1);
  const sign = diff > 0 ? '+' : '';
  const emoji = diff < 0 ? '🟢' : diff > 0 ? '🔴' : '⚪';
  return `${emoji} ${sign}${percentChange}% (${sign}${formatBytes(diff)})`;
}

class BenchmarkComparator {
  constructor(beforeFile, afterFile) {
    this.beforeFile = beforeFile;
    this.afterFile = afterFile;
  }

  async load() {
    const beforePath = path.join(RESULTS_DIR, this.beforeFile);
    const afterPath = path.join(RESULTS_DIR, this.afterFile);

    this.before = JSON.parse(await fs.readFile(beforePath, 'utf-8'));
    this.after = JSON.parse(await fs.readFile(afterPath, 'utf-8'));
  }

  generateReport() {
    const report = [];

    report.push('# Performance Benchmark Comparison Report\n');
    report.push(`**Before:** ${this.before.buildName} (${new Date(this.before.timestamp).toLocaleString()})`);
    report.push(`**After:** ${this.after.buildName} (${new Date(this.after.timestamp).toLocaleString()})\n`);

    // Lighthouse metrics comparison
    report.push('## 📊 Lighthouse Performance Metrics\n');

    for (const [routeName, beforeMetrics] of Object.entries(this.before.lighthouse)) {
      const afterMetrics = this.after.lighthouse[routeName];

      report.push(`### ${routeName}\n`);
      report.push('| Metric | Before | After | Change |');
      report.push('|--------|--------|-------|--------|');

      const metrics = [
        ['Performance Score', 'performanceScore', (v) => `${v.toFixed(1)}`],
        ['First Contentful Paint', 'firstContentfulPaint', formatMs],
        ['Largest Contentful Paint', 'largestContentfulPaint', formatMs],
        ['Time to Interactive', 'timeToInteractive', formatMs],
        ['Speed Index', 'speedIndex', formatMs],
        ['Total Blocking Time', 'totalBlockingTime', formatMs],
        ['Cumulative Layout Shift', 'cumulativeLayoutShift', (v) => v.toFixed(3)],
      ];

      for (const [label, key, formatter] of metrics) {
        const before = beforeMetrics[key];
        const after = afterMetrics[key];
        if (before !== undefined && after !== undefined) {
          const higherIsBetter = key === 'performanceScore';
          report.push(`| ${label} | ${formatter(before)} | ${formatter(after)} | ${calculateDiff(before, after, higherIsBetter)} |`);
        }
      }
      report.push('');
    }

    // Bundle analysis
    report.push('## 📦 Bundle Analysis\n');
    const beforeBundle = this.before.bundleAnalysis;
    const afterBundle = this.after.bundleAnalysis;

    report.push('| Metric | Before | After | Change |');
    report.push('|--------|--------|-------|--------|');
    report.push(`| Total Requests | ${beforeBundle.totalRequests} | ${afterBundle.totalRequests} | ${afterBundle.totalRequests - beforeBundle.totalRequests} |`);
    report.push(`| JS Files | ${beforeBundle.jsFiles} | ${afterBundle.jsFiles} | ${afterBundle.jsFiles - beforeBundle.jsFiles} |`);
    report.push(`| Total JS Size | ${formatBytes(beforeBundle.totalJsSize)} | ${formatBytes(afterBundle.totalJsSize)} | ${calculateDiffBytes(beforeBundle.totalJsSize, afterBundle.totalJsSize)} |`);
    report.push(`| Total CSS Size | ${formatBytes(beforeBundle.totalCssSize)} | ${formatBytes(afterBundle.totalCssSize)} | ${calculateDiffBytes(beforeBundle.totalCssSize, afterBundle.totalCssSize)} |`);
    report.push(`| Largest JS Chunk | ${formatBytes(beforeBundle.largestJs)} | ${formatBytes(afterBundle.largestJs)} | ${calculateDiffBytes(beforeBundle.largestJs, afterBundle.largestJs)} |`);
    report.push('');

    // Runtime performance
    report.push('## ⚡ Runtime Performance\n');
    const beforeRuntime = this.before.customMetrics.runtime;
    const afterRuntime = this.after.customMetrics.runtime;

    report.push('| Metric | Before | After | Change |');
    report.push('|--------|--------|-------|--------|');

    if (beforeRuntime.memoryUsage && afterRuntime.memoryUsage) {
      report.push(`| JS Heap Used | ${formatBytes(beforeRuntime.memoryUsage.usedJSHeapSize)} | ${formatBytes(afterRuntime.memoryUsage.usedJSHeapSize)} | ${calculateDiffBytes(beforeRuntime.memoryUsage.usedJSHeapSize, afterRuntime.memoryUsage.usedJSHeapSize)} |`);
    }
    report.push(`| Long Tasks Count | ${beforeRuntime.longTasksCount} | ${afterRuntime.longTasksCount} | ${afterRuntime.longTasksCount - beforeRuntime.longTasksCount} |`);
    report.push(`| Total Blocking Time | ${formatMs(beforeRuntime.totalBlockingTime)} | ${formatMs(afterRuntime.totalBlockingTime)} | ${calculateDiff(beforeRuntime.totalBlockingTime, afterRuntime.totalBlockingTime)} |`);

    if (beforeRuntime.interactionLatency && afterRuntime.interactionLatency) {
      report.push(`| Interaction Latency | ${formatMs(beforeRuntime.interactionLatency)} | ${formatMs(afterRuntime.interactionLatency)} | ${calculateDiff(beforeRuntime.interactionLatency, afterRuntime.interactionLatency)} |`);
    }
    report.push('');

    // Memory analysis (if available)
    if (this.before.memory && this.after.memory) {
      report.push('## 🧠 Memory Analysis\n');

      // Per-route memory
      report.push('### Per-Route Memory Usage\n');
      const routes = Object.keys(this.before.memory).filter(k => !['leakAnalysis', 'summary'].includes(k));

      if (routes.length > 0) {
        report.push('| Route | Before Peak | After Peak | Change | Before Load Impact | After Load Impact |');
        report.push('|-------|-------------|------------|--------|-------------------|-------------------|');

        for (const route of routes) {
          const beforeMem = this.before.memory[route];
          const afterMem = this.after.memory[route];

          if (beforeMem && afterMem) {
            const peakChange = calculateDiffBytes(beforeMem.peakMemory, afterMem.peakMemory);
            report.push(`| ${route} | ${formatBytes(beforeMem.peakMemory)} | ${formatBytes(afterMem.peakMemory)} | ${peakChange} | ${formatBytes(beforeMem.loadImpact)} | ${formatBytes(afterMem.loadImpact)} |`);
          }
        }
        report.push('');
      }

      // Memory summary
      if (this.before.memory.summary && this.after.memory.summary) {
        report.push('### Memory Summary\n');
        report.push('| Metric | Before | After | Change |');
        report.push('|--------|--------|-------|--------|');

        const beforeSum = this.before.memory.summary;
        const afterSum = this.after.memory.summary;

        report.push(`| Average Peak Memory | ${formatBytes(beforeSum.averagePeakMemory)} | ${formatBytes(afterSum.averagePeakMemory)} | ${calculateDiffBytes(beforeSum.averagePeakMemory, afterSum.averagePeakMemory)} |`);
        report.push(`| Average Load Impact | ${formatBytes(beforeSum.averageLoadImpact)} | ${formatBytes(afterSum.averageLoadImpact)} | ${calculateDiffBytes(beforeSum.averageLoadImpact, afterSum.averageLoadImpact)} |`);
        report.push(`| Leak Risk | ${beforeSum.leakRisk} | ${afterSum.leakRisk} | ${beforeSum.leakRisk === afterSum.leakRisk ? '⚪ No change' : afterSum.leakRisk === 'LOW' ? '🟢 Improved' : '🔴 Worse'} |`);
        report.push(`| Memory Trend | ${beforeSum.trend} | ${afterSum.trend} | - |`);
        report.push('');
      }

      // Leak analysis comparison
      if (this.before.memory.leakAnalysis && this.after.memory.leakAnalysis) {
        const beforeLeak = this.before.memory.leakAnalysis;
        const afterLeak = this.after.memory.leakAnalysis;

        report.push('### Memory Leak Analysis\n');
        report.push('| Metric | Before | After | Change |');
        report.push('|--------|--------|-------|--------|');
        report.push(`| Growth over 3 cycles | ${formatBytes(beforeLeak.growthBytes)} (${beforeLeak.growthPercent?.toFixed(1)}%) | ${formatBytes(afterLeak.growthBytes)} (${afterLeak.growthPercent?.toFixed(1)}%) | ${calculateDiffBytes(beforeLeak.growthBytes, afterLeak.growthBytes)} |`);
        report.push(`| Potential Leak | ${beforeLeak.potentialLeak ? '⚠️ YES' : '✅ NO'} | ${afterLeak.potentialLeak ? '⚠️ YES' : '✅ NO'} | ${!afterLeak.potentialLeak && beforeLeak.potentialLeak ? '🟢 Fixed!' : afterLeak.potentialLeak && !beforeLeak.potentialLeak ? '🔴 New leak!' : '⚪ No change'} |`);
        report.push(`| Trend | ${beforeLeak.trend} | ${afterLeak.trend} | - |`);
        report.push('');
      }
    }

    // User journeys
    report.push('## 👤 User Journey Metrics\n');
    const beforeJourney = this.before.userJourneys.mainNavigation;
    const afterJourney = this.after.userJourneys.mainNavigation;

    if (beforeJourney && afterJourney) {
      report.push('| Metric | Before | After | Change |');
      report.push('|--------|--------|-------|--------|');
      report.push(`| Time to Interactive | ${formatMs(beforeJourney.timeToInteractive)} | ${formatMs(afterJourney.timeToInteractive)} | ${calculateDiff(beforeJourney.timeToInteractive, afterJourney.timeToInteractive)} |`);
      report.push(`| Navigation Time | ${formatMs(beforeJourney.navigationTime)} | ${formatMs(afterJourney.navigationTime)} | ${calculateDiff(beforeJourney.navigationTime, afterJourney.navigationTime)} |`);
      report.push(`| Total Journey Time | ${formatMs(beforeJourney.totalJourneyTime)} | ${formatMs(afterJourney.totalJourneyTime)} | ${calculateDiff(beforeJourney.totalJourneyTime, afterJourney.totalJourneyTime)} |`);
      report.push('');
    }

    // Summary
    report.push('## 📈 Summary\n');
    const homeBefore = this.before.lighthouse.Home;
    const homeAfter = this.after.lighthouse.Home;

    report.push('### Key Improvements\n');
    const improvements = [];
    const regressions = [];

    if (homeAfter.performanceScore > homeBefore.performanceScore) {
      improvements.push(`- Performance score improved by ${(homeAfter.performanceScore - homeBefore.performanceScore).toFixed(1)} points`);
    } else if (homeAfter.performanceScore < homeBefore.performanceScore) {
      regressions.push(`- Performance score decreased by ${(homeBefore.performanceScore - homeAfter.performanceScore).toFixed(1)} points`);
    }

    if (homeAfter.largestContentfulPaint < homeBefore.largestContentfulPaint) {
      const improvement = ((homeBefore.largestContentfulPaint - homeAfter.largestContentfulPaint) / homeBefore.largestContentfulPaint * 100).toFixed(1);
      improvements.push(`- LCP improved by ${improvement}% (${formatMs(homeBefore.largestContentfulPaint - homeAfter.largestContentfulPaint)} faster)`);
    }

    if (afterBundle.totalJsSize < beforeBundle.totalJsSize) {
      const reduction = ((beforeBundle.totalJsSize - afterBundle.totalJsSize) / beforeBundle.totalJsSize * 100).toFixed(1);
      improvements.push(`- JS bundle size reduced by ${reduction}% (${formatBytes(beforeBundle.totalJsSize - afterBundle.totalJsSize)} smaller)`);
    }

    if (afterRuntime.totalBlockingTime < beforeRuntime.totalBlockingTime) {
      const improvement = ((beforeRuntime.totalBlockingTime - afterRuntime.totalBlockingTime) / beforeRuntime.totalBlockingTime * 100).toFixed(1);
      improvements.push(`- Total Blocking Time improved by ${improvement}%`);
    }

    if (improvements.length > 0) {
      report.push(improvements.join('\n'));
      report.push('');
    }

    if (regressions.length > 0) {
      report.push('### Regressions\n');
      report.push(regressions.join('\n'));
      report.push('');
    }

    return report.join('\n');
  }

  async save() {
    const report = this.generateReport();
    const filename = `comparison-${Date.now()}.md`;
    const filepath = path.join(RESULTS_DIR, filename);
    await fs.writeFile(filepath, report);

    console.log('\n' + report);
    console.log(`\n✅ Comparison report saved to: ${filepath}\n`);
  }
}

// Main execution
const files = await fs.readdir(RESULTS_DIR);
const jsonFiles = files.filter(f => f.endsWith('.json')).sort();

if (jsonFiles.length < 2) {
  console.error('❌ Need at least 2 benchmark results to compare');
  console.log('Available files:', jsonFiles);
  process.exit(1);
}

const beforeFile = process.argv[2] || jsonFiles[jsonFiles.length - 2];
const afterFile = process.argv[3] || jsonFiles[jsonFiles.length - 1];

console.log(`\n📊 Comparing benchmarks:`);
console.log(`  Before: ${beforeFile}`);
console.log(`  After: ${afterFile}\n`);

const comparator = new BenchmarkComparator(beforeFile, afterFile);
await comparator.load();
await comparator.save();
