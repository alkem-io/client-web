import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Radix Popover portals need a mock in jsdom; the mock keeps both trigger and
// content in the same DOM tree so glyph button interactions can be tested
// without a real portal.
vi.mock('@/crd/primitives/popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ children, asChild: _asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="picker-trigger">{children}</div>
  ),
  PopoverContent: ({ children }: { children: React.ReactNode }) => <div data-testid="picker-content">{children}</div>,
}));

const { ReactionEmojiPicker } = await import('./ReactionEmojiPicker');

describe('ReactionEmojiPicker', () => {
  it('renders exactly the server-provided slugs as buttons (no hardcoded list)', () => {
    render(<ReactionEmojiPicker allowedEmojis={['heart', 'rocket']} onSelect={vi.fn()} />);
    // Two emoji buttons for the two provided slugs
    const buttons = screen.getAllByRole('option');
    expect(buttons).toHaveLength(2);
  });

  it('silently skips unknown slugs and renders only known ones', () => {
    render(<ReactionEmojiPicker allowedEmojis={['heart', 'unknown-slug-xyz', 'rocket']} onSelect={vi.fn()} />);
    const buttons = screen.getAllByRole('option');
    // Only 2 known slugs rendered; unknown skipped
    expect(buttons).toHaveLength(2);
    // No raw slug text
    const content = screen.getByTestId('picker-content').textContent ?? '';
    expect(content).not.toContain('unknown-slug-xyz');
  });

  it('calls onSelect with the slug when an emoji is clicked', () => {
    const onSelect = vi.fn();
    render(<ReactionEmojiPicker allowedEmojis={['heart', 'rocket']} onSelect={onSelect} />);
    // The option's accessible name is the translated per-slug key (emoji.<slug>),
    // not the raw English slug — the mocked t() echoes the key.
    const heartButton = screen.getByRole('option', { name: 'emoji.heart' });
    fireEvent.click(heartButton);
    expect(onSelect).toHaveBeenCalledWith('heart');
  });

  it('marks the current emoji as selected', () => {
    render(<ReactionEmojiPicker allowedEmojis={['heart', 'rocket']} currentEmoji="rocket" onSelect={vi.fn()} />);
    expect(screen.getByRole('option', { name: 'emoji.rocket' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'emoji.heart' })).toHaveAttribute('aria-selected', 'false');
  });

  it('labels each emoji option with its translated per-slug key, never the raw slug', () => {
    render(<ReactionEmojiPicker allowedEmojis={['heart', 'rocket']} onSelect={vi.fn()} />);
    // Regression guard: the accessible name must be resolved through t() so
    // screen-reader users get a localized name rather than the English slug.
    expect(screen.queryByRole('option', { name: 'heart' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'rocket' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'emoji.heart' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'emoji.rocket' })).toBeInTheDocument();
  });

  it('has an accessible label on the trigger button', () => {
    render(<ReactionEmojiPicker allowedEmojis={['heart']} onSelect={vi.fn()} />);
    // The ghost Button has an aria-label from the translation key
    const trigger = screen.getByRole('button', { name: 'addReaction' });
    expect(trigger).toBeInTheDocument();
  });

  it('trigger button has no raw mouse-enter/leave handlers that would close the picker on cursor travel', () => {
    render(<ReactionEmojiPicker allowedEmojis={['heart']} onSelect={vi.fn()} />);
    const trigger = screen.getByRole('button', { name: 'addReaction' });
    // The picker uses Radix built-in click toggle only; driving open state from
    // raw onMouseLeave on a portaled popover would close the picker before the
    // cursor reaches the glyph grid across the sideOffset gap.
    expect(trigger.onmouseleave).toBeNull();
    expect(trigger.onmouseenter).toBeNull();
  });
});
