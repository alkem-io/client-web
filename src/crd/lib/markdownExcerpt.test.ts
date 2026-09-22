import { render } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, test } from 'vitest';
import { InlineMarkdown } from '@/crd/components/common/InlineMarkdown';
import { hasVisibleExcerptText } from './markdownExcerpt';

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
    // before parsing. The source-length cap means this particular payload's trailing
    // character falls outside the parsed window, so the result is `false` here — the
    // guarantee under test is that it never throws, not what the boolean happens to be.
    const deeplyNested = `${'> '.repeat(8000)}x`;
    expect(() => hasVisibleExcerptText(deeplyNested)).not.toThrow();
  });

  test('nesting shallow enough to fit inside the cap still reports its visible text', () => {
    const nestedWithinCap = `${'> '.repeat(900)}x`;
    expect(hasVisibleExcerptText(nestedWithinCap)).toBe(true);
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
