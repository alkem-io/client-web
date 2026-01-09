#!/usr/bin/env node

import { chromium } from 'playwright';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = path.join(__dirname, '../performance-results');

const CONFIG = {
  baseUrl: 'http://localhost:3000',
  routes: [
    { path: '/', name: 'Home' },
    { path: '/welcome-space', name: 'Welcome-Space' },
    { path: '/spaces', name: 'Spaces' },
  ],
  waitAfterLoad: 3000,
  interactionDelay: 1000,
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

class MemoryAnalyzer {
  constructor(buildName) {
    this.buildName = buildName;
    this.results = {
      buildName,
      timestamp: new Date().toISOString(),
      routes: {},
      summary: {},
      timeline: [],
    };
  }

  async captureMemorySnapshot(page, client, label) {
    // Force garbage collection if possible
    try {
      await client.send('HeapProfiler.collectGarbage');
    } catch (e) {
      // GC may not be available
    }

    // Wait a bit for GC to complete
    await page.waitForTimeout(100);

    // Get JS heap metrics from performance.memory
    const jsMemory = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        };
      }
      return null;
    });

    // Get CDP performance metrics
    const cdpMetrics = await client.send('Performance.getMetrics');
    const metricsMap = {};
    cdpMetrics.metrics.forEach(m => {
      metricsMap[m.name] = m.value;
    });

    // Get DOM metrics
    const domMetrics = await page.evaluate(() => {
      return {
        domNodes: document.getElementsByTagName('*').length,
        domDepth: (() => {
          let maxDepth = 0;
          const walk = (node, depth) => {
            if (depth > maxDepth) maxDepth = depth;
            for (const child of node.children) {
              walk(child, depth + 1);
            }
          };
          walk(document.body, 0);
          return maxDepth;
        })(),
        iframes: document.getElementsByTagName('iframe').length,
        images: document.getElementsByTagName('img').length,
        scripts: document.getElementsByTagName('script').length,
        styleSheets: document.styleSheets.length,
      };
    });

    // Get React-specific metrics if available
    const reactMetrics = await page.evaluate(() => {
      // Try to get React DevTools metrics
      const root = document.getElementById('root');
      if (root && root._reactRootContainer) {
        return {
          hasReactRoot: true,
          // Can't easily count components without React DevTools
        };
      }
      return { hasReactRoot: !!root };
    });

    return {
      label,
      timestamp: Date.now(),
      jsHeap: jsMemory,
      cdp: {
        JSHeapUsedSize: metricsMap.JSHeapUsedSize,
        JSHeapTotalSize: metricsMap.JSHeapTotalSize,
        Documents: metricsMap.Documents,
        Frames: metricsMap.Frames,
        JSEventListeners: metricsMap.JSEventListeners,
        LayoutObjects: metricsMap.LayoutObjects,
        Nodes: metricsMap.Nodes,
        Resources: metricsMap.Resources,
        ScriptDuration: metricsMap.ScriptDuration,
        TaskDuration: metricsMap.TaskDuration,
      },
      dom: domMetrics,
      react: reactMetrics,
    };
  }

  async analyzeRoute(url, routeName) {
    console.log(`\n🔍 Analyzing memory for ${routeName}...`);

    const browser = await chromium.launch({
      headless: true,
      args: [
        '--js-flags=--expose-gc',
        '--enable-precise-memory-info',
      ],
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });

    const page = await context.newPage();
    const client = await page.context().newCDPSession(page);

    await client.send('Performance.enable');
    await client.send('HeapProfiler.enable');

    const snapshots = [];

    try {
      // 1. Initial memory (before navigation)
      await page.goto('about:blank');
      snapshots.push(await this.captureMemorySnapshot(page, client, 'baseline'));
      console.log(`  ✓ Baseline captured`);

      // 2. After page load
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(CONFIG.waitAfterLoad);
      snapshots.push(await this.captureMemorySnapshot(page, client, 'after-load'));
      console.log(`  ✓ After load captured`);

      // 3. After scrolling
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight / 2);
      });
      await page.waitForTimeout(CONFIG.interactionDelay);
      snapshots.push(await this.captureMemorySnapshot(page, client, 'after-scroll'));
      console.log(`  ✓ After scroll captured`);

      // 4. After clicking buttons/interactions
      const buttons = await page.$$('button');
      if (buttons.length > 0) {
        try {
          await buttons[0].click();
          await page.waitForTimeout(CONFIG.interactionDelay);
        } catch (e) {
          // Button may not be clickable
        }
      }
      snapshots.push(await this.captureMemorySnapshot(page, client, 'after-interaction'));
      console.log(`  ✓ After interaction captured`);

      // 5. After waiting (idle memory)
      await page.waitForTimeout(3000);
      snapshots.push(await this.captureMemorySnapshot(page, client, 'idle'));
      console.log(`  ✓ Idle memory captured`);

      // Calculate memory growth
      const baseline = snapshots[0];
      const afterLoad = snapshots[1];
      const idle = snapshots[snapshots.length - 1];

      const memoryGrowth = {
        loadImpact: afterLoad.jsHeap
          ? afterLoad.jsHeap.usedJSHeapSize - baseline.jsHeap.usedJSHeapSize
          : afterLoad.cdp.JSHeapUsedSize - baseline.cdp.JSHeapUsedSize,
        idleVsLoad: idle.jsHeap
          ? idle.jsHeap.usedJSHeapSize - afterLoad.jsHeap.usedJSHeapSize
          : idle.cdp.JSHeapUsedSize - afterLoad.cdp.JSHeapUsedSize,
        totalGrowth: idle.jsHeap
          ? idle.jsHeap.usedJSHeapSize - baseline.jsHeap.usedJSHeapSize
          : idle.cdp.JSHeapUsedSize - baseline.cdp.JSHeapUsedSize,
      };

      return {
        snapshots,
        memoryGrowth,
        summary: {
          peakMemory: Math.max(...snapshots.map(s => s.jsHeap?.usedJSHeapSize || s.cdp.JSHeapUsedSize)),
          finalMemory: idle.jsHeap?.usedJSHeapSize || idle.cdp.JSHeapUsedSize,
          domNodes: idle.dom.domNodes,
          eventListeners: idle.cdp.JSEventListeners,
          layoutObjects: idle.cdp.LayoutObjects,
        },
      };
    } finally {
      await browser.close();
    }
  }

  async analyzeMemoryLeaks() {
    console.log('\n🔍 Analyzing potential memory leaks...');

    const browser = await chromium.launch({
      headless: true,
      args: ['--js-flags=--expose-gc', '--enable-precise-memory-info'],
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });

    const page = await context.newPage();
    const client = await page.context().newCDPSession(page);

    await client.send('Performance.enable');
    await client.send('HeapProfiler.enable');

    const leakAnalysis = {
      navigationCycles: [],
      potentialLeaks: false,
      memoryTrend: 'stable',
    };

    try {
      // Navigate between routes multiple times to detect leaks
      const routes = CONFIG.routes.map(r => `${CONFIG.baseUrl}${r.path}`);
      const memoryReadings = [];

      for (let cycle = 0; cycle < 3; cycle++) {
        console.log(`  Cycle ${cycle + 1}/3...`);

        for (const route of routes) {
          await page.goto(route, { waitUntil: 'networkidle' });
          await page.waitForTimeout(1000);
        }

        // Force GC and measure
        try {
          await client.send('HeapProfiler.collectGarbage');
        } catch (e) {}
        await page.waitForTimeout(500);

        const snapshot = await this.captureMemorySnapshot(page, client, `cycle-${cycle + 1}`);
        memoryReadings.push({
          cycle: cycle + 1,
          usedHeap: snapshot.jsHeap?.usedJSHeapSize || snapshot.cdp.JSHeapUsedSize,
          domNodes: snapshot.dom.domNodes,
          eventListeners: snapshot.cdp.JSEventListeners,
        });

        leakAnalysis.navigationCycles.push(snapshot);
      }

      // Analyze trend
      const firstReading = memoryReadings[0].usedHeap;
      const lastReading = memoryReadings[memoryReadings.length - 1].usedHeap;
      const growth = lastReading - firstReading;
      const growthPercent = (growth / firstReading) * 100;

      leakAnalysis.memoryReadings = memoryReadings;
      leakAnalysis.growthBytes = growth;
      leakAnalysis.growthPercent = growthPercent;

      if (growthPercent > 20) {
        leakAnalysis.potentialLeaks = true;
        leakAnalysis.memoryTrend = 'increasing';
        leakAnalysis.warning = `Memory grew by ${growthPercent.toFixed(1)}% over 3 navigation cycles`;
      } else if (growthPercent < -10) {
        leakAnalysis.memoryTrend = 'decreasing';
      } else {
        leakAnalysis.memoryTrend = 'stable';
      }

      console.log(`  ✓ Memory trend: ${leakAnalysis.memoryTrend}`);

      return leakAnalysis;
    } finally {
      await browser.close();
    }
  }

  async run() {
    console.log(`\n🧠 Running Memory Analysis for: ${this.buildName}`);
    console.log('='.repeat(60));

    // Analyze each route
    for (const route of CONFIG.routes) {
      const url = `${CONFIG.baseUrl}${route.path}`;
      this.results.routes[route.name] = await this.analyzeRoute(url, route.name);
    }

    // Analyze memory leaks
    this.results.leakAnalysis = await this.analyzeMemoryLeaks();

    // Calculate summary
    const routeNames = Object.keys(this.results.routes);
    this.results.summary = {
      averagePeakMemory:
        routeNames.reduce((sum, r) => sum + this.results.routes[r].summary.peakMemory, 0) / routeNames.length,
      averageFinalMemory:
        routeNames.reduce((sum, r) => sum + this.results.routes[r].summary.finalMemory, 0) / routeNames.length,
      totalDomNodes: routeNames.reduce((sum, r) => sum + this.results.routes[r].summary.domNodes, 0),
      averageEventListeners:
        routeNames.reduce((sum, r) => sum + this.results.routes[r].summary.eventListeners, 0) / routeNames.length,
      leakRisk: this.results.leakAnalysis.potentialLeaks ? 'HIGH' : 'LOW',
    };

    // Save results
    await this.saveResults();

    // Print report
    this.printReport();
  }

  async saveResults() {
    await fs.mkdir(RESULTS_DIR, { recursive: true });
    const filename = `memory-${this.buildName}-${Date.now()}.json`;
    const filepath = path.join(RESULTS_DIR, filename);
    await fs.writeFile(filepath, JSON.stringify(this.results, null, 2));
    console.log(`\n✅ Results saved to: ${filepath}`);
  }

  printReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 MEMORY ANALYSIS REPORT');
    console.log('='.repeat(60));

    console.log(`\nBuild: ${this.buildName}`);
    console.log(`Timestamp: ${this.results.timestamp}`);

    // Per-route analysis
    console.log('\n' + '─'.repeat(60));
    console.log('📄 PER-ROUTE MEMORY USAGE');
    console.log('─'.repeat(60));

    for (const [routeName, data] of Object.entries(this.results.routes)) {
      console.log(`\n🔹 ${routeName.toUpperCase()}`);
      console.log(`   Peak Memory:      ${formatBytes(data.summary.peakMemory)}`);
      console.log(`   Final Memory:     ${formatBytes(data.summary.finalMemory)}`);
      console.log(`   DOM Nodes:        ${data.summary.domNodes.toLocaleString()}`);
      console.log(`   Event Listeners:  ${data.summary.eventListeners.toLocaleString()}`);
      console.log(`   Layout Objects:   ${data.summary.layoutObjects.toLocaleString()}`);
      console.log(`   Memory Growth:`);
      console.log(`     - Load Impact:  ${formatBytes(data.memoryGrowth.loadImpact)}`);
      console.log(`     - Idle vs Load: ${formatBytes(data.memoryGrowth.idleVsLoad)}`);
    }

    // Leak analysis
    console.log('\n' + '─'.repeat(60));
    console.log('🔍 MEMORY LEAK ANALYSIS');
    console.log('─'.repeat(60));

    const leak = this.results.leakAnalysis;
    console.log(`\n   Memory Trend:     ${leak.memoryTrend.toUpperCase()}`);
    console.log(`   Potential Leaks:  ${leak.potentialLeaks ? '⚠️  YES' : '✅ NO'}`);
    console.log(`   Growth over 3 cycles: ${formatBytes(leak.growthBytes)} (${leak.growthPercent.toFixed(1)}%)`);

    if (leak.memoryReadings) {
      console.log('\n   Navigation Cycle Memory:');
      leak.memoryReadings.forEach(r => {
        console.log(`     Cycle ${r.cycle}: ${formatBytes(r.usedHeap)} | ${r.domNodes} nodes | ${r.eventListeners} listeners`);
      });
    }

    if (leak.warning) {
      console.log(`\n   ⚠️  WARNING: ${leak.warning}`);
    }

    // Summary
    console.log('\n' + '─'.repeat(60));
    console.log('📈 SUMMARY');
    console.log('─'.repeat(60));

    const summary = this.results.summary;
    console.log(`\n   Average Peak Memory:    ${formatBytes(summary.averagePeakMemory)}`);
    console.log(`   Average Final Memory:   ${formatBytes(summary.averageFinalMemory)}`);
    console.log(`   Average Event Listeners: ${Math.round(summary.averageEventListeners).toLocaleString()}`);
    console.log(`   Memory Leak Risk:       ${summary.leakRisk}`);

    // Recommendations
    console.log('\n' + '─'.repeat(60));
    console.log('💡 RECOMMENDATIONS');
    console.log('─'.repeat(60));

    if (summary.averagePeakMemory > 100 * 1024 * 1024) {
      console.log('\n   ⚠️  Peak memory is high (>100MB). Consider:');
      console.log('      - Lazy loading more components');
      console.log('      - Reducing bundle size');
      console.log('      - Using virtualization for long lists');
    }

    if (summary.averageEventListeners > 1000) {
      console.log('\n   ⚠️  High event listener count. Consider:');
      console.log('      - Using event delegation');
      console.log('      - Cleaning up listeners on unmount');
    }

    if (leak.potentialLeaks) {
      console.log('\n   ⚠️  Potential memory leak detected. Check:');
      console.log('      - useEffect cleanup functions');
      console.log('      - Event listener removal');
      console.log('      - Subscription cleanup');
      console.log('      - Timers and intervals');
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }
}

// Main execution
const buildName = process.argv[2] || 'current';
const analyzer = new MemoryAnalyzer(buildName);
await analyzer.run();
