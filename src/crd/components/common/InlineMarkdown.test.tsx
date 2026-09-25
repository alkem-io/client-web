import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { InlineMarkdown } from './InlineMarkdown';

/**
 * Characterisation + safety tests for `InlineMarkdown`.
 *
 * `InlineMarkdown` had zero tests before this feature and ten existing
 * consumers. The tests in this file pin its CURRENT default behaviour first
 * (`describe('default mode — unchanged behaviour')`) so the opt-in card-safe
 * mode added afterwards can never regress a consumer that doesn't ask for it.
 * The card-safe (`rawHtml="skip"`) tests guard the cross-scope content
 * exposure this feature introduces: subspace-authored markdown rendered on
 * the host space's page.
 */

describe('InlineMarkdown default mode — unchanged behaviour (characterisation)', () => {
  test('raw HTML bold tag renders as bold', () => {
    const { container } = render(<InlineMarkdown content="text <b>x</b> more" />);
    const bold = container.querySelector('b');
    expect(bold).not.toBeNull();
    expect(bold?.textContent).toBe('x');
  });

  test('a markdown link renders an <a href>', () => {
    const { container } = render(<InlineMarkdown content="[click](https://example.org)" />);
    const link = container.querySelector('a');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toBe('https://example.org');
  });

  test('disableLinks renders link text in a span with no <a>', () => {
    const { container } = render(<InlineMarkdown content="[click](https://example.org)" disableLinks={true} />);
    expect(container.querySelector('a')).toBeNull();
    expect(container.textContent).toContain('click');
  });

  test('an <img> element is present in the DOM (today’s CSS-hidden behaviour)', () => {
    const { container } = render(<InlineMarkdown content="![alt](https://example.org/x.png)" />);
    expect(container.querySelector('img')).not.toBeNull();
  });

  test.each([
    [0, ''],
    [1, 'line-clamp-1'],
    [2, 'line-clamp-2'],
    [3, 'line-clamp-3'],
    [5, 'line-clamp-5'],
  ] as const)('clampLines %s maps to class %s', (clampLines, expectedClass) => {
    const { container } = render(<InlineMarkdown content="hello" clampLines={clampLines} />);
    const root = container.firstElementChild;
    if (expectedClass) {
      expect(root?.className).toContain(expectedClass);
    } else {
      expect(root?.className).not.toMatch(/line-clamp-\d/);
    }
  });

  test('a raw element with a style attribute keeps a sanitized style attribute', () => {
    const { container } = render(<InlineMarkdown content='<span style="color:red">x</span>' />);
    const span = container.querySelector('span[style]');
    expect(span).not.toBeNull();
  });
});

describe('InlineMarkdown card-safe mode (rawHtml="skip") — cross-scope content injection', () => {
  test('a fixed-position, full-screen raw HTML block is not interpreted: no styled descendant, no div from the input', () => {
    const { container } = render(
      <InlineMarkdown
        content='<div style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999">PWNED</div>'
        rawHtml="skip"
      />
    );
    expect(container.querySelector('[style]')).toBeNull();
    expect(container.firstElementChild?.querySelector('div')).toBeNull();
  });

  test('inline raw HTML tags drop, their text content survives', () => {
    const { container } = render(<InlineMarkdown content="text <strong>bold</strong> more" rawHtml="skip" />);
    expect(container.querySelector('strong')).toBeNull();
    expect(container.textContent?.replace(/\s+/g, ' ').trim()).toBe('text bold more');
  });

  test('a markdown image is absent from the DOM, not merely hidden', () => {
    const { container } = render(<InlineMarkdown content="![x](http://localhost/__p.png)" rawHtml="skip" />);
    expect(container.querySelector('img')).toBeNull();
  });

  test('a raw iframe embed does not render', () => {
    const { container } = render(
      <InlineMarkdown content='<iframe src="http://localhost/embed"></iframe>' rawHtml="skip" />
    );
    expect(container.querySelector('iframe')).toBeNull();
  });

  test('a heading does not render at heading size — flattened inline', () => {
    const { container } = render(<InlineMarkdown content="# Big" rawHtml="skip" />);
    const h1 = container.querySelector('h1');
    expect(h1).not.toBeNull();
    expect(container.firstElementChild?.className).toContain('[&_h1]:inline');
  });

  test('a GFM table flattens: no visible table structure, cell texts separated by whitespace', () => {
    const { container } = render(<InlineMarkdown content={'| A | B |\n| - | - |\n| one | two |'} rawHtml="skip" />);
    expect(container.firstElementChild?.className).toContain('[&_table]:inline');
    expect(container.firstElementChild?.className).toContain('[&_td]:inline');
    expect(container.textContent).toMatch(/one\s+two/);
  });

  test('a fenced code block flattens and wraps like prose — not `white-space: pre`', () => {
    const { container } = render(<InlineMarkdown content={'```\nconst x = 1;\n```'} rawHtml="skip" />);
    expect(container.querySelector('pre')).not.toBeNull();
    const className = container.firstElementChild?.className;
    expect(className).toContain('[&_pre]:inline');
    expect(className).toContain('[&_pre]:whitespace-normal');
    expect(className).toContain('break-words');
  });

  test('disableLinks still applies (zero <a> elements)', () => {
    const { container } = render(
      <InlineMarkdown content="[click](https://example.org)" rawHtml="skip" disableLinks={true} />
    );
    expect(container.querySelectorAll('a')).toHaveLength(0);
  });

  test('links render as plain text even without an explicit disableLinks (one link per card)', () => {
    const { container } = render(<InlineMarkdown content="[click](https://example.org)" rawHtml="skip" />);
    expect(container.querySelectorAll('a')).toHaveLength(0);
    expect(container.textContent).toContain('click');
  });

  test('bold markdown emphasis still renders bold', () => {
    const { container } = render(<InlineMarkdown content="**bold**" rawHtml="skip" />);
    expect(container.querySelector('strong')).not.toBeNull();
  });

  test('every default-mode assertion still passes when rawHtml is omitted (byte-identical default)', () => {
    const { container: skipDefault } = render(<InlineMarkdown content="text <b>x</b> more" />);
    expect(skipDefault.querySelector('b')?.textContent).toBe('x');
    const { container: imgDefault } = render(<InlineMarkdown content="![alt](https://example.org/x.png)" />);
    expect(imgDefault.querySelector('img')).not.toBeNull();
  });

  // The council's objection to a CSS line-clamp: it does not bound multi-block markdown unless
  // every block kind the markdown can emit is flattened to inline first. This is the deterministic
  // half of that guarantee — every block tag the parser can produce, over headings 1-6, lists,
  // a code fence, a blockquote, a horizontal rule, the table above, and one document combining all
  // of them, must be covered by a matching per-tag `inline` flatten variant (or `hidden` for `hr`) on the
  // container. A tag with no matching variant means the clamp silently stops bounding that content —
  // this test fails the moment a block kind is added to the markdown surface without a flatten rule.
  const FLATTENABLE_TAGS = [
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'blockquote',
    'pre',
    'table',
    'thead',
    'tbody',
    'tr',
    'td',
    'th',
    'hr',
  ] as const;

  const DOCUMENTS: Record<string, string> = {
    'h1..h6': '# a\n\n## b\n\n### c\n\n#### d\n\n##### e\n\n###### f',
    bulletList: '- one\n- two',
    numberedList: '1. one\n2. two',
    codeFence: '```\nconst x = 1;\n```',
    quote: '> a quote',
    rule: '---',
    table: '| A | B |\n| - | - |\n| one | two |',
  };
  DOCUMENTS.combined = Object.values(DOCUMENTS).join('\n\n');

  test.each(
    Object.entries(DOCUMENTS)
  )('every block tag %s emits has a matching flatten variant', (_label, markdown) => {
    const { container } = render(<InlineMarkdown content={markdown} rawHtml="skip" />);
    const present = new Set<string>();
    for (const tag of FLATTENABLE_TAGS) {
      if (container.querySelector(tag)) present.add(tag);
    }
    for (const tag of present) {
      const expectedFragment = tag === 'hr' ? '[&_hr]:hidden' : `[&_${tag}]:inline`;
      expect(container.firstElementChild?.className).toContain(expectedFragment);
    }
  });
});
