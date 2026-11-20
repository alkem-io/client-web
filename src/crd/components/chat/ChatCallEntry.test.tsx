import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { ChatCallEntry } from './ChatCallEntry';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('ChatCallEntry', () => {
  test.each(['outgoing', 'incoming', 'missed'] as const)('shows the %s wording with the time', kind => {
    render(<ChatCallEntry kind={kind} time="14:05" />);
    const entry = screen.getByTestId('chat-call-entry');
    expect(entry).toHaveAttribute('data-kind', kind);
    expect(entry).toHaveTextContent(`call.entry.${kind}`);
    expect(entry).toHaveTextContent('14:05');
    expect(entry.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
