import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// The callback URL carries a single-use Matrix loginToken in its query string.
const repoRoot = join(import.meta.dirname, '../../../');

describe('Matrix callback: the loginToken in its URL is not written anywhere else', () => {
  it('nginx does not access-log the callback request', () => {
    const conf = readFileSync(join(repoRoot, '.build/.nginx/nginx.conf'), 'utf-8');
    const block = conf.match(/location = \/matrix-callback \{([^}]*)\}/)?.[1];

    expect(block).toBeDefined();
    expect(block).toMatch(/^\s*access_log off;/m);
  });

  it('the page sets a no-referrer policy before it loads any script', () => {
    const html = readFileSync(join(repoRoot, 'matrix-callback.html'), 'utf-8');
    const policy = html.search(/<meta name="referrer" content="no-referrer" \/>/);
    const firstScript = html.search(/<script\b/);

    expect(policy).toBeGreaterThan(-1);
    expect(firstScript).toBeGreaterThan(-1);
    expect(policy).toBeLessThan(firstScript);
  });
});
