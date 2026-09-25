import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { activateDeferredStylesheet } from './deferredStylesheet';

const indexHtml = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');

describe('index.html under a strict script-src', () => {
  it('has no inline script', () => {
    const scriptTags = indexHtml.match(/<script[^>]*>/g) ?? [];
    expect(scriptTags.length).toBeGreaterThan(0);
    expect(scriptTags.filter(tag => !tag.includes('src='))).toEqual([]);
  });

  it('has no inline event handler', () => {
    expect(indexHtml).not.toMatch(/ on[a-z]+="/);
  });

  it('defers the font stylesheet by id', () => {
    expect(indexHtml).toMatch(/<link[^>]*id="google-fonts-stylesheet"[^>]*media="print"/);
  });
});

describe('activateDeferredStylesheet', () => {
  it('switches the stylesheet to all media once it has loaded', () => {
    const link = document.createElement('link');
    link.id = 'google-fonts-stylesheet';
    link.rel = 'stylesheet';
    link.media = 'print';
    document.head.appendChild(link);

    activateDeferredStylesheet(link);
    expect(link.media).toBe('print');
    link.dispatchEvent(new Event('load'));
    expect(link.media).toBe('all');
    link.remove();
  });
});
