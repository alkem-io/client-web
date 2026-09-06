import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock generated Apollo hooks — the connector does not test the mutations,
// only the privilege-gating logic that decides what props the bar receives.
const addReactionMock = vi.fn();
const removeReactionMock = vi.fn();
const fetchWhoReactedMock = vi.fn();

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useAddReactionToCalloutMutation: () => [addReactionMock, {}] as const,
  useRemoveReactionFromCalloutMutation: () => [removeReactionMock, {}] as const,
  useCalloutWhoReactedLazyQuery: () => [fetchWhoReactedMock, {}] as const,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
    i18n: { language: 'en' },
  }),
}));

vi.mock('@/crd/lib/dateFnsLocale', () => ({
  resolveDateFnsLocale: () => undefined,
}));

vi.mock('@/crd/primitives/popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ children, asChild: _asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    <div>{children}</div>
  ),
  PopoverContent: ({ children }: { children: React.ReactNode }) => <div data-testid="popover-content">{children}</div>,
}));

vi.mock('@/crd/primitives/avatar', () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AvatarImage: () => null,
  AvatarFallback: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

const { CalloutReactionsConnector } = await import('./CalloutReactionsConnector');
const { AuthorizationPrivilege } = await import('@/core/apollo/generated/graphql-schema');

const baseSummary = {
  total: 2,
  emojis: ['heart'],
  myReactionEmoji: null,
  allowedEmojis: ['heart', 'rocket'],
};

describe('CalloutReactionsConnector privilege gating', () => {
  it('renders nothing when reactionsSummary is null (wave-2-before-wave-1 guard)', () => {
    const { container } = render(
      <CalloutReactionsConnector
        calloutId="callout-1"
        reactionsSummary={null}
        myPrivileges={[AuthorizationPrivilege.Contribute]}
        isPublished={true}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when reactionsSummary is undefined (field absent from server)', () => {
    const { container } = render(
      <CalloutReactionsConnector
        calloutId="callout-1"
        reactionsSummary={undefined}
        myPrivileges={[AuthorizationPrivilege.Contribute]}
        isPublished={true}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the reactions bar with canReact=false when viewer lacks CONTRIBUTE privilege', () => {
    // Non-contributor can see who reacted (total pill) but not add a reaction
    render(
      <CalloutReactionsConnector
        calloutId="callout-1"
        reactionsSummary={baseSummary}
        myPrivileges={[]}
        isPublished={true}
      />
    );
    // The bar is rendered — pill with total count is visible
    const totalButton = screen.getAllByRole('button').find(b => b.textContent?.includes('2'));
    expect(totalButton).toBeDefined();
    // The add-reaction picker is NOT rendered because canReact is false
    expect(screen.queryByRole('button', { name: 'addReaction' })).not.toBeInTheDocument();
  });

  it('renders the reactions bar with canReact=false when callout is not published', () => {
    // Even with CONTRIBUTE, a draft callout must not show the add affordance
    render(
      <CalloutReactionsConnector
        calloutId="callout-1"
        reactionsSummary={baseSummary}
        myPrivileges={[AuthorizationPrivilege.Contribute]}
        isPublished={false}
      />
    );
    const totalButton = screen.getAllByRole('button').find(b => b.textContent?.includes('2'));
    expect(totalButton).toBeDefined();
    expect(screen.queryByRole('button', { name: 'addReaction' })).not.toBeInTheDocument();
  });

  it('renders the reactions bar with canReact=true when viewer has CONTRIBUTE and callout is published', () => {
    render(
      <CalloutReactionsConnector
        calloutId="callout-1"
        reactionsSummary={baseSummary}
        myPrivileges={[AuthorizationPrivilege.Contribute]}
        isPublished={true}
      />
    );
    // Add-reaction trigger is present
    expect(screen.getByRole('button', { name: 'addReaction' })).toBeInTheDocument();
  });
});
