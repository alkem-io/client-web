import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, test, vi } from 'vitest';
import type { CommentData } from './types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { name?: string }) => (opts?.name ? `${key}:${opts.name}` : key),
  }),
}));

// Shared jsdom-safe avatar double from src/crd/primitives/__mocks__/avatar.tsx.
vi.mock('@/crd/primitives/avatar');

const { CommentThread } = await import('./CommentThread');

const comment: CommentData = {
  id: 'c1',
  author: { id: 'u1', name: 'Alice Smith' },
  content: 'hello there',
  timestamp: '2m ago',
  timestampMs: 1000,
  reactions: [],
  canDelete: false,
};

const noop = () => {};

type ThreadProps = Partial<Parameters<typeof CommentThread>[0]>;
const renderThread = (props: ThreadProps = {}) =>
  render(
    <CommentThread
      comments={[comment]}
      onReply={noop}
      onDelete={noop}
      onAddReaction={noop}
      onRemoveReaction={noop}
      {...props}
    />
  );

const openReply = () => fireEvent.click(screen.getByRole('button', { name: 'comments.reply' }));
const replyBox = () => screen.queryByRole('textbox', { name: 'comments.addComment' });
const submitReply = (text: string) => {
  const textarea = replyBox() as HTMLTextAreaElement;
  fireEvent.change(textarea, { target: { value: text } });
  fireEvent.keyDown(textarea, { key: 'Enter' });
};

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const imageReply = { attachmentsEnabled: true, imagesOnly: true };

describe('CommentThread reply composer', () => {
  // The reply input scrolls itself into view on open; jsdom has no layout.
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  test('reports the open reply target on open and undefined on close', () => {
    const onReplyTargetChange = vi.fn();
    renderThread({ onReplyTargetChange });
    expect(onReplyTargetChange).toHaveBeenLastCalledWith(undefined);
    openReply();
    expect(onReplyTargetChange).toHaveBeenLastCalledWith('c1');
    openReply();
    expect(onReplyTargetChange).toHaveBeenLastCalledWith(undefined);
  });

  test('spreads replyInputProps onto the reply input', () => {
    renderThread({ replyInputProps: { attachmentsEnabled: true, imagesOnly: true } });
    openReply();
    expect(screen.getByRole('button', { name: 'comments.attachments.addImage' })).toBeInTheDocument();
  });

  test('with reply input props, keeps the reply box open until onReply resolves, then closes it', async () => {
    const pending = deferred<boolean>();
    const onReply = vi.fn(() => pending.promise);
    renderThread({ onReply, replyInputProps: imageReply });
    openReply();
    submitReply('a reply');
    expect(onReply).toHaveBeenCalledWith('c1', 'a reply');
    expect(replyBox()).toBeInTheDocument();
    await act(async () => {
      pending.resolve(true);
      await pending.promise;
    });
    expect(replyBox()).not.toBeInTheDocument();
  });

  test.each([
    ['resolves false', (d: ReturnType<typeof deferred<boolean>>) => d.resolve(false)],
    ['rejects', (d: ReturnType<typeof deferred<boolean>>) => d.reject(new Error('send failed'))],
  ])('with reply input props, keeps the box open when onReply %s', async (_label, settle) => {
    const pending = deferred<boolean>();
    renderThread({ onReply: () => pending.promise, replyInputProps: imageReply });
    openReply();
    submitReply('a reply');
    await act(async () => {
      settle(pending);
      await pending.promise.catch(() => {});
    });
    expect(replyBox()).toBeInTheDocument();
  });

  test('a controlled reply value survives a failed send', async () => {
    const pending = deferred<boolean>();
    const onValueChange = vi.fn();
    renderThread({ onReply: () => pending.promise, replyInputProps: { value: 'typed reply', onValueChange } });
    openReply();
    fireEvent.keyDown(replyBox() as HTMLTextAreaElement, { key: 'Enter' });
    await act(async () => {
      pending.resolve(false);
      await pending.promise;
    });
    expect(replyBox()).toHaveValue('typed reply');
    expect(onValueChange).not.toHaveBeenCalledWith('');
  });

  test('with reply input props, reply toggles are ignored while a reply is being sent', async () => {
    const pending = deferred<boolean>();
    const onReplyTargetChange = vi.fn();
    const older: CommentData = { ...comment, id: 'c0', content: 'older', timestampMs: 500 };
    renderThread({
      comments: [comment, older],
      onReply: () => pending.promise,
      onReplyTargetChange,
      replyInputProps: imageReply,
    });
    const replyButtons = () => screen.getAllByRole('button', { name: 'comments.reply' });
    // Newest first: c1, then c0.
    fireEvent.click(replyButtons()[0]);
    submitReply('a reply');
    // Opening another comment's reply mid-send is ignored...
    fireEvent.click(replyButtons()[1]);
    expect(onReplyTargetChange).toHaveBeenLastCalledWith('c1');
    expect(document.getElementById('comment-reply-input-c0')).toBeNull();
    // ...and so is closing the box being sent.
    fireEvent.click(replyButtons()[0]);
    expect(onReplyTargetChange).toHaveBeenLastCalledWith('c1');
    expect(document.getElementById('comment-reply-input-c1')).toBeInTheDocument();
    await act(async () => {
      pending.resolve(false);
      await pending.promise;
    });
    fireEvent.click(replyButtons()[1]);
    expect(onReplyTargetChange).toHaveBeenLastCalledWith('c0');
    expect(document.getElementById('comment-reply-input-c0')).toBeInTheDocument();
  });

  test('with reply input props, a synchronous void onReply still closes the box', async () => {
    const onReply = vi.fn();
    renderThread({ onReply, replyInputProps: imageReply });
    openReply();
    submitReply('a reply');
    await act(async () => {
      await Promise.resolve();
    });
    expect(onReply).toHaveBeenCalledWith('c1', 'a reply');
    expect(replyBox()).not.toBeInTheDocument();
  });

  test('without reply input props the box closes on submit, without waiting for onReply', () => {
    const pending = deferred<boolean>();
    const onReply = vi.fn(() => pending.promise);
    renderThread({ onReply });
    openReply();
    submitReply('a reply');
    expect(onReply).toHaveBeenCalledExactlyOnceWith('c1', 'a reply');
    expect(replyBox()).not.toBeInTheDocument();
    // Toggles are never held back, and a reopened box starts empty.
    openReply();
    expect(replyBox()).toHaveValue('');
  });
});
