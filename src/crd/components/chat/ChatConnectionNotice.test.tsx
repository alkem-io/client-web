import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ChatConnectionNotice } from './ChatConnectionNotice';

describe('ChatConnectionNotice', () => {
  it('renders the message as a status', () => {
    render(<ChatConnectionNotice message="Reconnecting…" />);
    expect(screen.getByRole('status')).toHaveTextContent('Reconnecting…');
  });

  it('spins its icon while something is under way', () => {
    const { container } = render(<ChatConnectionNotice kind="busy" message="Preparing your call…" />);
    expect(container.querySelector('svg')).toHaveClass('animate-spin');
  });

  it('shows the message of a failure as a status', () => {
    const { container } = render(<ChatConnectionNotice kind="failed" message="Couldn't start the call." />);
    expect(screen.getByRole('status')).toHaveTextContent("Couldn't start the call.");
    expect(container.querySelector('svg')).toHaveClass('lucide-phone-off');
    expect(container.querySelector('svg')).not.toHaveClass('animate-spin');
  });
});
