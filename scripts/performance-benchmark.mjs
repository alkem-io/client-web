#!/usr/bin/env node

import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = path.join(__dirname, '../performance-results');

const CONFIG = {
  baseUrl: 'http://localhost:3000',
  testRoutes: [
    { path: '/', name: 'Home' },
    { path: '/welcome-space', name: 'Welcome Space' },
    { path: '/spaces', name: 'Spaces' },
  ],
  waitAfterLoad: 2000, // Wait for dynamic content
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

class PerformanceBenchmark {
  constructor(buildName) {
    this.buildName = buildName;
    this.results = {
      buildName,
      timestamp: new Date().toISOString(),
      lighthouse: {},
      customMetrics: {},
      userJourneys: {},
      bundleAnalysis: {},
      memory: {},
    };
  }

  async runLighthouseAudit(url, name) {
    console.log(`  Running Lighthouse audit for ${name}...`);

    let chrome;
    try {
      // Launch Chrome with debugging enabled
      chrome = await chromeLauncher.launch({
        chromeFlags: ['--headless', '--disable-gpu'],
      });

      const options = {
        port: chrome.port,
        output: 'json',
        onlyCategories: ['performance'],
        screenEmulation: {
          mobile: false,
          width: 1920,
          height: 1080,
          deviceScaleFactor: 1,
        },
        formFactor: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10 * 1024,
          cpuSlowdownMultiplier: 1,
        },
      };

      const runnerResult = await lighthouse(url, options);

      if (!runnerResult || !runnerResult.lhr) {
        throw new Error('Lighthouse audit failed');
      }

      const audits = runnerResult.lhr.audits;
      const metrics = {
        performanceScore: (runnerResult.lhr.categories?.performance?.score ?? 0) * 100,
        firstContentfulPaint: audits['first-contentful-paint']?.numericValue,
        largestContentfulPaint: audits['largest-contentful-paint']?.numericValue,
        timeToInteractive: audits['interactive']?.numericValue,
        speedIndex: audits['speed-index']?.numericValue,
        totalBlockingTime: audits['total-blocking-time']?.numericValue,
        cumulativeLayoutShift: audits['cumulative-layout-shift']?.numericValue,
        firstMeaningfulPaint: audits['first-meaningful-paint']?.numericValue,
      };

      return metrics;
    } catch (error) {
      console.error(`  Error running Lighthouse for ${name}:`, error.message);
      return null;
    } finally {
      if (chrome) {
        await chrome.kill();
      }
    }
  }

  async measureBundleMetrics() {
    console.log('  Analyzing bundle and network metrics...');

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const resources = [];
    page.on('response', async (response) => {
      const url = response.url();
      const headers = response.headers();

      resources.push({
        url,
        status: response.status(),
        contentType: headers['content-type'] || '',
        contentLength: parseInt(headers['content-length'] || '0', 10),
      });
    });

    try {
      await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle' });
      await page.waitForTimeout(CONFIG.waitAfterLoad);

      const jsResources = resources.filter(r => r.contentType.includes('javascript'));
      const cssResources = resources.filter(r => r.contentType.includes('css'));

      return {
        totalRequests: resources.length,
        jsFiles: jsResources.length,
        cssFiles: cssResources.length,
        totalJsSize: jsResources.reduce((sum, r) => sum + r.contentLength, 0),
        totalCssSize: cssResources.reduce((sum, r) => sum + r.contentLength, 0),
        totalSize: resources.reduce((sum, r) => sum + r.contentLength, 0),
        largestJs: jsResources.length > 0 ? Math.max(...jsResources.map(r => r.contentLength)) : 0,
        chunks: jsResources.map(r => ({
          name: r.url.split('/').pop(),
          size: r.contentLength,
        })),
      };
    } finally {
      await browser.close();
    }
  }

  async measureRuntimePerformance() {
    console.log('  Measuring runtime performance...');

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
      const performanceMetrics = [];
      const longTasks = [];

      // Enable Chrome DevTools Protocol
      const client = await page.context().newCDPSession(page);
      await client.send('Performance.enable');

      // Track long tasks + interaction latencies (Event Timing API → INP proxy)
      await page.addInitScript(() => {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              window.__longTasks = window.__longTasks || [];
              window.__longTasks.push({
                duration: entry.duration,
                startTime: entry.startTime,
              });
            }
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });

        // INP is derived from Event Timing entries with a real interactionId. Each
        // entry's `duration` is input→next-paint latency (the thing the React Compiler's
        // fewer re-renders should improve).
        window.__interactions = [];
        const eventObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.interactionId > 0) {
              window.__interactions.push({ duration: entry.duration, name: entry.name });
            }
          }
        });
        eventObserver.observe({ type: 'event', buffered: true, durationThreshold: 16 });
      });

      await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle' });
      await page.waitForTimeout(CONFIG.waitAfterLoad);

      // Get memory metrics
      const metrics = await client.send('Performance.getMetrics');
      const memoryUsage = await page.evaluate(() => {
        if (performance.memory) {
          return {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          };
        }
        return null;
      });

      // Get long tasks
      const tasks = await page.evaluate(() => window.__longTasks || []);

      // Drive a handful of real interactions so the Event Timing observer captures
      // input→next-paint latencies. Trusted Playwright input dispatches genuine events.
      const interactiveSelectors = ['button', 'a[href]', '[role="button"]', 'input', '[tabindex]'];
      for (const selector of interactiveSelectors) {
        const handle = await page.$(selector);
        if (!handle) continue;
        try {
          await handle.click({ timeout: 1000, trial: false });
          await page.keyboard.press('Tab');
          await page.waitForTimeout(120); // let a frame paint so `duration` is recorded
        } catch {
          // element not actionable (covered/detached) — skip, try the next selector
        }
      }
      await page.waitForTimeout(200);

      // INP proxy: the worst interaction latency observed this session (lab runs have few
      // interactions, so max ≈ the p98 INP that field data would report).
      const interactions = await page.evaluate(() => window.__interactions || []);
      const interactionDurations = interactions.map(i => i.duration).sort((a, b) => a - b);
      const inp = interactionDurations.length ? interactionDurations[interactionDurations.length - 1] : null;
      const interactionLatency =
        interactionDurations.length
          ? interactionDurations.reduce((sum, d) => sum + d, 0) / interactionDurations.length
          : null;

      return {
        memoryUsage,
        longTasksCount: tasks.length,
        totalBlockingTime: tasks.reduce((sum, task) => sum + Math.max(0, task.duration - 50), 0),
        inp,
        interactionCount: interactionDurations.length,
        interactionLatency, // mean interaction latency (ms); was a single-click wall-clock before
        layoutDuration: metrics.metrics.find(m => m.name === 'LayoutDuration')?.value,
        scriptDuration: metrics.metrics.find(m => m.name === 'ScriptDuration')?.value,
      };
    } finally {
      await browser.close();
    }
  }

  async measureUserJourney(journey) {
    console.log(`  Measuring user journey: ${journey.name}...`);

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
      const marks = [];

      await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle' });
      marks.push({ name: 'initial-load', time: Date.now() });

      // Wait for app to be interactive
      await page.waitForTimeout(CONFIG.waitAfterLoad);
      marks.push({ name: 'app-interactive', time: Date.now() });

      // Simulate navigation
      const navigationStart = Date.now();
      await page.click('a[href*="spaces"]').catch(() => {});
      await page.waitForTimeout(1000);
      marks.push({ name: 'navigation-complete', time: Date.now() });

      // Calculate durations
      return {
        timeToInteractive: marks[1].time - marks[0].time,
        navigationTime: marks[2].time - marks[1].time,
        totalJourneyTime: marks[marks.length - 1].time - marks[0].time,
      };
    } catch (error) {
      console.error(`Error in journey ${journey.name}:`, error.message);
      return null;
    } finally {
      await browser.close();
    }
  }

  async captureMemorySnapshot(page, client, label) {
    // Force garbage collection if possible
    try {
      await client.send('HeapProfiler.collectGarbage');
    } catch (e) {
      // GC may not be available
    }
    await page.waitForTimeout(100);

    // Get JS heap metrics
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
        iframes: document.getElementsByTagName('iframe').length,
        images: document.getElementsByTagName('img').length,
        scripts: document.getElementsByTagName('script').length,
      };
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
      },
      dom: domMetrics,
    };
  }

  async measureMemoryPerRoute(url, routeName) {
    console.log(`  Analyzing memory for ${routeName}...`);

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

    try {
      // Baseline
      await page.goto('about:blank');
      const baseline = await this.captureMemorySnapshot(page, client, 'baseline');

      // After load
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(CONFIG.waitAfterLoad);
      const afterLoad = await this.captureMemorySnapshot(page, client, 'after-load');

      // After interactions
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(1000);
      const afterInteraction = await this.captureMemorySnapshot(page, client, 'after-interaction');

      // Idle (after GC)
      await page.waitForTimeout(2000);
      const idle = await this.captureMemorySnapshot(page, client, 'idle');

      const getHeapSize = (snapshot) => snapshot.jsHeap?.usedJSHeapSize || snapshot.cdp.JSHeapUsedSize;

      return {
        baseline: getHeapSize(baseline),
        afterLoad: getHeapSize(afterLoad),
        afterInteraction: getHeapSize(afterInteraction),
        idle: getHeapSize(idle),
        loadImpact: getHeapSize(afterLoad) - getHeapSize(baseline),
        peakMemory: Math.max(getHeapSize(afterLoad), getHeapSize(afterInteraction), getHeapSize(idle)),
        domNodes: idle.dom.domNodes,
        eventListeners: idle.cdp.JSEventListeners,
        layoutObjects: idle.cdp.LayoutObjects,
      };
    } finally {
      await browser.close();
    }
  }

  async measureMemoryLeaks() {
    console.log('  Checking for memory leaks...');

    const browser = await chromium.launch({
      headless: true,
      args: ['--js-flags=--expose-gc', '--enable-precise-memory-info'],
    });

    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    const client = await page.context().newCDPSession(page);

    await client.send('Performance.enable');
    await client.send('HeapProfiler.enable');

    const readings = [];

    try {
      const routes = CONFIG.testRoutes.map(r => `${CONFIG.baseUrl}${r.path}`);

      for (let cycle = 0; cycle < 3; cycle++) {
        for (const route of routes) {
          await page.goto(route, { waitUntil: 'networkidle' });
          await page.waitForTimeout(500);
        }

        try {
          await client.send('HeapProfiler.collectGarbage');
        } catch (e) {}
        await page.waitForTimeout(300);

        const snapshot = await this.captureMemorySnapshot(page, client, `cycle-${cycle + 1}`);
        readings.push({
          cycle: cycle + 1,
          usedHeap: snapshot.jsHeap?.usedJSHeapSize || snapshot.cdp.JSHeapUsedSize,
          domNodes: snapshot.dom.domNodes,
          eventListeners: snapshot.cdp.JSEventListeners,
        });
      }

      const firstReading = readings[0].usedHeap;
      const lastReading = readings[readings.length - 1].usedHeap;
      const growth = lastReading - firstReading;
      const growthPercent = (growth / firstReading) * 100;

      return {
        readings,
        growthBytes: growth,
        growthPercent,
        potentialLeak: growthPercent > 20,
        trend: growthPercent > 20 ? 'increasing' : growthPercent < -10 ? 'decreasing' : 'stable',
      };
    } finally {
      await browser.close();
    }
  }

  async run() {
    console.log(`\n🚀 Running performance benchmark for: ${this.buildName}\n`);

    // 1. Lighthouse audits
    console.log('📊 Running Lighthouse audits...');
    for (const route of CONFIG.testRoutes) {
      const url = `${CONFIG.baseUrl}${route.path}`;
      this.results.lighthouse[route.name] = await this.runLighthouseAudit(url, route.name);
    }

    // 2. Bundle analysis
    console.log('\n📦 Analyzing bundle metrics...');
    this.results.bundleAnalysis = await this.measureBundleMetrics();

    // 3. Runtime performance
    console.log('\n⚡ Measuring runtime performance...');
    this.results.customMetrics.runtime = await this.measureRuntimePerformance();

    // 4. Memory analysis
    console.log('\n🧠 Measuring memory usage...');
    for (const route of CONFIG.testRoutes) {
      const url = `${CONFIG.baseUrl}${route.path}`;
      this.results.memory[route.name] = await this.measureMemoryPerRoute(url, route.name);
    }
    this.results.memory.leakAnalysis = await this.measureMemoryLeaks();

    // Calculate memory summary
    const routeNames = CONFIG.testRoutes.map(r => r.name);
    this.results.memory.summary = {
      averagePeakMemory: routeNames.reduce((sum, r) => sum + (this.results.memory[r]?.peakMemory || 0), 0) / routeNames.length,
      averageLoadImpact: routeNames.reduce((sum, r) => sum + (this.results.memory[r]?.loadImpact || 0), 0) / routeNames.length,
      leakRisk: this.results.memory.leakAnalysis?.potentialLeak ? 'HIGH' : 'LOW',
      trend: this.results.memory.leakAnalysis?.trend || 'unknown',
    };

    // 5. User journeys
    console.log('\n👤 Measuring user journeys...');
    const journey = { name: 'main-navigation' };
    this.results.userJourneys.mainNavigation = await this.measureUserJourney(journey);

    // Save results
    await this.saveResults();

    // Print summary
    this.printSummary();

    console.log(`\n✅ Benchmark complete! Results saved to: ${RESULTS_DIR}\n`);
  }

  printSummary() {
    console.log('\n' + '─'.repeat(60));
    console.log('📈 BENCHMARK SUMMARY');
    console.log('─'.repeat(60));

    // Lighthouse summary
    console.log('\n🎯 Lighthouse Scores:');
    for (const [route, metrics] of Object.entries(this.results.lighthouse)) {
      if (metrics) {
        console.log(`   ${route}: ${metrics.performanceScore}/100 | LCP: ${Math.round(metrics.largestContentfulPaint)}ms`);
      }
    }

    // Memory summary
    console.log('\n🧠 Memory Usage:');
    for (const route of CONFIG.testRoutes) {
      const mem = this.results.memory[route.name];
      if (mem) {
        console.log(`   ${route.name}: Peak ${formatBytes(mem.peakMemory)} | Load Impact: ${formatBytes(mem.loadImpact)}`);
      }
    }

    const leak = this.results.memory.leakAnalysis;
    if (leak) {
      console.log(`   Leak Risk: ${leak.potentialLeak ? '⚠️  HIGH' : '✅ LOW'} (${leak.trend}, ${leak.growthPercent?.toFixed(1)}% growth)`);
    }

    // Runtime / interaction summary
    const runtime = this.results.customMetrics?.runtime;
    if (runtime) {
      console.log('\n⚡ Runtime:');
      const inp = runtime.inp != null ? `${Math.round(runtime.inp)}ms` : 'n/a';
      const mean = runtime.interactionLatency != null ? `${Math.round(runtime.interactionLatency)}ms` : 'n/a';
      console.log(`   INP (worst interaction): ${inp} over ${runtime.interactionCount ?? 0} interactions | mean: ${mean}`);
      console.log(`   Long tasks: ${runtime.longTasksCount} | TBT: ${Math.round(runtime.totalBlockingTime)}ms`);
    }

    // Bundle summary
    const bundle = this.results.bundleAnalysis;
    if (bundle) {
      console.log('\n📦 Bundle:');
      console.log(`   JS Files: ${bundle.jsFiles} | Total Size: ${formatBytes(bundle.totalSize)}`);
    }
  }

  async saveResults() {
    await fs.mkdir(RESULTS_DIR, { recursive: true });
    // Sanitize buildName to prevent path traversal
    const sanitizedBuildName = this.buildName
      .replace(/[/\\]/g, '-')
      .replace(/[^a-zA-Z0-9._-]/g, '')
      .slice(0, 100) || 'build';
    const filename = `${sanitizedBuildName}-${Date.now()}.json`;
    const filepath = path.join(RESULTS_DIR, filename);
    await fs.writeFile(filepath, JSON.stringify(this.results, null, 2));
  }
}

// Main execution
const buildName = process.argv[2] || 'default';
const benchmark = new PerformanceBenchmark(buildName);
await benchmark.run();
