import { fireEvent, render, screen } from '@testing-library/react';
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

// Minimal picker stub: renders one button per allowed emoji so tests can
// fire onSelect without depending on popover open/close or glyph mapping.
vi.mock('./ReactionEmojiPicker', () => ({
  ReactionEmojiPicker: ({
    allowedEmojis,
    onSelect,
  }: {
    allowedEmojis: string[];
    currentEmoji?: string | null;
    onSelect: (slug: string) => void;
  }) => (
    <div data-testid="emoji-picker-stub">
      {allowedEmojis.map(slug => (
        <button key={slug} type="button" aria-label={slug} onClick={() => onSelect(slug)}>
          {slug}
        </button>
      ))}
    </div>
  ),
}));

const { CalloutReactionsBar } = await import('./CalloutReactionsBar');

const baseSummary = {
  total: 0,
  emojis: [],
  myReactionEmoji: null,
  allowedEmojis: ['heart', 'rocket'],
};

describe('CalloutReactionsBar', () => {
  it('renders only the add picker when total is 0 (zero-state)', () => {
    render(<CalloutReactionsBar summary={baseSummary} canReact={true} onAdd={vi.fn()} onRemove={vi.fn()} />);
    // Picker stub is rendered
    expect(screen.getByTestId('emoji-picker-stub')).toBeInTheDocument();
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
    // Picker stub is not rendered
    expect(screen.queryByTestId('emoji-picker-stub')).not.toBeInTheDocument();
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

  it('calls onRemove when the viewer picks their own current emoji (un-react)', () => {
    const onAdd = vi.fn();
    const onRemove = vi.fn();
    render(
      <CalloutReactionsBar
        summary={{ ...baseSummary, myReactionEmoji: 'heart', allowedEmojis: ['heart', 'rocket'] }}
        canReact={true}
        onAdd={onAdd}
        onRemove={onRemove}
      />
    );
    // Picking the already-selected emoji should remove, not add
    fireEvent.click(screen.getByRole('button', { name: 'heart' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('calls onAdd with the new slug when the viewer picks a different emoji (swap)', () => {
    const onAdd = vi.fn();
    const onRemove = vi.fn();
    render(
      <CalloutReactionsBar
        summary={{ ...baseSummary, myReactionEmoji: 'heart', allowedEmojis: ['heart', 'rocket'] }}
        canReact={true}
        onAdd={onAdd}
        onRemove={onRemove}
      />
    );
    // Picking a different emoji should add the new one, not remove
    fireEvent.click(screen.getByRole('button', { name: 'rocket' }));
    expect(onAdd).toHaveBeenCalledWith('rocket');
    expect(onRemove).not.toHaveBeenCalled();
  });
});
