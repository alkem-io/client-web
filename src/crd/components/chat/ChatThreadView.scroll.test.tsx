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

const THREAD_HEIGHT = 1000;
const VIEWPORT_HEIGHT = 400;
const BOTTOM = THREAD_HEIGHT;

describe('ChatThreadView scrolling', () => {
  let resized: () => void = () => {};

  beforeEach(() => {
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
    // jsdom lays nothing out: give every element the thread's height, and a real scrollTop.
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(THREAD_HEIGHT);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(VIEWPORT_HEIGHT);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const renderThread = (messages: ChatMessage[], props: Partial<Parameters<typeof ChatThreadView>[0]> = {}) => {
    const view = render(<ChatThreadView messages={messages} messagesLoading={false} {...props} />);
    const scroller = view.container.querySelector('.overflow-y-auto') as HTMLElement;
    /** Puts the reader `fromBottom` pixels above the end of the thread. */
    const scrollTo = (fromBottom: number) => {
      scroller.scrollTop = THREAD_HEIGHT - VIEWPORT_HEIGHT - fromBottom;
      fireEvent.scroll(scroller);
    };
    const receive = (next: ChatMessage[]) =>
      view.rerender(<ChatThreadView messages={next} messagesLoading={false} {...props} />);
    return { scroller, scrollTo, receive };
  };

  test('contains overscroll on the message scroller, so scrolling past either end does not scroll the page behind', () => {
    const { scroller } = renderThread([]);
    expect(scroller.className).toContain('overflow-y-auto');
    expect(scroller.className).toContain('overscroll-contain');
  });

  test('opens at the latest message', () => {
    const { scroller } = renderThread([message('a'), message('b')]);
    expect(scroller.scrollTop).toBe(BOTTOM);
  });

  test('follows a new message while the reader is at the bottom', () => {
    const { scroller, scrollTo, receive } = renderThread([message('a')]);
    scrollTo(0);
    receive([message('a'), message('b')]);
    expect(scroller.scrollTop).toBe(BOTTOM);
  });

  test('keeps the reader in place when a message arrives while they read older ones', () => {
    const { scroller, scrollTo, receive } = renderThread([message('a')]);
    scrollTo(300);
    receive([message('a'), message('b')]);
    expect(scroller.scrollTop).toBe(300);
  });

  test('keeps the reader in place when their sent message is confirmed under a new id', () => {
    const { scroller, scrollTo, receive } = renderThread([message('a'), message('local', true)]);
    scrollTo(300);
    receive([message('a'), message('confirmed', true)]);
    expect(scroller.scrollTop).toBe(300);
  });

  test('sending takes a reader who had scrolled up to the bottom', () => {
    const onSendMessage = vi.fn();
    const { scroller, scrollTo } = renderThread([message('a')], {
      onSendMessage,
      draft: 'hello',
      onDraftChange: vi.fn(),
    });
    scrollTo(300);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(onSendMessage).toHaveBeenCalledWith('hello');
    expect(scroller.scrollTop).toBe(BOTTOM);
  });

  test('stays at the bottom when media loads and makes the thread taller', () => {
    const { scroller, scrollTo } = renderThread([message('a')]);
    scrollTo(0);
    scroller.scrollTop = 0;
    act(() => resized());
    expect(scroller.scrollTop).toBe(BOTTOM);
  });

  test('does not pull a reader who scrolled up back down when media loads', () => {
    const { scroller, scrollTo } = renderThread([message('a')]);
    scrollTo(300);
    act(() => resized());
    expect(scroller.scrollTop).toBe(300);
  });

  test('offers a jump to the latest messages only while the reader has scrolled up, and reports it', () => {
    const onFollowingChange = vi.fn();
    const { scroller, scrollTo } = renderThread([message('a')], { onFollowingChange });
    expect(screen.queryByRole('button', { name: 'thread.jumpToLatest' })).not.toBeInTheDocument();

    scrollTo(300);
    expect(onFollowingChange).toHaveBeenLastCalledWith(false);

    fireEvent.click(screen.getByRole('button', { name: 'thread.jumpToLatest' }));
    expect(scroller.scrollTop).toBe(BOTTOM);
    expect(onFollowingChange).toHaveBeenLastCalledWith(true);
    expect(screen.queryByRole('button', { name: 'thread.jumpToLatest' })).not.toBeInTheDocument();
  });
});
