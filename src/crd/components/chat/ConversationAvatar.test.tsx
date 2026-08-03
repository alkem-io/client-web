import { render } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { ConversationAvatar } from './ConversationAvatar';

// Shared jsdom-safe avatar double from src/crd/primitives/__mocks__/avatar.tsx.
vi.mock('@/crd/primitives/avatar');

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
    // Single photo avatar — the composite would render one avatar per member.
    expect(container.querySelectorAll('[data-testid="avatar"]')).toHaveLength(1);
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
    expect(container.querySelectorAll('[data-testid="avatar"]')).toHaveLength(2);
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

  test('a11y: every branch is decorative (aria-hidden root), avatar images have empty alt, no interactive elements', () => {
    const branches = [
      <ConversationAvatar key="guidance" displayName="Guidance" isGroup={false} isGuidance={true} />,
      <ConversationAvatar
        key="single"
        displayName="Jane Doe"
        isGroup={false}
        isGuidance={false}
        avatarUrl="https://example.com/jane.png"
      />,
      <ConversationAvatar
        key="group-photo"
        displayName="Team"
        isGroup={true}
        isGuidance={false}
        avatarUrl="https://example.com/group.png"
      />,
      <ConversationAvatar
        key="composite"
        displayName="Team"
        isGroup={true}
        isGuidance={false}
        memberAvatars={[
          { id: '1', name: 'Alice', avatarUrl: 'https://example.com/alice.png' },
          { id: '2', name: 'Bob', avatarUrl: 'https://example.com/bob.png' },
        ]}
      />,
    ];

    for (const branch of branches) {
      const { container } = render(branch);
      expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
      container.querySelectorAll('img').forEach(img => {
        expect(img).toHaveAttribute('alt', '');
      });
      expect(container.querySelectorAll('button, a')).toHaveLength(0);
    }
  });
});
