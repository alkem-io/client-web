import { render } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, test } from 'vitest';
import { InlineMarkdown } from '@/crd/components/common/InlineMarkdown';
import {
  clampExcerptSource,
  hasVisibleExcerptText,
  MAX_EXCERPT_NESTING_DEPTH,
  MAX_EXCERPT_SOURCE_LENGTH,
} from './markdownExcerpt';

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

  test('nesting at the depth guard still reports its visible text; one level past it is cut', () => {
    expect(hasVisibleExcerptText(`${'> '.repeat(MAX_EXCERPT_NESTING_DEPTH)}x`)).toBe(true);
    expect(hasVisibleExcerptText(`${'> '.repeat(MAX_EXCERPT_NESTING_DEPTH + 1)}x`)).toBe(false);
  });

  test('the depth guard sits where the renderer is safe, not where the parser gives up', () => {
    // A nested list under the length ceiling but hundreds of levels deep parses
    // fine, yet building its React element tree recurses once per level and can
    // exhaust the call stack. The bound must keep such a source away from the
    // renderer entirely, in a cold process as much as a warm one.
    for (const depth of [64, 500, 999]) {
      const source = `${'- '.repeat(depth)}x`;
      expect(source.length).toBeLessThan(MAX_EXCERPT_SOURCE_LENGTH);
      expect(clampExcerptSource(source)).toBe('');
      expect(() =>
        render(createElement(InlineMarkdown, { content: clampExcerptSource(source), rawHtml: 'skip', clampLines: 0 }))
      ).not.toThrow();
    }
  });

  test('an indented continuation line cannot slip deep nesting past the guard', () => {
    // Inside a list item the marker indent is measured from the item's content column,
    // so `10. x` followed by a 4-space-indented line opens one container per marker on
    // it. Unguarded, this exact 1,999-character field overflows the renderer's stack.
    const source = `10. x\n    ${'- '.repeat(994)}y`;
    expect(source.length).toBeLessThan(MAX_EXCERPT_SOURCE_LENGTH);
    const clamped = clampExcerptSource(source);
    expect(clamped).toBe('10. x\n');
    expect(() =>
      render(createElement(InlineMarkdown, { content: clamped, rawHtml: 'skip', clampLines: 3 }))
    ).not.toThrow();
  });

  test('nesting built up across lines by indentation is bounded too', () => {
    // Each line indents to the previous line's deepest content column and opens 16 more
    // levels: every line alone is at the per-line marker bound, the nesting keeps growing.
    const lines = Array.from({ length: 6 }, (_, k) => `${' '.repeat(32 * k)}${'- '.repeat(16)}y`);
    const source = lines.join('\n');
    expect(source.length).toBeLessThan(MAX_EXCERPT_SOURCE_LENGTH);
    expect(clampExcerptSource(source)).toBe(`${lines[0]}\n`);
  });

  test('an ordinary indented nested list passes through unchanged', () => {
    const source = '1. one\n   - two\n     - three\n       > quoted\n2. four';
    expect(clampExcerptSource(source)).toBe(source);
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

describe('clampExcerptSource — cuts never split a markdown construct', () => {
  const prose = 'Real prose that follows the pasted material and must survive.';

  test('a pasted image at the top of a field does not consume the parse budget', () => {
    // A data: URL screenshot is tens of kilobytes with no whitespace; images never
    // render in card-safe mode, so it is removed before the length ceiling applies
    // and the prose after it stays visible.
    const source = `![](data:image/png;base64,${'A'.repeat(2500)})\n\n${prose}`;
    const clamped = clampExcerptSource(source);
    expect(clamped).toContain(prose);
    expect(clamped).not.toContain('base64');
    expect(hasVisibleExcerptText(source)).toBe(true);
  });

  test('image removal stays linear on the raw field: unclosed openers at the save limit resolve in budget', () => {
    for (const payload of ['![['.repeat(21856), '<img'.repeat(16392), '![]('.repeat(16392)]) {
      const start = performance.now();
      expect(() => clampExcerptSource(payload)).not.toThrow();
      expect(performance.now() - start).toBeLessThan(100);
    }
  });

  test('a literal "<3" or "a < b" early in a long single paragraph does not swallow the prose after it', () => {
    for (const opener of ['<3 we love this space. ', 'Remember that a < b holds here. ']) {
      const source = opener + 'ordinary prose continues here '.repeat(90);
      expect(source.length).toBeGreaterThan(MAX_EXCERPT_SOURCE_LENGTH);
      const clamped = clampExcerptSource(source);
      expect(clamped.length).toBeGreaterThan(MAX_EXCERPT_SOURCE_LENGTH - 250);
      expect(hasVisibleExcerptText(source)).toBe(true);
    }
  });

  test('several complete images, markdown and raw, are all removed and the text between them kept', () => {
    const source = 'one ![a](x.png) two <img src="y.png"> three ![b](z.png "t") four';
    expect(clampExcerptSource(source)).toBe('one  two  three  four');
  });

  test('a raw <img> tag at the top of a field is removed the same way', () => {
    const source = `<img src="data:image/png;base64,${'A'.repeat(2500)}">\n\n${prose}`;
    expect(clampExcerptSource(source)).toContain(prose);
  });

  test('a source over the ceiling is cut at its last block boundary, dropping the partial block whole', () => {
    const paragraph = 'word '.repeat(180).trim(); // 899 chars: two fit, the third is cut mid-way
    const source = `${paragraph}\n\n${paragraph}\n\n${paragraph}`;
    expect(clampExcerptSource(source)).toBe(`${paragraph}\n\n${paragraph}`);
  });

  test('a block that ends exactly at the ceiling is kept whole', () => {
    const first = 'a'.repeat(998);
    const second = 'b'.repeat(1000);
    const source = `${first}\n\n${second}\n\nthird`;
    expect(source.indexOf('third')).toBeGreaterThan(MAX_EXCERPT_SOURCE_LENGTH);
    expect(clampExcerptSource(source)).toBe(`${first}\n\n${second}`);
  });

  test('a single block over the ceiling is cut at whitespace and an unterminated link is dropped with it', () => {
    const lead = 'lead '.repeat(380).trim(); // ~1900 chars, one paragraph
    const source = `${lead} [read more](https://example.org/${'x'.repeat(300)}) trailing`;
    const clamped = clampExcerptSource(source);
    expect(clamped.length).toBeLessThanOrEqual(MAX_EXCERPT_SOURCE_LENGTH);
    expect(clamped).not.toContain('[read more');
    expect(clamped).not.toContain('](https');
    expect(clamped.endsWith('lead')).toBe(true);
  });

  test('a single block over the ceiling ending in an unterminated raw tag drops the tag', () => {
    const lead = 'lead '.repeat(380).trim();
    const source = `${lead} <span class="${'y'.repeat(300)}">z</span>`;
    expect(clampExcerptSource(source)).not.toContain('<span');
  });
});

describe('card-safe mode renders inline text only', () => {
  function renderCardSafe(markdown: string) {
    return render(createElement(InlineMarkdown, { content: markdown, rawHtml: 'skip', clampLines: 0 })).container;
  }

  test('a task list renders no checkbox', () => {
    const container = renderCardSafe('- [x] done\n- [ ] todo');
    expect(container.querySelector('input')).toBeNull();
    expect(container.textContent).toContain('done');
  });

  test('a referenced footnote renders neither the footnote section nor the marker', () => {
    const container = renderCardSafe('See the note[^1].\n\n[^1]: The note body.');
    expect(container.querySelector('section')).toBeNull();
    expect(container.querySelector('sup')).toBeNull();
    expect(container.textContent).toContain('See the note');
    expect(container.textContent).not.toContain('The note body');
  });

  test('a field holding only a footnote definition is not visible and renders nothing', () => {
    const source = '[^1]: Only a definition.';
    expect(hasVisibleExcerptText(source)).toBe(false);
    expect(renderCardSafe(source).textContent?.trim()).toBe('');
  });

  test('a field holding only invisible format characters is not visible', () => {
    expect(hasVisibleExcerptText('​‍­')).toBe(false);
    expect(hasVisibleExcerptText('​visible')).toBe(true);
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
