import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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

const { CalloutReactionsBar } = await import('./CalloutReactionsBar');

const baseSummary = {
  total: 0,
  emojis: [],
  myReactionEmoji: null,
  allowedEmojis: ['heart', 'rocket'],
};

describe('CalloutReactionsBar', () => {
  it('renders only the add button when total is 0 (zero-state)', () => {
    render(<CalloutReactionsBar summary={baseSummary} canReact={true} onAdd={vi.fn()} onRemove={vi.fn()} />);
    // Add button present
    expect(screen.getByRole('button', { name: 'addReaction' })).toBeInTheDocument();
    // No total pill rendered
    expect(screen.queryByRole('button', { name: /people reacted/i })).not.toBeInTheDocument();
  });

  it('renders the total pill when total > 0', () => {
    render(
      <CalloutReactionsBar
        summary={{ ...baseSummary, total: 3, emojis: ['heart'] }}
        canReact={true}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
      />
    );
    // The total pill button is present
    const totalBtn = screen.getAllByRole('button').find(b => b.textContent?.includes('3'));
    expect(totalBtn).toBeDefined();
  });

  it('hides the add affordance when canReact is false (viewer cannot react)', () => {
    render(
      <CalloutReactionsBar
        summary={{ ...baseSummary, total: 2, emojis: ['rocket'] }}
        canReact={false}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
      />
    );
    // No picker trigger
    expect(screen.queryByRole('button', { name: 'addReaction' })).not.toBeInTheDocument();
    // Total pill still visible
    const totalBtn = screen.getAllByRole('button').find(b => b.textContent?.includes('2'));
    expect(totalBtn).toBeDefined();
  });

  it('shows total pill without add affordance when canReact=false', () => {
    render(
      <CalloutReactionsBar
        summary={{ ...baseSummary, total: 5, emojis: ['heart', 'rocket'] }}
        canReact={false}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
      />
    );
    const allButtons = screen.getAllByRole('button');
    expect(allButtons).toHaveLength(1); // only the total pill
  });
});
