import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

const { ReactionTotalPill } = await import('./ReactionTotalPill');

describe('ReactionTotalPill', () => {
  it('renders nothing when total is 0', () => {
    const { container } = render(<ReactionTotalPill emojis={[]} total={0} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the total count when reactions exist', () => {
    render(<ReactionTotalPill emojis={['heart', 'rocket']} total={3} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button').textContent).toContain('3');
  });

  it('NEVER renders a number adjacent to an individual emoji slug (no per-emoji count)', () => {
    render(<ReactionTotalPill emojis={['heart', 'rocket']} total={2} />);
    const button = screen.getByRole('button');
    // The rendered text is just the glyphs + one number, never "❤️2" or "🚀2"
    // Verify there is exactly ONE numeric occurrence
    const text = button.textContent ?? '';
    const numericMatches = text.match(/\d+/g) ?? [];
    expect(numericMatches).toHaveLength(1);
    expect(numericMatches[0]).toBe('2');
  });

  it('applies primary tint when the viewer has reacted', () => {
    render(<ReactionTotalPill emojis={['heart']} total={1} myReactionEmoji="heart" />);
    const button = screen.getByRole('button');
    // aria-pressed signals own reaction
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('does not apply primary tint when viewer has not reacted', () => {
    render(<ReactionTotalPill emojis={['heart']} total={1} myReactionEmoji={null} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('silently skips unknown emoji slugs and renders remaining known slugs', () => {
    render(<ReactionTotalPill emojis={['heart', 'unknown-slug-xyz', 'rocket']} total={2} />);
    const button = screen.getByRole('button');
    // Should contain known glyphs but not the raw unknown slug text
    expect(button.textContent).not.toContain('unknown-slug-xyz');
    // Known glyphs present
    expect(button.textContent).toContain('❤️');
    expect(button.textContent).toContain('🚀');
  });

  it('forwards an injected onClick (Radix asChild toggles the popover through it)', () => {
    const onClick = vi.fn();
    render(<ReactionTotalPill emojis={['heart']} total={1} onClick={onClick} />);
    screen.getByRole('button').click();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('forwards its ref onto the native button (required so Radix can anchor the popover)', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<ReactionTotalPill emojis={['heart']} total={1} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toBe(screen.getByRole('button'));
  });

  it('spreads through injected Radix props (aria-expanded, data-state) and merges className', () => {
    render(
      <ReactionTotalPill emojis={['heart']} total={1} aria-expanded={true} data-state="open" className="custom-class" />
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAttribute('data-state', 'open');
    expect(button).toHaveClass('custom-class');
  });
});
