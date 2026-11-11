import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { ChatThreadView } from './ChatThreadView';
import type { ChatMessage } from './types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/crd/primitives/avatar');

const message = (id: string, isOwn = false): ChatMessage => ({
  id,
  author: { id: 'alice', name: 'Alice' },
  content: id,
  timestampMs: 1,
  reactions: [],
  isOwn,
});

describe('ChatThreadView scrolling', () => {
  const scrollIntoView = vi.fn();
  let resized: () => void = () => {};

  beforeEach(() => {
    Element.prototype.scrollIntoView = scrollIntoView;
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          resized = callback;
        }
        observe() {}
        disconnect() {}
      }
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    scrollIntoView.mockClear();
  });

  const renderThread = (messages: ChatMessage[]) => {
    const view = render(<ChatThreadView messages={messages} messagesLoading={false} />);
    const scroller = view.container.querySelector('.overflow-y-auto') as HTMLElement;
    /** Puts the reader `fromBottom` pixels above the end of a 1000px thread in a 400px viewport. */
    const scrollTo = (fromBottom: number) => {
      Object.defineProperties(scroller, {
        scrollHeight: { configurable: true, value: 1000 },
        clientHeight: { configurable: true, value: 400 },
        scrollTop: { configurable: true, value: 600 - fromBottom },
      });
      fireEvent.scroll(scroller);
      scrollIntoView.mockClear();
    };
    const receive = (messages: ChatMessage[]) =>
      view.rerender(<ChatThreadView messages={messages} messagesLoading={false} />);
    return { scrollTo, receive };
  };

  test('contains overscroll on the message scroller, so scrolling past either end does not scroll the page behind', () => {
    render(<ChatThreadView messages={[]} messagesLoading={true} />);
    const scroller = screen.getByRole('status', { name: 'thread.loading' }).closest('.overflow-y-auto');
    expect(scroller?.className).toContain('overflow-y-auto');
    expect(scroller?.className).toContain('overscroll-contain');
  });

  test('opens at the latest message', () => {
    renderThread([message('a'), message('b')]);
    expect(scrollIntoView).toHaveBeenCalled();
  });

  test('follows a new message while the reader is at the bottom', () => {
    const { scrollTo, receive } = renderThread([message('a')]);
    scrollTo(0);
    receive([message('a'), message('b')]);
    expect(scrollIntoView).toHaveBeenCalled();
  });

  test('keeps the reader in place when a message arrives while they read older ones', () => {
    const { scrollTo, receive } = renderThread([message('a')]);
    scrollTo(300);
    receive([message('a'), message('b')]);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  test("goes to the bottom for the reader's own message even when they had scrolled up", () => {
    const { scrollTo, receive } = renderThread([message('a')]);
    scrollTo(300);
    receive([message('a'), message('mine', true)]);
    expect(scrollIntoView).toHaveBeenCalled();
  });

  test('stays at the bottom when media loads and makes the thread taller', () => {
    const { scrollTo } = renderThread([message('a')]);
    scrollTo(0);
    act(() => resized());
    expect(scrollIntoView).toHaveBeenCalled();
  });

  test('does not pull a reader who scrolled up back down when media loads', () => {
    const { scrollTo } = renderThread([message('a')]);
    scrollTo(300);
    act(() => resized());
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
