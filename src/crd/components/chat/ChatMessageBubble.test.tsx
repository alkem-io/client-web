import { fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, test, vi } from 'vitest';
import type { ChatMessage } from './types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Shared jsdom-safe avatar double from src/crd/primitives/__mocks__/avatar.tsx.
vi.mock('@/crd/primitives/avatar');

// The real picker is a lazy-loaded emoji grid; this double exposes one pick per emoji.
vi.mock('@/crd/components/common/EmojiPicker', () => ({
  EmojiPicker: ({ onSelect, trigger }: { onSelect: (emoji: string) => void; trigger: ReactNode }) => (
    <>
      {trigger}
      <button type="button" onClick={() => onSelect('👍')}>
        pick 👍
      </button>
    </>
  ),
}));

const { ChatMessageBubble } = await import('./ChatMessageBubble');

const baseMessage: ChatMessage = {
  id: 'm1',
  author: { id: 'u1', name: 'Alice Smith', avatarUrl: 'https://example.com/alice.png' },
  content: 'hello',
  timestampMs: 1000,
  reactions: [],
  isOwn: false,
};

describe('ChatMessageBubble', () => {
  test('no-gutter render (own message): no gutter wrapper, structure unchanged', () => {
    const { container } = render(<ChatMessageBubble message={{ ...baseMessage, isOwn: true }} />);
    // No w-8 gutter/spacer column and no sr-only attribution.
    expect(container.querySelector('.w-8')).not.toBeInTheDocument();
    expect(container.querySelector('.sr-only')).not.toBeInTheDocument();
    // Root is the bubble column itself (items-end for own messages).
    expect(container.firstElementChild).toHaveClass('items-end');
  });

  test('no-gutter render (incoming, non-group): no gutter wrapper, structure unchanged', () => {
    const { container } = render(<ChatMessageBubble message={baseMessage} showAuthor={false} />);
    expect(container.querySelector('.w-8')).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass('items-start');
  });

  test('avatarGutter + showAvatar renders the size-8 avatar with empty alt and aria-hidden', () => {
    const { container } = render(
      <ChatMessageBubble message={baseMessage} avatarGutter={true} showAvatar={true} showAuthor={true} />
    );
    const avatar = container.querySelector('.size-8[aria-hidden="true"]');
    expect(avatar).toBeInTheDocument();
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('src', 'https://example.com/alice.png');
    expect(img).toHaveAttribute('alt', '');
  });

  test('avatarGutter without showAvatar renders the spacer and no avatar', () => {
    const { container } = render(
      <ChatMessageBubble message={baseMessage} avatarGutter={true} showAvatar={false} showAuthor={false} />
    );
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.querySelector('.size-8')).not.toBeInTheDocument();
    // The w-8 spacer column is still present to hold the indent.
    expect(container.querySelector('.w-8')).toBeInTheDocument();
  });

  test('continuation (gutter present, showAuthor false) renders the sr-only sender name', () => {
    const { getByText } = render(
      <ChatMessageBubble message={baseMessage} avatarGutter={true} showAvatar={false} showAuthor={false} />
    );
    const srName = getByText('Alice Smith');
    expect(srName).toHaveClass('sr-only');
  });

  test('first-of-run (showAuthor) renders the visible name row + VC badge when applicable', () => {
    const vcMessage: ChatMessage = {
      ...baseMessage,
      author: { id: 'u1', name: 'Alice Smith', avatarUrl: 'https://example.com/alice.png', isVirtualContributor: true },
    };
    const { getByText, container } = render(
      <ChatMessageBubble message={vcMessage} avatarGutter={true} showAvatar={true} showAuthor={true} />
    );
    const nameSpan = getByText('Alice Smith');
    expect(nameSpan).not.toHaveClass('sr-only');
    // VC badge renders (VirtualContributorBadge renders "virtualContributor" key via the mocked t()).
    expect(container.textContent).toContain('virtualContributor');
  });

  describe('text bubble visibility', () => {
    const attachment = {
      id: 'att-1',
      url: 'https://alkem.io/storage/document/doc-1',
      displayName: 'photo.png',
      mimeType: 'image/png',
      size: 1024,
    };
    // The text bubble is the only `rounded-2xl` element in the tree.
    const bubbleOf = (container: HTMLElement) => container.querySelector('.rounded-2xl');

    test('a message with text renders the bubble', () => {
      const { container } = render(<ChatMessageBubble message={baseMessage} />);
      expect(bubbleOf(container)).toBeInTheDocument();
    });

    test('an attachment-only message renders its attachments and no empty bubble', () => {
      const { container } = render(
        <ChatMessageBubble message={{ ...baseMessage, content: '', attachments: [attachment] }} />
      );
      expect(bubbleOf(container)).not.toBeInTheDocument();
      expect(container.querySelector('img[alt]')).toBeInTheDocument();
    });

    // Regression guard: the old condition was `hasText || !hasAttachments`, so a
    // message with NEITHER text nor attachments still painted an empty bubble
    // wrapping an empty MarkdownContent.
    test('a message with neither text nor attachments renders no bubble at all', () => {
      const { container } = render(<ChatMessageBubble message={{ ...baseMessage, content: '   ' }} />);
      expect(bubbleOf(container)).not.toBeInTheDocument();
    });

    // A caption-less media event carries the filename as its body (MSC2530), so the
    // text would otherwise render as a line above its own attachment.
    test('text equal to the single attachment displayName renders the attachment but no text line', () => {
      const { container } = render(
        <ChatMessageBubble message={{ ...baseMessage, content: 'photo.png', attachments: [attachment] }} />
      );
      expect(bubbleOf(container)).not.toBeInTheDocument();
      expect(container.querySelector('img[alt]')).toBeInTheDocument();
      // A genuine caption still renders.
      const withCaption = render(
        <ChatMessageBubble message={{ ...baseMessage, content: 'look at this', attachments: [attachment] }} />
      );
      expect(bubbleOf(withCaption.container)).toBeInTheDocument();
    });
  });

  describe('add-reaction control placement', () => {
    const attachment = {
      id: 'att-1',
      url: 'https://alkem.io/storage/document/doc-1',
      displayName: 'photo.png',
      mimeType: 'image/png',
      size: 1024,
    };
    const follows = (earlier: Element, later: Element) =>
      Boolean(earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING);
    const renderReactable = (message: ChatMessage) =>
      render(<ChatMessageBubble message={message} canReact={true} onAddReaction={vi.fn()} />);

    test.each([
      ['an attachment-only', ''],
      ['a captioned', 'look at this'],
    ])('%s media message shows it after the media and its reactions', (_label, content) => {
      const { getByRole } = renderReactable({
        ...baseMessage,
        content,
        attachments: [attachment],
        reactions: [{ emoji: '👍', count: 1, hasReacted: false }],
      });
      const trigger = getByRole('button', { name: 'thread.addReaction' });
      expect(follows(getByRole('img', { name: 'messageAttachments.imageAlt' }), trigger)).toBe(true);
      expect(follows(getByRole('button', { name: /^👍/ }), trigger)).toBe(true);
    });

    test('a text-only message keeps it beside the bubble', () => {
      const { container, getByRole } = renderReactable(baseMessage);
      const trigger = getByRole('button', { name: 'thread.addReaction' });
      expect(trigger.parentElement).toBe(container.querySelector('.rounded-2xl')?.parentElement);
    });
  });

  test('reactions render inside the gutter-offset column', () => {
    const messageWithExtras: ChatMessage = {
      ...baseMessage,
      reactions: [{ emoji: '👍', count: 1, hasReacted: false }],
    };
    const { container } = render(
      <ChatMessageBubble message={messageWithExtras} avatarGutter={true} showAvatar={true} showAuthor={true} />
    );
    const gutter = container.querySelector('.w-8');
    expect(gutter?.nextElementSibling?.textContent).toContain('👍');
  });

  // jsdom has no layout, so these pin the classes the browser check relies on:
  // a long unbroken token must be allowed to break, and the 85% cap must be
  // taken of the thread width rather than of a shrink-to-fit box.
  describe('text wrapping', () => {
    const bubbleOf = (container: HTMLElement) => container.querySelector('.rounded-2xl') as HTMLElement;

    test('the bubble lets an unbroken token wrap anywhere and may shrink below it', () => {
      const { container } = render(<ChatMessageBubble message={{ ...baseMessage, content: 'x'.repeat(300) }} />);
      expect(bubbleOf(container)).toHaveClass('[overflow-wrap:anywhere]', 'min-w-0', 'max-w-[85%]');
    });

    test.each([false, true])('the bubble row spans the column so the cap is taken of the thread (own: %s)', isOwn => {
      const { container } = render(<ChatMessageBubble message={{ ...baseMessage, isOwn }} />);
      expect(bubbleOf(container).parentElement).toHaveClass('w-full');
    });

    test('in a group the bubble column fills the space beside the avatar gutter', () => {
      const { container } = render(<ChatMessageBubble message={baseMessage} avatarGutter={true} showAvatar={true} />);
      expect(container.querySelector('.w-8')?.nextElementSibling).toHaveClass('min-w-0', 'flex-1');
    });
  });

  describe('text is shown as typed', () => {
    test.each([
      ['an angle-bracketed word', 'see <this> here', 'see <this> here'],
      ['a message that is only a tag-like token', '<hello>', '<hello>'],
      ['an HTML-looking tag pair', '<b>bold</b>', '<b>bold</b>'],
    ])('%s stays visible as literal text', (_label, content, expected) => {
      const { container } = render(<ChatMessageBubble message={{ ...baseMessage, content }} />);
      expect(container.querySelector('.rounded-2xl')?.textContent).toBe(expected);
      expect(container.querySelector('.rounded-2xl b')).not.toBeInTheDocument();
    });

    test('markdown formatting still renders', () => {
      const { container } = render(<ChatMessageBubble message={{ ...baseMessage, content: 'a **b** c' }} />);
      expect(container.querySelector('.rounded-2xl strong')?.textContent).toBe('b');
    });

    test('a line that starts with a tag does not swallow the markdown on the lines after it', () => {
      const content = '<note>\n**Important**: read this\n- item one\n- item two';
      const { container } = render(<ChatMessageBubble message={{ ...baseMessage, content }} />);
      const bubble = container.querySelector('.rounded-2xl');
      expect(bubble?.textContent).toContain('<note>');
      expect(bubble?.querySelector('strong')?.textContent).toBe('Important');
      expect(bubble?.querySelectorAll('li')).toHaveLength(2);
    });

    test('an autolinked URL still renders as a link', () => {
      const { container } = render(
        <ChatMessageBubble message={{ ...baseMessage, content: '<https://alkem.io/path>' }} />
      );
      expect(container.querySelector('.rounded-2xl a')).toHaveAttribute('href', 'https://alkem.io/path');
    });
  });

  describe('picking an emoji', () => {
    const renderPickable = (reactions: ChatMessage['reactions']) => {
      const onAddReaction = vi.fn();
      const onRemoveReaction = vi.fn();
      const utils = render(
        <ChatMessageBubble
          message={{ ...baseMessage, reactions }}
          canReact={true}
          onAddReaction={onAddReaction}
          onRemoveReaction={onRemoveReaction}
        />
      );
      fireEvent.click(utils.getByRole('button', { name: 'pick 👍' }));
      return { onAddReaction, onRemoveReaction };
    };

    test('adds a reaction the user has not made yet', () => {
      const { onAddReaction, onRemoveReaction } = renderPickable([{ emoji: '👍', count: 2, hasReacted: false }]);
      expect(onAddReaction).toHaveBeenCalledWith('👍');
      expect(onRemoveReaction).not.toHaveBeenCalled();
    });

    test('removes the reaction when the user already reacted with that emoji, like its pill does', () => {
      const { onAddReaction, onRemoveReaction } = renderPickable([{ emoji: '👍', count: 1, hasReacted: true }]);
      expect(onAddReaction).not.toHaveBeenCalled();
      expect(onRemoveReaction).toHaveBeenCalledWith('👍');
    });

    test('adds when the only matching reaction is a different key', () => {
      const { onAddReaction } = renderPickable([{ emoji: '👍🏽', count: 1, hasReacted: true }]);
      expect(onAddReaction).toHaveBeenCalledWith('👍');
    });
  });

  describe('add-reaction trigger on touch screens', () => {
    const triggerOf = (revealed?: boolean) =>
      render(
        <ChatMessageBubble message={baseMessage} canReact={true} onAddReaction={vi.fn()} revealed={revealed} />
      ).getByRole('button', { name: 'thread.addReaction' });

    test('without hover it stays out of the way until the message is tapped', () => {
      const trigger = triggerOf(false);
      expect(trigger).toHaveClass('[@media(hover:none)]:hidden');
    });

    test('a tapped (revealed) message shows the trigger', () => {
      const trigger = triggerOf(true);
      expect(trigger).toHaveClass('opacity-100');
      expect(trigger).not.toHaveClass('[@media(hover:none)]:hidden');
      expect(trigger).not.toHaveClass('opacity-0');
    });

    test('with hover it still appears on hover and on keyboard focus', () => {
      const trigger = triggerOf(false);
      expect(trigger).toHaveClass('opacity-0', 'group-hover:opacity-100', 'focus-visible:opacity-100');
    });
  });

  describe('group position corners', () => {
    const cornersOf = (groupPosition: 'single' | 'first' | 'middle' | 'last', isOwn = false) =>
      render(<ChatMessageBubble message={{ ...baseMessage, isOwn }} groupPosition={groupPosition} />)
        .container.querySelector('.rounded-2xl')
        ?.getAttribute('class');

    test.each([
      ['single', ['rounded-bl-sm'], ['rounded-tl-sm']],
      ['first', ['rounded-bl-sm'], ['rounded-tl-sm']],
      ['middle', ['rounded-tl-sm', 'rounded-bl-sm'], []],
      ['last', ['rounded-tl-sm'], ['rounded-bl-sm']],
    ] as const)('incoming %s', (position, present, absent) => {
      const classes = cornersOf(position)?.split(' ') ?? [];
      for (const c of present) expect(classes).toContain(c);
      for (const c of absent) expect(classes).not.toContain(c);
    });

    test.each([
      ['middle', ['rounded-tr-sm', 'rounded-br-sm']],
      ['last', ['rounded-tr-sm']],
    ] as const)('own %s mirrors to the right', (position, present) => {
      const classes = cornersOf(position, true)?.split(' ') ?? [];
      for (const c of present) expect(classes).toContain(c);
    });
  });
});
