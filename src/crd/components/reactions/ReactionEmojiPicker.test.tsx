import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Radix Popover portals need a mock in jsdom
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
    const heartButton = screen.getByRole('option', { name: 'heart' });
    fireEvent.click(heartButton);
    expect(onSelect).toHaveBeenCalledWith('heart');
  });

  it('marks the current emoji as selected', () => {
    render(<ReactionEmojiPicker allowedEmojis={['heart', 'rocket']} currentEmoji="rocket" onSelect={vi.fn()} />);
    expect(screen.getByRole('option', { name: 'rocket' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'heart' })).toHaveAttribute('aria-selected', 'false');
  });

  it('has an accessible label on the trigger button', () => {
    render(<ReactionEmojiPicker allowedEmojis={['heart']} onSelect={vi.fn()} />);
    // The ghost Button has an aria-label from the translation key
    const trigger = screen.getByRole('button', { name: 'addReaction' });
    expect(trigger).toBeInTheDocument();
  });
});
