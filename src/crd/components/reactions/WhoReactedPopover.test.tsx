import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

vi.mock('@/crd/lib/dateFnsLocale', () => ({
  resolveDateFnsLocale: () => undefined,
}));

vi.mock('@/crd/primitives/avatar', () => ({
  Avatar: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  AvatarImage: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
  AvatarFallback: ({ children, className }: { children: ReactNode; className?: string }) => (
    <span className={className}>{children}</span>
  ),
}));

vi.mock('@/crd/primitives/popover', () => ({
  Popover: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PopoverContent: ({ children }: { children: ReactNode }) => <div data-testid="who-reacted-content">{children}</div>,
}));

const { WhoReactedPopover } = await import('./WhoReactedPopover');

const baseRows = [
  {
    id: '1',
    emoji: 'heart',
    updatedDate: '2026-01-01T10:00:00Z',
    user: { displayName: 'Alice', avatarUrl: undefined },
  },
  { id: '2', emoji: 'rocket', updatedDate: '2026-01-01T09:00:00Z', user: { displayName: 'Bob', avatarUrl: undefined } },
];

describe('WhoReactedPopover', () => {
  it('renders rows with user name and emoji glyph', () => {
    render(
      <WhoReactedPopover
        rows={baseRows}
        open={true}
        onOpenChange={vi.fn()}
        trigger={<button type="button">open</button>}
      />
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('does NOT render any per-emoji count or leaderboard grouping', () => {
    render(
      <WhoReactedPopover
        rows={baseRows}
        open={true}
        onOpenChange={vi.fn()}
        trigger={<button type="button">open</button>}
      />
    );
    const content = screen.getByTestId('who-reacted-content').textContent ?? '';
    // The anti-gamification guarantee: content must never contain an emoji glyph
    // immediately followed by a digit (e.g. "❤️2" or "🚀3"). Relative time strings
    // ("7 months ago") are acceptable — only per-emoji count patterns are banned.
    expect(content).not.toMatch(/❤️\d|🚀\d|🤗\d|👏\d|💡\d|🎯\d|✅\d/);
    // Additionally, no standalone number that could be a reaction count should appear
    // immediately after a Unicode emoji character.
    expect(content).not.toMatch(/[\u{1F600}-\u{1F9FF}\u{2600}-\u{27BF}]\d/u);
  });

  it('silently skips rows with unknown emoji slugs', () => {
    const rowsWithUnknown = [
      ...baseRows,
      {
        id: '3',
        emoji: 'unknown-slug',
        updatedDate: '2026-01-01T08:00:00Z',
        user: { displayName: 'Charlie', avatarUrl: undefined },
      },
    ];
    render(
      <WhoReactedPopover
        rows={rowsWithUnknown}
        open={true}
        onOpenChange={vi.fn()}
        trigger={<button type="button">open</button>}
      />
    );
    // Charlie's row is skipped because its emoji slug is unknown
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
    // Known rows still rendered
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('shows empty state when no rows exist', () => {
    render(
      <WhoReactedPopover rows={[]} open={true} onOpenChange={vi.fn()} trigger={<button type="button">open</button>} />
    );
    expect(screen.getByText('whoReactedEmpty')).toBeInTheDocument();
  });

  it('uses a list for accessibility', () => {
    render(
      <WhoReactedPopover
        rows={baseRows}
        open={true}
        onOpenChange={vi.fn()}
        trigger={<button type="button">open</button>}
      />
    );
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});
