import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

// Root of the repo (4 levels up from src/domain/platform/__tests__)
const repoRoot = join(import.meta.dirname, '../../../../');

describe('robots.txt', () => {
  describe('production (public/robots.txt)', () => {
    let content: string;

    beforeAll(() => {
      content = readFileSync(join(repoRoot, 'public', 'robots.txt'), 'utf-8');
    });

    it('contains User-agent: * directive', () => {
      expect(content).toContain('User-agent: *');
    });

    it('allows crawling of public content', () => {
      expect(content).toContain('Allow: /');
    });

    it('disallows crawling of admin paths', () => {
      expect(content).toContain('Disallow: /admin');
    });

    it('disallows crawling of sensitive paths', () => {
      expect(content).toContain('Disallow: /restricted');
      expect(content).toContain('Disallow: /user/me');
    });

    it('disallows crawling of API and internal endpoints', () => {
      expect(content).toContain('Disallow: /api/');
      expect(content).toContain('Disallow: /graphql');
      expect(content).toContain('Disallow: /graphiql');
    });

    it('disallows crawling of build artifacts', () => {
      expect(content).toContain('Disallow: /env-config.js');
      expect(content).toContain('Disallow: /meta.json');
      expect(content).toContain('Disallow: /assets/');
    });

    it('includes crawl-delay directive', () => {
      expect(content).toContain('Crawl-delay: 1');
    });

    it('blocks AI/LLM scrapers', () => {
      expect(content).toContain('User-agent: GPTBot');
      expect(content).toContain('User-agent: ClaudeBot');
      expect(content).toContain('User-agent: CCBot');
    });

    it('blocks aggressive SEO scrapers', () => {
      expect(content).toContain('User-agent: AhrefsBot');
      expect(content).toContain('User-agent: SemrushBot');
    });
  });
});
