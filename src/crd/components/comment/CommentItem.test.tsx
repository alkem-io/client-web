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
