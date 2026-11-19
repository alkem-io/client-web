import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ChatConnectionNotice } from './ChatConnectionNotice';

describe('ChatConnectionNotice', () => {
  it('renders the message as a status', () => {
    render(<ChatConnectionNotice message="Reconnecting…" />);
    expect(screen.getByRole('status')).toHaveTextContent('Reconnecting…');
  });

  it('spins its icon while something is under way', () => {
    const { container } = render(<ChatConnectionNotice busy={true} message="Preparing your call…" />);
    expect(container.querySelector('svg')).toHaveClass('animate-spin');
  });
});
