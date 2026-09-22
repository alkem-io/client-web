import { render } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, test } from 'vitest';
import { InlineMarkdown } from '@/crd/components/common/InlineMarkdown';
import { clampExcerptSource, hasVisibleExcerptText, MAX_EXCERPT_SOURCE_LENGTH } from './markdownExcerpt';

describe('hasVisibleExcerptText', () => {
  test.each([
    ['', false],
    ['   ', false],
    [null, false],
    [undefined, false],
    ['hello', true],
    ['![a](b.png)', false],
    ['<div>x</div>', false],
    ['<iframe src="http://localhost/x"></iframe>', false],
    // Unlike `<div>`/`<iframe>` (block-level tags — the whole raw HTML block is dropped),
    // `<strong>` is inline: the tag itself is dropped but its "x" survives as a separate
    // text node (mirrors InlineMarkdown's actual card-safe rendering — see the contract
    // test below, which is the authority these hand-picked expectations are checked against).
    ['<strong>x</strong>', true],
    ['| A | B |\n| - | - |\n| one | two |', true],
    ['---', false],
  ] as const)('%j -> %s', (markdown, expected) => {
    expect(hasVisibleExcerptText(markdown)).toBe(expected);
  });
});

describe('hasVisibleExcerptText — unbounded source safety', () => {
  test('a deeply-nested blockquote well under the server-side save limit does not throw', () => {
    // 8,000 nesting levels — well under the server's ~65k-character save limit for this
    // field — is enough to blow the parser's call stack when the source is not bounded
    // before parsing. The nesting-depth guard cuts this payload's line at the point its
    // blockquote nesting crosses the safe depth, well before the trailing "x", so the
    // result is `false` here — the guarantee under test is that it never throws, not
    // what the boolean happens to be.
    const deeplyNested = `${'> '.repeat(8000)}x`;
    expect(() => hasVisibleExcerptText(deeplyNested)).not.toThrow();
  });

  test('nesting shallow enough to stay under the depth guard still reports its visible text', () => {
    const nestedWithinDepth = `${'> '.repeat(900)}x`;
    expect(hasVisibleExcerptText(nestedWithinDepth)).toBe(true);
  });

  test('deeply-nested lists are caught by the same guard', () => {
    const deeplyNestedList = `${'- '.repeat(8000)}x`;
    expect(() => hasVisibleExcerptText(deeplyNestedList)).not.toThrow();
  });

  test('ordinary long-form prose still reports visible text once clamped to the parse-length ceiling', () => {
    // Character count alone was once treated as never a valid reason to cut this source,
    // on the theory that only pathological *structure* should bound it. That theory did
    // not hold: a flat run of inline emphasis/bracket markers has no container nesting at
    // all yet still blows the parser's call stack (see "unbounded inline-span safety"
    // below), so a length ceiling is now the first layer ahead of the depth guard. An
    // ordinary field at the platform's full save-time length limit, with no nesting, is cut
    // to the ceiling — but its visible text sits well within the first 2,000 characters, so
    // this excerpt is still reported as visible.
    const ordinaryProse = 'Alkemio subspace description. '.repeat(2200); // 66,000 chars, no nesting
    expect(ordinaryProse.length).toBeGreaterThan(65000);
    expect(hasVisibleExcerptText(ordinaryProse)).toBe(true);
  });
});

describe('hasVisibleExcerptText — unbounded inline-span safety', () => {
  test('a large run of emphasis markers on both sides of the visible character resolves within budget and does not throw', () => {
    const payload = `${'*'.repeat(16000)}x${'*'.repeat(16000)}`;
    const start = performance.now();
    expect(() => hasVisibleExcerptText(payload)).not.toThrow();
    expect(performance.now() - start).toBeLessThan(500);
  });

  test('a large run of unmatched brackets on both sides of the visible character resolves within budget and does not throw', () => {
    const payload = `${'['.repeat(24000)}x${']'.repeat(24000)}`;
    const start = performance.now();
    expect(() => hasVisibleExcerptText(payload)).not.toThrow();
    expect(performance.now() - start).toBeLessThan(500);
  });
});

describe('clampExcerptSource — length ceiling', () => {
  test('a source under the length ceiling passes through unchanged', () => {
    const short = 'A short subspace description, well under the ceiling.';
    expect(clampExcerptSource(short)).toBe(short);
  });

  test('a prose source longer than the length ceiling is cut at a word boundary, not mid-word', () => {
    const prose = 'lorem ipsum dolor sit amet '.repeat(200); // far longer than the ceiling
    const clamped = clampExcerptSource(prose);
    expect(clamped.length).toBeLessThanOrEqual(MAX_EXCERPT_SOURCE_LENGTH);
    expect(prose.startsWith(clamped)).toBe(true);
    // The character immediately following the cut in the original source is whitespace —
    // proof the cut landed between words rather than inside one.
    const nextChar = prose[clamped.length];
    expect(nextChar).toMatch(/\s/);
    expect(hasVisibleExcerptText(prose)).toBe(true);
  });
});

describe('hasVisibleExcerptText ⇔ InlineMarkdown contract', () => {
  // One fixture array run through both the helper and the card-safe renderer — the
  // guarantee that "show the label" and "render the body" always agree. No JSX here so the
  // file can stay `.ts` (matches the plan's file name) rather than `.tsx`.
  const FIXTURES = [
    '',
    '   ',
    'hello',
    '![a](b.png)',
    '<div>x</div>',
    '<iframe src="http://localhost/x"></iframe>',
    '<strong>x</strong>',
    'text <strong>bold</strong> more',
    '| A | B |\n| - | - |\n| one | two |',
    '---',
    '# Heading only',
    '[a link](https://example.org)',
    '> a quote',
    '```\ncode\n```',
    'some **bold** text',
  ];

  test.each(FIXTURES)('helper agrees with the card-safe renderer for %j', markdown => {
    const helperResult = hasVisibleExcerptText(markdown);
    const { container } = render(createElement(InlineMarkdown, { content: markdown, rawHtml: 'skip', clampLines: 0 }));
    const rendererResult = (container.textContent ?? '').trim().length > 0;
    expect(helperResult).toBe(rendererResult);
  });
});
