import type { Page } from '@playwright/test';

export type CspViolation = {
  effectiveDirective: string;
  blockedURI: string;
  sourceFile: string;
  disposition: string;
};

declare global {
  interface Window {
    __cspViolations?: CspViolation[];
  }
}

/** Records every content-security-policy violation the page reports, from the next navigation on. */
export async function installCspViolationCollector(page: Page) {
  await page.addInitScript(() => {
    window.__cspViolations = [];
    document.addEventListener('securitypolicyviolation', event => {
      window.__cspViolations?.push({
        effectiveDirective: event.effectiveDirective,
        blockedURI: event.blockedURI,
        sourceFile: event.sourceFile,
        disposition: event.disposition,
      });
    });
  });
}

export const readCspViolations = (page: Page) => page.evaluate(() => window.__cspViolations ?? []);
