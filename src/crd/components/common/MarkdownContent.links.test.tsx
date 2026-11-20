import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { MarkdownContent } from './MarkdownContent';

describe('MarkdownContent links', () => {
  test.each([
    ['external', 'https://example.com/a'],
    ['same-origin', `${window.location.origin}/space/a`],
    ['relative', '/space/a'],
    ['protocol-relative', '//example.com/a'],
    ['fragment', '#section'],
    ['mailto', 'mailto:a@example.com'],
  ])('by default a %s link renders as a bare anchor', (_name, href) => {
    const { container } = render(<MarkdownContent content={`[x](${href})`} />);
    expect(container.querySelector('a')?.outerHTML).toBe(`<a href="${href}">x</a>`);
  });

  test('the new-tab renderer never leaks the markdown node onto the anchor', () => {
    const { container } = render(<MarkdownContent content="[x](https://example.com/a)" newTabLinks="external" />);
    expect(container.querySelector('a')?.outerHTML).toBe(
      '<a href="https://example.com/a" target="_blank" rel="noopener noreferrer">x</a>'
    );
  });

  // A streaming assistant reply re-renders on every parse; a remounted link would
  // lose keyboard focus and any in-progress click.
  test('a re-render keeps the same anchor element', () => {
    const { container, rerender } = render(
      <MarkdownContent content="[x](https://example.com/a) one" newTabLinks="external" />
    );
    const before = container.querySelector('a');
    rerender(<MarkdownContent content="[x](https://example.com/a) one two" newTabLinks="external" />);
    expect(container.querySelector('a')).toBe(before);
  });
});
