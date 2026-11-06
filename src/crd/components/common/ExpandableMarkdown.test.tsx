import { act, fireEvent, render, screen } from '@testing-library/react';
import { Profiler } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { ExpandableMarkdown } from './ExpandableMarkdown';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Renders the test's HTML as-is, so each case controls the exact rendered structure. The
// `__html` object is cached per content: a new object each render makes React rewrite the
// DOM, which react-markdown (keeping its nodes across re-renders) never does.
const htmlCache = new Map<string, { __html: string }>();
vi.mock('@/crd/components/common/MarkdownContent', () => ({
  MarkdownContent: ({ content }: { content: string }) => {
    const html = htmlCache.get(content) ?? { __html: content };
    htmlCache.set(content, html);
    // biome-ignore lint/security/noDangerouslySetInnerHtml: test fixture HTML
    return <div data-testid="markdown" dangerouslySetInnerHTML={html} />;
  },
}));

/** The clip container — the element wrapping the measured content element. */
const clipBox = () => screen.getByTestId('markdown').parentElement?.parentElement as HTMLElement;

const LINE_HEIGHT = 18;
const LINE_PITCH = 22;

/**
 * jsdom has no layout. A text node's rendered lines come from its parent's
 * `data-top` (px from the content top), `data-lines` and optional `data-height`
 * attributes, one line box every `LINE_PITCH` px.
 */
function getClientRects(this: Range) {
  const parent = this.startContainer.parentElement;
  const top = Number(parent?.dataset.top ?? 0);
  const count = Number(parent?.dataset.lines ?? 1);
  const height = Number(parent?.dataset.height ?? LINE_HEIGHT);
  return Array.from({ length: count }, (_, i) => ({
    top: top + i * LINE_PITCH,
    bottom: top + i * LINE_PITCH + height,
    height,
  }));
}

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    height: 500,
    width: 300,
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 300,
    bottom: 500,
    toJSON: () => ({}),
  } as DOMRect);
  Object.defineProperty(Range.prototype, 'getClientRects', { configurable: true, value: getClientRects });
});

afterEach(() => {
  vi.restoreAllMocks();
});

const LONG_TEXT = '<p data-top="0" data-lines="6">A long description</p>';

describe('ExpandableMarkdown', () => {
  test('expanded by default: never clipped, even before/without overflow detection (issue #10043)', () => {
    render(<ExpandableMarkdown content={LONG_TEXT} defaultExpanded={true} />);

    expect(clipBox().style.maxHeight).toBe('');
    expect(clipBox().className).not.toContain('overflow-hidden');
    // Overflow is still detected so the "show less" toggle is offered.
    expect(screen.getByRole('button', { name: 'postSnippet.showLess' })).toBeInTheDocument();
  });

  test('collapsed with a paragraph break inside the first 3 lines: cut directly under the 3rd line, no fade', () => {
    // Lines at 0–18 and 22–40, a paragraph gap, then 56–74 and 78–96.
    render(
      <ExpandableMarkdown
        content={'<p data-top="0" data-lines="2">First</p><p data-top="56" data-lines="2">Second</p>'}
        defaultExpanded={false}
      />
    );

    expect(clipBox().style.maxHeight).toBe('74px');
    expect(clipBox().className).toContain('overflow-hidden');
    expect(document.querySelector('[aria-hidden="true"]')).toBeNull();
    expect(screen.getByRole('button', { name: 'postSnippet.readMore' })).toBeInTheDocument();
  });

  test('Read more expands inline as authored; Show less collapses again', () => {
    render(<ExpandableMarkdown content={LONG_TEXT} defaultExpanded={false} />);

    fireEvent.click(screen.getByRole('button', { name: 'postSnippet.readMore' }));
    expect(clipBox().style.maxHeight).toBe('');
    expect(clipBox().className).toBe('');
    const showLess = screen.getByRole('button', { name: 'postSnippet.showLess' });
    expect(showLess).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(showLess);
    expect(clipBox().style.maxHeight).toBe(`${2 * LINE_PITCH + LINE_HEIGHT}px`);
  });

  test('exactly 3 lines, no images: shown in full, no toggle', () => {
    render(<ExpandableMarkdown content={'<p data-top="0" data-lines="3">Three</p>'} defaultExpanded={false} />);

    expect(clipBox().style.maxHeight).toBe('');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('hero image with short text: hero cropped, text in full, Read more offered', () => {
    render(
      <ExpandableMarkdown
        content={'<p><img src="hero.png" alt="" /></p><p data-top="200" data-lines="1">Short</p>'}
        defaultExpanded={false}
      />
    );

    expect(document.querySelector('img')?.dataset.collapse).toBe('hero');
    expect(clipBox().className).toContain('[&_[data-collapse=hero]]:!max-h-[160px]');
    expect(clipBox().style.maxHeight).toBe('');
    expect(screen.getByRole('button', { name: 'postSnippet.readMore' })).toBeInTheDocument();
  });

  test('images after or between text are hidden while collapsed and restored on expand', () => {
    render(
      <ExpandableMarkdown
        content={
          '<p data-top="0" data-lines="1">Intro</p><p><img src="a.png" alt="" /></p>' +
          '<p data-top="40" data-lines="1">More</p><p><img src="b.png" alt="" /></p>'
        }
        defaultExpanded={false}
      />
    );

    const images = Array.from(document.querySelectorAll('img'));
    expect(images.map(img => img.dataset.collapse)).toEqual(['hidden', 'hidden']);
    expect(clipBox().className).toContain('[&_[data-collapse=hidden]]:!hidden');

    fireEvent.click(screen.getByRole('button', { name: 'postSnippet.readMore' }));
    expect(clipBox().className).not.toContain('[&_[data-collapse=hidden]]:!hidden');
  });

  test('image-only post: every image cropped like a hero, never hidden', () => {
    render(
      <ExpandableMarkdown
        content={'<p><img src="a.png" alt="" /></p><p><img src="b.png" alt="" /></p>'}
        defaultExpanded={false}
      />
    );

    const images = Array.from(document.querySelectorAll('img'));
    expect(images.map(img => img.dataset.collapse)).toEqual(['hero', 'hero']);
    expect(screen.getByRole('button', { name: 'postSnippet.readMore' })).toBeInTheDocument();
  });

  test('the preview rules beat authored inline styles (display, min-height) while collapsed', () => {
    render(
      <ExpandableMarkdown
        content={
          '<p><img src="a.png" alt="" style="min-height:300px" /></p><p data-top="200" data-lines="1">Text</p>' +
          '<p><img src="b.png" alt="" style="display:block" /></p>'
        }
        defaultExpanded={false}
      />
    );

    expect(clipBox().className).toContain('[&_[data-collapse=hero]]:!min-h-0');
    expect(clipBox().className).toContain('[&_[data-collapse=hero]]:!max-h-[160px]');
    expect(clipBox().className).toContain('[&_[data-collapse=hidden]]:!hidden');
  });

  test('an embed with short text is collapsible like an image: leading cropped, trailing hidden', () => {
    const { unmount } = render(
      <ExpandableMarkdown
        content={'<div data-embed=""><iframe title="video"></iframe></div><p data-top="200" data-lines="1">Short</p>'}
        defaultExpanded={false}
      />
    );
    expect(document.querySelector<HTMLElement>('[data-embed]')?.dataset.collapse).toBe('hero');
    expect(screen.getByRole('button', { name: 'postSnippet.readMore' })).toBeInTheDocument();
    unmount();

    render(
      <ExpandableMarkdown
        content={'<p data-top="0" data-lines="1">Short</p><div data-embed=""><iframe title="video"></iframe></div>'}
        defaultExpanded={false}
      />
    );
    expect(document.querySelector<HTMLElement>('[data-embed]')?.dataset.collapse).toBe('hidden');
    expect(screen.getByRole('button', { name: 'postSnippet.readMore' })).toBeInTheDocument();
  });

  test('inline code in a heading is one visual line, not two', () => {
    // A 30px heading line box with a 16px code fragment sitting inside it, then two lines.
    render(
      <ExpandableMarkdown
        content={
          '<h1 data-top="0" data-height="30">Title <code data-top="8" data-height="16">x</code></h1>' +
          '<p data-top="40" data-lines="2">Body</p>'
        }
        defaultExpanded={false}
      />
    );

    expect(clipBox().style.maxHeight).toBe('');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('text out of visual order (table cells side by side) still cuts under the 3rd visual line', () => {
    render(
      <ExpandableMarkdown
        content={'<p data-top="44" data-lines="3">Right cell</p><p data-top="0" data-lines="2">Left cell</p>'}
        defaultExpanded={false}
      />
    );

    expect(clipBox().style.maxHeight).toBe(`${44 + LINE_HEIGHT}px`);
  });

  test('a very long post is measured in time linear in its lines', () => {
    const start = performance.now();
    render(<ExpandableMarkdown content={'<pre data-top="0" data-lines="25000">code</pre>'} defaultExpanded={false} />);
    const elapsed = performance.now() - start;

    expect(clipBox().style.maxHeight).toBe(`${2 * LINE_PITCH + LINE_HEIGHT}px`);
    expect(elapsed).toBeLessThan(1000);
  });

  test('a resize that leaves the measurement unchanged does not re-render', () => {
    const callbacks: ResizeObserverCallback[] = [];
    vi.spyOn(globalThis, 'ResizeObserver').mockImplementation(function (this: unknown, cb: ResizeObserverCallback) {
      callbacks.push(cb);
      return { observe: () => {}, unobserve: () => {}, disconnect: () => {} } as unknown as ResizeObserver;
    } as unknown as typeof ResizeObserver);
    let commits = 0;
    render(
      <Profiler id="expandable" onRender={() => commits++}>
        <ExpandableMarkdown content={LONG_TEXT} defaultExpanded={false} />
      </Profiler>
    );
    const resize = () =>
      act(() => {
        for (const cb of callbacks) cb([], {} as ResizeObserver);
      });
    // React may render once more before it bails out of a same-state update; settle that first.
    resize();
    const before = commits;

    resize();
    resize();

    expect(commits).toBe(before);
  });
});
