import { describe, it, expect } from 'vitest';
import { generateRobotsTxt } from '../../../../buildConfiguration.js';

describe('generateRobotsTxt', () => {
  describe('when allowIndexing is true (production)', () => {
    it('contains User-agent: * directive', () => {
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

    it('disallows crawling of sensitive paths', () => {
      const result = generateRobotsTxt(true);
      expect(result).toContain('Disallow: /identity');
      expect(result).toContain('Disallow: /restricted');
      expect(result).toContain('Disallow: /profile');
    });

    it('disallows crawling of API and internal endpoints', () => {
      const result = generateRobotsTxt(true);
      expect(result).toContain('Disallow: /api/');
      expect(result).toContain('Disallow: /graphql');
    });

    it('disallows crawling of build artifacts', () => {
      const result = generateRobotsTxt(true);
      expect(result).toContain('Disallow: /env-config.js');
      expect(result).toContain('Disallow: /meta.json');
      expect(result).toContain('Disallow: /assets/');
    });

    it('includes crawl-delay directive', () => {
      const result = generateRobotsTxt(true);
      expect(result).toContain('Crawl-delay: 1');
    });

    it('blocks AI/LLM scrapers', () => {
      const result = generateRobotsTxt(true);
      expect(result).toContain('User-agent: GPTBot');
      expect(result).toContain('User-agent: ClaudeBot');
      expect(result).toContain('User-agent: CCBot');
    });

    it('blocks aggressive SEO scrapers', () => {
      const result = generateRobotsTxt(true);
      expect(result).toContain('User-agent: AhrefsBot');
      expect(result).toContain('User-agent: SemrushBot');
    });
  });

  describe('when allowIndexing is false (non-production)', () => {
    it('contains User-agent: * directive', () => {
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

    it('does not contain AI bot rules (unnecessary when all blocked)', () => {
      const result = generateRobotsTxt(false);
      expect(result).not.toContain('GPTBot');
    });
  });
});
