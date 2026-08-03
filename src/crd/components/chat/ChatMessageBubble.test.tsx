import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, test, vi } from 'vitest';
import type { ChatMessage } from './types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Radix only mounts AvatarPrimitive.Image once the browser reports the image as
// loaded, which never happens in jsdom (same approach as ApplicationsBlock.test.tsx).
vi.mock('@/crd/primitives/avatar', () => ({
  Avatar: ({ children, className, ...rest }: { children: ReactNode; className?: string }) => (
    <div className={className} {...rest}>
      {children}
    </div>
  ),
  AvatarImage: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
  AvatarFallback: ({ children, className }: { children: ReactNode; className?: string }) => (
    <span className={className}>{children}</span>
  ),
}));

const { ChatMessageBubble } = await import('./ChatMessageBubble');

const baseMessage: ChatMessage = {
  id: 'm1',
  author: { id: 'u1', name: 'Alice Smith', avatarUrl: 'https://example.com/alice.png' },
  content: 'hello',
  timestamp: '2m ago',
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

  test('reactions + timestamp render inside the gutter-offset column', () => {
    const messageWithExtras: ChatMessage = {
      ...baseMessage,
      reactions: [{ emoji: '👍', count: 1, hasReacted: false }],
    };
    const { container, getByText } = render(
      <ChatMessageBubble message={messageWithExtras} avatarGutter={true} showAvatar={true} showAuthor={true} />
    );
    expect(getByText('2m ago')).toBeInTheDocument();
    expect(container.textContent).toContain('👍');
    // Both live inside the right-hand bubble column, a sibling of the w-8 gutter.
    const gutter = container.querySelector('.w-8');
    const bubbleColumn = gutter?.nextElementSibling;
    expect(bubbleColumn?.textContent).toContain('2m ago');
    expect(bubbleColumn?.textContent).toContain('👍');
  });
});
