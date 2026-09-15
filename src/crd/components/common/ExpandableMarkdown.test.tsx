import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { ExpandableMarkdown } from './ExpandableMarkdown';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/crd/components/common/MarkdownContent', () => ({
  MarkdownContent: ({ content }: { content: string }) => <div data-testid="markdown">{content}</div>,
}));

/** The clamp container — the element wrapping the content element. */
const clampedBox = () => screen.getByTestId('markdown').parentElement?.parentElement as HTMLElement;

/** jsdom has no layout: give the content element a height so overflow detection sees it. */
const mockContentHeight = (height: number) => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    height,
    width: 300,
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 300,
    bottom: height,
    toJSON: () => ({}),
  } as DOMRect);
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ExpandableMarkdown', () => {
  test('expanded by default: never clamped, even before/without overflow detection (issue #10043)', () => {
    // Clamping "until measured" and releasing a frame later made every expanded-by-default
    // post with a long description jump ~hundreds of px on load.
    mockContentHeight(500);
    render(<ExpandableMarkdown content="A long description" defaultExpanded={true} />);

    expect(clampedBox().style.maxHeight).toBe('');
    expect(clampedBox().className).not.toContain('overflow-hidden');
    // Overflow is still detected so the "read less" toggle is offered.
    expect(screen.getByRole('button', { name: 'postSnippet.readLess' })).toBeInTheDocument();
  });

  test('collapsed by default with overflowing content: clamped, with a "read more" toggle', () => {
    mockContentHeight(500);
    render(<ExpandableMarkdown content="A long description" defaultExpanded={false} />);

    expect(clampedBox().style.maxHeight).not.toBe('');
    expect(clampedBox().className).toContain('overflow-hidden');
    expect(screen.getByRole('button', { name: 'postSnippet.readMore' })).toBeInTheDocument();
  });

  test('collapsed by default with short content: clamp released, no toggle', () => {
    mockContentHeight(20);
    render(<ExpandableMarkdown content="Short" defaultExpanded={false} />);

    expect(clampedBox().style.maxHeight).toBe('');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
