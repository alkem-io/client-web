import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ChatConnectionNotice } from './ChatConnectionNotice';

describe('ChatConnectionNotice', () => {
  it('renders the message as a status', () => {
    render(<ChatConnectionNotice message="Reconnecting…" />);
    expect(screen.getByRole('status')).toHaveTextContent('Reconnecting…');
  });
});
