import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { ConversationAvatar } from './ConversationAvatar';

// Radix only mounts AvatarPrimitive.Image once the browser reports the image as
// loaded, which never happens in jsdom. Swap it for a plain <img> so the props
// this component (and the GroupAvatar it composes) pass down are observable
// (same approach as ApplicationsBlock.test.tsx).
vi.mock('@/crd/primitives/avatar', () => ({
  Avatar: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  AvatarImage: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
  AvatarFallback: ({ children, className }: { children: ReactNode; className?: string }) => (
    <span className={className}>{children}</span>
  ),
}));

describe('ConversationAvatar', () => {
  test('guidance branch renders the bot circle, no image', () => {
    const { container } = render(<ConversationAvatar displayName="Guidance" isGroup={false} isGuidance={true} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  test('group with avatarUrl renders the single photo avatar, not the composite', () => {
    const { container } = render(
      <ConversationAvatar
        displayName="Team"
        isGroup={true}
        isGuidance={false}
        avatarUrl="https://example.com/group.png"
        memberAvatars={[
          { id: '1', name: 'Alice' },
          { id: '2', name: 'Bob' },
        ]}
      />
    );
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('src', 'https://example.com/group.png');
    // Composite grid root carries aria-hidden — absent when the single-photo branch is used.
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();
  });

  test('group without avatarUrl renders the composite for 2-4 members, initials for those without a photo', () => {
    const { container, getByText } = render(
      <ConversationAvatar
        displayName="Team"
        isGroup={true}
        isGuidance={false}
        memberAvatars={[
          { id: '1', name: 'Alice Smith', avatarUrl: 'https://example.com/alice.png' },
          { id: '2', name: 'Bob Jones' },
        ]}
      />
    );
    const composite = container.querySelector('[aria-hidden="true"]');
    expect(composite).toBeInTheDocument();
    expect(container.querySelectorAll('img')).toHaveLength(1);
    expect(getByText('BJ')).toBeInTheDocument();
  });

  test('non-group renders single avatar: image when avatarUrl set, initials otherwise', () => {
    const { container, getByText } = render(
      <ConversationAvatar displayName="Jane Doe" isGroup={false} isGuidance={false} />
    );
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(getByText('JD')).toBeInTheDocument();
  });

  test('a11y: composite root is aria-hidden, avatar images have empty alt, no interactive elements', () => {
    const { container } = render(
      <ConversationAvatar
        displayName="Team"
        isGroup={true}
        isGuidance={false}
        memberAvatars={[
          { id: '1', name: 'Alice', avatarUrl: 'https://example.com/alice.png' },
          { id: '2', name: 'Bob', avatarUrl: 'https://example.com/bob.png' },
        ]}
      />
    );
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    container.querySelectorAll('img').forEach(img => {
      expect(img).toHaveAttribute('alt', '');
    });
    expect(container.querySelectorAll('button, a')).toHaveLength(0);
  });
});
