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
  runs: 3, // Multiple runs for statistical significance
  waitAfterLoad: 2000, // Wait for dynamic content
};

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
        performanceScore: runnerResult.lhr.categories.performance.score * 100,
        firstContentfulPaint: audits['first-contentful-paint'].numericValue,
        largestContentfulPaint: audits['largest-contentful-paint'].numericValue,
        timeToInteractive: audits['interactive'].numericValue,
        speedIndex: audits['speed-index'].numericValue,
        totalBlockingTime: audits['total-blocking-time'].numericValue,
        cumulativeLayoutShift: audits['cumulative-layout-shift'].numericValue,
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
        largestJs: Math.max(...jsResources.map(r => r.contentLength)),
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

      // Track long tasks
      await page.addInitScript(() => {
        const observer = new PerformanceObserver((list) => {
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
        observer.observe({ entryTypes: ['longtask'] });
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

      // Measure interaction latency
      const interactionLatency = await page.evaluate(async () => {
        const button = document.querySelector('button');
        if (!button) return null;

        const start = performance.now();
        button.click();
        await new Promise(resolve => setTimeout(resolve, 100));
        return performance.now() - start;
      });

      return {
        memoryUsage,
        longTasksCount: tasks.length,
        totalBlockingTime: tasks.reduce((sum, task) => sum + Math.max(0, task.duration - 50), 0),
        interactionLatency,
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

    // 4. User journeys
    console.log('\n👤 Measuring user journeys...');
    const journey = { name: 'main-navigation' };
    this.results.userJourneys.mainNavigation = await this.measureUserJourney(journey);

    // Save results
    await this.saveResults();

    console.log(`\n✅ Benchmark complete! Results saved to: ${RESULTS_DIR}\n`);
  }

  async saveResults() {
    await fs.mkdir(RESULTS_DIR, { recursive: true });
    const filename = `${this.buildName}-${Date.now()}.json`;
    const filepath = path.join(RESULTS_DIR, filename);
    await fs.writeFile(filepath, JSON.stringify(this.results, null, 2));
  }
}

// Main execution
const buildName = process.argv[2] || 'default';
const benchmark = new PerformanceBenchmark(buildName);
await benchmark.run();
