import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WhiteboardCollabFooter } from './WhiteboardCollabFooter';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('WhiteboardCollabFooter connection status', () => {
  it('renders transient reconnecting state inline without a modal', () => {
    render(<WhiteboardCollabFooter connectionState="reconnecting" />);

    expect(screen.getByRole('status')).toHaveTextContent('footer.connection.reconnecting');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
