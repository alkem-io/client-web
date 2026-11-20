import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

// iOS WebKit zooms the page in when a text field whose text is smaller than
// 16px takes focus, and never zooms back out. The rules target iOS only, at
// every width (landscape phones and iPads zoom too). jsdom evaluates neither
// @supports nor Tailwind, so these tests pin the stylesheet rules themselves.

const readCss = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

const IOS_SUPPORTS = '@supports (-webkit-touch-callout: none)';

// Returns the body of the first `@supports (-webkit-touch-callout: none) { ... }` block whose
// body matches `selector`, and whether it sits at the top level (not in a @layer).
const findIosBlock = (css: string, selector: RegExp) => {
  let from = 0;
  while (true) {
    const start = css.indexOf(IOS_SUPPORTS, from);
    if (start === -1) return undefined;
    const open = css.indexOf('{', start);
    let depth = 1;
    let index = open + 1;
    while (depth > 0 && index < css.length) {
      if (css[index] === '{') depth++;
      if (css[index] === '}') depth--;
      index++;
    }
    const body = css.slice(open + 1, index - 1);
    if (selector.test(body)) {
      const before = css.slice(0, start);
      const unclosedBraces = (before.match(/\{/g) ?? []).length - (before.match(/\}/g) ?? []).length;
      return { body, topLevel: unclosedBraces === 0 };
    }
    from = index;
  }
};

const fontSizePx = (body: string) => {
  const match = body.match(/font-size:\s*(\d+(?:\.\d+)?)px/);
  return match ? Number(match[1]) : undefined;
};

describe('iOS text-entry font size (prevents iOS focus zoom)', () => {
  test('input, textarea and select get at least 16px on iOS, outside any @layer', () => {
    const block = findIosBlock(readCss('src/crd/styles/crd.css'), /input,\s*textarea,\s*select/);

    expect(block).toBeDefined();
    // Inside a layer, Tailwind's text-* utilities on call sites would win.
    expect(block?.topLevel).toBe(true);
    expect(fontSizePx(block?.body ?? '')).toBeGreaterThanOrEqual(16);
  });

  test('the markdown editor gets at least 16px on iOS', () => {
    const block = findIosBlock(readCss('src/crd/forms/markdown/styles.css'), /\.crd-markdown-editor \.ProseMirror/);

    expect(block).toBeDefined();
    expect(fontSizePx(block?.body ?? '')).toBeGreaterThanOrEqual(16);
  });

  test('zoom is not disabled through the viewport meta tag', () => {
    const viewport = readCss('index.html').match(/<meta name="viewport" content="([^"]*)"/)?.[1] ?? '';

    expect(viewport).not.toMatch(/maximum-scale|user-scalable/);
  });
});
