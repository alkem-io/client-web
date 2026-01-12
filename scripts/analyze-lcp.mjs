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
};

class LCPAnalyzer {
  constructor(buildName) {
    this.buildName = buildName;
    this.results = {};
  }

  async analyzePage(url, name) {
    console.log(`\n🔍 Analyzing LCP for ${name}...`);

    const browser = await chromium.launch({
      headless: true,
      args: ['--disable-blink-features=AutomationControlled']
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });

    const page = await context.newPage();

    try {
      // Track all resources
      const resources = [];
      const resourceTimings = [];

      page.on('response', (response) => {
        resources.push({
          url: response.url(),
          status: response.status(),
          type: response.request().resourceType(),
          headers: response.headers(),
        });
      });

      // Start performance tracing
      await page.coverage.startJSCoverage();
      await page.coverage.startCSSCoverage();

      const navigationStart = Date.now();

      // Navigate with network monitoring
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Wait a bit more for everything to settle
      await page.waitForTimeout(2000);

      // Get performance metrics from browser
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        const resources = performance.getEntriesByType('resource');

        // Get LCP
        let lcp = null;
        if (window.PerformanceObserver && PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint')) {
          const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
          lcp = lcpEntries[lcpEntries.length - 1];
        }

        return {
          navigation: navigation ? {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            domInteractive: navigation.domInteractive,
          } : null,
          paint: paint.map(p => ({
            name: p.name,
            startTime: p.startTime
          })),
          lcp: lcp ? {
            startTime: lcp.startTime,
            renderTime: lcp.renderTime,
            loadTime: lcp.loadTime,
            size: lcp.size,
            element: lcp.element?.tagName || 'unknown',
            url: lcp.url || lcp.element?.currentSrc || lcp.element?.src || 'none',
          } : null,
          resourceCount: resources.length,
          resources: resources.map(r => ({
            name: r.name.split('/').pop(),
            type: r.initiatorType,
            duration: r.duration,
            transferSize: r.transferSize,
            startTime: r.startTime,
            responseEnd: r.responseEnd,
          })).sort((a, b) => a.startTime - b.startTime)
        };
      });

      // Get LCP element info
      const lcpElementInfo = await page.evaluate(() => {
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        if (lcpEntries.length === 0) return null;

        const lastEntry = lcpEntries[lcpEntries.length - 1];
        const element = lastEntry.element;

        if (!element) return null;

        return {
          tagName: element.tagName,
          id: element.id || null,
          className: element.className || null,
          src: element.src || element.currentSrc || null,
          textContent: element.textContent?.substring(0, 100) || null,
          innerHTML: element.innerHTML?.substring(0, 200) || null,
          computedStyles: {
            display: getComputedStyle(element).display,
            position: getComputedStyle(element).position,
            width: getComputedStyle(element).width,
            height: getComputedStyle(element).height,
          },
          boundingBox: element.getBoundingClientRect(),
        };
      });

      // Get resource timing waterfall
      const resourceWaterfall = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource');
        return resources.map(r => ({
          name: r.name.split('/').pop().substring(0, 50),
          fullUrl: r.name,
          type: r.initiatorType,
          startTime: r.startTime,
          dns: r.domainLookupEnd - r.domainLookupStart,
          tcp: r.connectEnd - r.connectStart,
          request: r.responseStart - r.requestStart,
          response: r.responseEnd - r.responseStart,
          duration: r.duration,
          transferSize: r.transferSize,
          encodedSize: r.encodedBodySize,
          decodedSize: r.decodedBodySize,
        })).sort((a, b) => a.startTime - b.startTime);
      });

      // Get JS coverage
      const jsCoverage = await page.coverage.stopJSCoverage();
      const cssCoverage = await page.coverage.stopCSSCoverage();

      // Calculate unused bytes
      const unusedJS = jsCoverage.reduce((total, entry) => {
        if (!entry.text) return total;
        const totalBytes = entry.text.length;
        const usedBytes = entry.ranges.reduce((sum, range) => sum + (range.end - range.start), 0);
        return total + (totalBytes - usedBytes);
      }, 0);

      const unusedCSS = cssCoverage.reduce((total, entry) => {
        if (!entry.text) return total;
        const totalBytes = entry.text.length;
        const usedBytes = entry.ranges.reduce((sum, range) => sum + (range.end - range.start), 0);
        return total + (totalBytes - usedBytes);
      }, 0);

      // Identify critical path resources (resources that loaded before LCP)
      const lcpTime = performanceMetrics.lcp?.renderTime || performanceMetrics.lcp?.loadTime || 0;
      const criticalResources = resourceWaterfall.filter(r => r.startTime < lcpTime);
      const blockingResources = criticalResources.filter(r =>
        r.type === 'script' || r.type === 'link' || r.type === 'img'
      );

      console.log(`  ✓ LCP: ${performanceMetrics.lcp?.renderTime?.toFixed(0)}ms`);
      console.log(`  ✓ LCP Element: ${lcpElementInfo?.tagName || 'unknown'}`);
      console.log(`  ✓ Resources: ${performanceMetrics.resourceCount} total, ${criticalResources.length} before LCP`);
      console.log(`  ✓ Blocking Resources: ${blockingResources.length}`);

      return {
        performanceMetrics,
        lcpElementInfo,
        resourceWaterfall,
        criticalResources,
        blockingResources,
        coverage: {
          unusedJSBytes: unusedJS,
          unusedCSSBytes: unusedCSS,
          totalJSBytes: jsCoverage.reduce((sum, entry) => sum + (entry.text?.length || 0), 0),
          totalCSSBytes: cssCoverage.reduce((sum, entry) => sum + (entry.text?.length || 0), 0),
        },
        summary: {
          lcpTime: performanceMetrics.lcp?.renderTime || performanceMetrics.lcp?.loadTime || null,
          lcpElement: `${lcpElementInfo?.tagName || 'unknown'}${lcpElementInfo?.id ? '#' + lcpElementInfo.id : ''}`,
          lcpUrl: performanceMetrics.lcp?.url || 'none',
          totalResources: performanceMetrics.resourceCount,
          criticalResourceCount: criticalResources.length,
          blockingResourceCount: blockingResources.length,
          fcp: performanceMetrics.paint.find(p => p.name === 'first-contentful-paint')?.startTime || null,
        }
      };
    } finally {
      await browser.close();
    }
  }

  async analyze() {
    console.log(`\n🚀 Running LCP Analysis for: ${this.buildName}\n`);

    for (const route of CONFIG.routes) {
      const url = `${CONFIG.baseUrl}${route.path}`;
      this.results[route.name] = await this.analyzePage(url, route.name);
    }

    // Save results
    await this.saveResults();

    // Generate report
    this.generateReport();
  }

  async saveResults() {
    await fs.mkdir(RESULTS_DIR, { recursive: true });
    const filename = `lcp-analysis-${this.buildName}-${Date.now()}.json`;
    const filepath = path.join(RESULTS_DIR, filename);
    await fs.writeFile(filepath, JSON.stringify(this.results, null, 2));
    console.log(`\n✅ Detailed results saved to: ${filepath}`);
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 LCP ANALYSIS SUMMARY');
    console.log('='.repeat(80) + '\n');

    for (const [pageName, data] of Object.entries(this.results)) {
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`📄 ${pageName.toUpperCase()}`);
      console.log('─'.repeat(80));

      const summary = data.summary;

      console.log(`\n⏱️  Core Metrics:`);
      console.log(`   LCP Time:        ${summary.lcpTime?.toFixed(0) || 'N/A'}ms`);
      console.log(`   FCP Time:        ${summary.fcp?.toFixed(0) || 'N/A'}ms`);
      console.log(`   LCP Element:     ${summary.lcpElement}`);
      console.log(`   LCP Resource:    ${summary.lcpUrl}`);

      console.log(`\n📦 Resource Analysis:`);
      console.log(`   Total Resources:       ${summary.totalResources}`);
      console.log(`   Before LCP:            ${summary.criticalResourceCount}`);
      console.log(`   Potentially Blocking:  ${summary.blockingResourceCount}`);

      console.log(`\n🎯 Top 10 Blocking Resources (loaded before LCP):`);
      const topBlockingResources = data.blockingResources
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10);

      topBlockingResources.forEach((resource, i) => {
        console.log(`   ${i + 1}. [${resource.type.padEnd(8)}] ${resource.name.substring(0, 50).padEnd(50)} ${resource.duration.toFixed(0)}ms`);
      });

      console.log(`\n📊 Resource Timeline (first 15):`);
      data.resourceWaterfall.slice(0, 15).forEach((r, i) => {
        const bar = '█'.repeat(Math.floor(r.duration / 10));
        console.log(`   ${String(i + 1).padStart(2)}. ${r.name.substring(0, 40).padEnd(40)} ${String(r.startTime.toFixed(0)).padStart(6)}ms ${bar} ${r.duration.toFixed(0)}ms`);
      });

      console.log(`\n🗑️  Code Coverage:`);
      const jsUtilization = ((data.coverage.totalJSBytes - data.coverage.unusedJSBytes) / data.coverage.totalJSBytes * 100).toFixed(1);
      const cssUtilization = ((data.coverage.totalCSSBytes - data.coverage.unusedCSSBytes) / data.coverage.totalCSSBytes * 100).toFixed(1);
      console.log(`   JS Utilization:   ${jsUtilization}% (${(data.coverage.unusedJSBytes / 1024).toFixed(0)} KB unused)`);
      console.log(`   CSS Utilization:  ${cssUtilization}% (${(data.coverage.unusedCSSBytes / 1024).toFixed(0)} KB unused)`);

      if (data.lcpElementInfo) {
        console.log(`\n🎨 LCP Element Details:`);
        console.log(`   Tag:        ${data.lcpElementInfo.tagName}`);
        console.log(`   ID:         ${data.lcpElementInfo.id || 'none'}`);
        console.log(`   Class:      ${data.lcpElementInfo.className || 'none'}`);
        console.log(`   Size:       ${data.lcpElementInfo.boundingBox?.width?.toFixed(0) || '?'}x${data.lcpElementInfo.boundingBox?.height?.toFixed(0) || '?'}px`);
        if (data.lcpElementInfo.src) {
          console.log(`   Source:     ${data.lcpElementInfo.src.substring(0, 60)}`);
        }
        if (data.lcpElementInfo.textContent && data.lcpElementInfo.textContent.trim()) {
          console.log(`   Text:       "${data.lcpElementInfo.textContent.trim().substring(0, 60)}..."`);
        }
      }
    }

    console.log('\n' + '='.repeat(80) + '\n');
  }
}

// Main execution
const buildName = process.argv[2] || 'current';
const analyzer = new LCPAnalyzer(buildName);
await analyzer.analyze();
