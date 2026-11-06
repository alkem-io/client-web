import { render } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import type { CommentData, MessageAttachment } from './types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Shared jsdom-safe avatar double from src/crd/primitives/__mocks__/avatar.tsx.
vi.mock('@/crd/primitives/avatar');

const { CommentItem } = await import('./CommentItem');

const attachment: MessageAttachment = {
  id: 'att-1',
  url: 'https://alkem.io/storage/document/doc-1',
  displayName: 'photo.png',
  mimeType: 'image/png',
  size: 1024,
};

const baseComment: CommentData = {
  id: 'c1',
  author: { id: 'u1', name: 'Alice Smith' },
  content: 'hello there',
  timestamp: '2m ago',
  timestampMs: 1000,
  reactions: [],
  canDelete: false,
};

const noop = () => {};
const renderComment = (comment: CommentData) =>
  render(
    <CommentItem comment={comment} onDelete={noop} onAddReaction={noop} onRemoveReaction={noop} canComment={false} />
  );

// MarkdownContent is the only element carrying `max-w-none` in this tree.
const markdownBlockOf = (container: HTMLElement) => container.querySelector('.max-w-none');

describe('CommentItem message text', () => {
  test('renders the body of an ordinary comment', () => {
    const { container, getByText } = renderComment(baseComment);
    expect(markdownBlockOf(container)).toBeInTheDocument();
    expect(getByText('hello there')).toBeInTheDocument();
  });

  // A caption-less media event carries the filename as its body (MSC2530). The same
  // suppression ChatMessageBubble applies must hold here — callout/forum rooms render
  // the very same Element-origin messages.
  test('text equal to the single attachment displayName renders the attachment but no text line', () => {
    const { container } = renderComment({ ...baseComment, content: 'photo.png', attachments: [attachment] });

    expect(markdownBlockOf(container)).not.toBeInTheDocument();
    expect(container.querySelector('img[alt]')).toBeInTheDocument();
    expect(container.textContent).not.toContain('photo.png');
  });

  test('the same comparison ignores surrounding whitespace on the body', () => {
    const { container } = renderComment({ ...baseComment, content: '  photo.png ', attachments: [attachment] });
    expect(markdownBlockOf(container)).not.toBeInTheDocument();
  });

  test('a genuine caption on an attachment still renders', () => {
    const { container, getByText } = renderComment({
      ...baseComment,
      content: 'look at this',
      attachments: [attachment],
    });
    expect(markdownBlockOf(container)).toBeInTheDocument();
    expect(getByText('look at this')).toBeInTheDocument();
  });

  test('with several attachments the text is ambiguous, so it is kept', () => {
    const { container } = renderComment({
      ...baseComment,
      content: 'photo.png',
      attachments: [attachment, { ...attachment, id: 'att-2', displayName: 'other.png' }],
    });
    expect(markdownBlockOf(container)).toBeInTheDocument();
  });

  test('an empty body renders no markdown block at all', () => {
    const { container } = renderComment({ ...baseComment, content: '   ' });
    expect(markdownBlockOf(container)).not.toBeInTheDocument();
  });

  test('a deleted comment still shows the deleted placeholder', () => {
    const { getByText } = renderComment({ ...baseComment, isDeleted: true });
    expect(getByText('comments.deleted')).toBeInTheDocument();
  });
});

describe('CommentItem links', () => {
  const linkIn = (content: string) => renderComment({ ...baseComment, content }).container.querySelector('a');

  test.each([
    ['external', '[x](https://example.com/a)'],
    ['bare external URL', 'https://example.com/a'],
    ['protocol-relative', '[x](//example.com/a)'],
  ])('%s link opens in a new tab', (_name, content) => {
    const link = linkIn(content);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test.each([
    ['same-origin', `[x](${window.location.origin}/space/a)`],
    ['relative', '[x](/space/a)'],
    ['fragment', '[x](#section)'],
    ['mailto', '[x](mailto:a@example.com)'],
    ['unparseable', '[x](http://)'],
  ])('%s link stays in the current tab', (_name, content) => {
    const link = linkIn(content);
    expect(link).toHaveAttribute('href');
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });

  test('an authored target cannot pull a same-origin link out of the current tab', () => {
    const link = linkIn(`<a href="${window.location.origin}/space/a" target="_blank">x</a>`);
    expect(link).toHaveAttribute('href');
    expect(link).not.toHaveAttribute('target');
  });

  test('footnote references keep their attributes and stay in the page', () => {
    const { container } = renderComment({ ...baseComment, content: 'text[^1]\n\n[^1]: see https://example.com/a' });
    const footnoteRef = container.querySelector('a[data-footnote-ref]');
    expect(footnoteRef).toHaveAttribute('href', '#user-content-fn-1');
    expect(footnoteRef).not.toHaveAttribute('target');
    const backRef = container.querySelector('a[data-footnote-backref]');
    expect(backRef).not.toHaveAttribute('target');
    expect(container.querySelector('a[href="https://example.com/a"]')).toHaveAttribute('target', '_blank');
  });
});
