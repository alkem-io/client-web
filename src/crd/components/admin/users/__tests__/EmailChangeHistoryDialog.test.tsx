import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { EmailChangeHistoryDialog, type EmailHistoryEntry } from '../EmailChangeHistoryDialog';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

const entries: EmailHistoryEntry[] = [
  {
    id: 'e1',
    timestamp: '2026-06-01 10:00',
    outcomeLabel: 'Committed',
    outcomeTone: 'success',
    initiatorName: 'Admin',
    oldEmail: 'old@x.io',
    newEmail: 'new@x.io',
    reason: 'support',
    approver: 'Admin (Ops)',
  },
];

const baseProps = {
  open: true,
  onOpenChange: vi.fn(),
  subjectName: 'Alice',
  entries,
  total: 1,
  hasMore: false,
  loading: false,
  onLoadMore: vi.fn(),
};

describe('EmailChangeHistoryDialog', () => {
  test('renders audit entries with outcome, change, initiator and reason', () => {
    render(<EmailChangeHistoryDialog {...baseProps} />);
    expect(screen.getByText('Committed')).toBeInTheDocument();
    expect(screen.getByText('old@x.io')).toBeInTheDocument();
    expect(screen.getByText('new@x.io')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('support')).toBeInTheDocument();
  });

  test('shows an empty state when there are no entries', () => {
    render(<EmailChangeHistoryDialog {...baseProps} entries={[]} total={0} />);
    expect(screen.getByText('users.history.empty')).toBeInTheDocument();
  });

  test('drift resolution requires confirmation then fires onResolve with the chosen email', async () => {
    const onResolve = vi.fn();
    render(
      <EmailChangeHistoryDialog
        {...baseProps}
        drift={{
          options: [
            { email: 'old@x.io', label: 'old@x.io' },
            { email: 'new@x.io', label: 'new@x.io' },
          ],
          onResolve,
          resolving: false,
        }}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'users.history.drift.resolveAs:{"email":"new@x.io"}' }));
    expect(onResolve).not.toHaveBeenCalled();
    const dialog = screen.getByRole('alertdialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'users.history.drift.resolve' }));
    expect(onResolve).toHaveBeenCalledWith('new@x.io');
  });
});
