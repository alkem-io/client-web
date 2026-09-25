import type { Page } from '@playwright/test';

export type CspViolation = {
  effectiveDirective: string;
  blockedURI: string;
  sourceFile: string;
  documentURI: string;
  disposition: string;
};

declare global {
  interface Window {
    __reportCspViolation?: (violation: CspViolation) => void;
  }
}

/**
 * Records every content-security-policy violation the page reports, from the
 * next navigation on, into the returned array. Each violation is handed to the
 * test process as it happens, so the record covers every frame (including
 * short-lived ones such as a silent-SSO iframe) and survives navigations.
 */
export async function installCspViolationCollector(page: Page): Promise<CspViolation[]> {
  const violations: CspViolation[] = [];
  await page.exposeBinding('__reportCspViolation', (_source, violation: CspViolation) => {
    violations.push(violation);
  });
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', event => {
      window.__reportCspViolation?.({
        effectiveDirective: event.effectiveDirective,
        blockedURI: event.blockedURI,
        sourceFile: event.sourceFile,
        documentURI: event.documentURI,
        disposition: event.disposition,
      });
    });
  });
  return violations;
}
