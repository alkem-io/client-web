import { describe, it, expect } from 'vitest';
import { generateRobotsTxt } from '../../../../buildConfiguration.js';

describe('generateRobotsTxt', () => {
  describe('when allowIndexing is true (production)', () => {
    it('returns RFC 9309-compliant output with User-agent directive', () => {
      const result = generateRobotsTxt(true);
      expect(result).toContain('User-agent: *');
    });

    it('allows crawling of public content', () => {
      const result = generateRobotsTxt(true);
      expect(result).toContain('Allow: /');
    });

    it('disallows crawling of admin paths', () => {
      const result = generateRobotsTxt(true);
      expect(result).toContain('Disallow: /admin');
    });

    it('does not contain a blanket Disallow: / directive', () => {
      const result = generateRobotsTxt(true);
      const lines = result.split('\n');
      const disallowLines = lines.filter(line => line.startsWith('Disallow:'));
      expect(disallowLines).toHaveLength(1);
      expect(disallowLines[0]).toBe('Disallow: /admin');
    });
  });

  describe('when allowIndexing is false (non-production)', () => {
    it('returns RFC 9309-compliant output with User-agent directive', () => {
      const result = generateRobotsTxt(false);
      expect(result).toContain('User-agent: *');
    });

    it('disallows all crawling', () => {
      const result = generateRobotsTxt(false);
      expect(result).toContain('Disallow: /');
    });

    it('does not contain any Allow directives', () => {
      const result = generateRobotsTxt(false);
      expect(result).not.toContain('Allow:');
    });
  });
});
