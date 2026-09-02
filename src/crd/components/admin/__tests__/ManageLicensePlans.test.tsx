import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { ManageLicensePlans } from '../licensePlans/ManageLicensePlans';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

const available = [
  { id: 'free', name: 'Free' },
  { id: 'plus', name: 'Plus' },
];

describe('ManageLicensePlans', () => {
  test('assigns an inactive plan immediately', async () => {
    const onAssign = vi.fn();
    render(
      <ManageLicensePlans available={available} activePlanIds={['free']} onAssign={onAssign} onRevoke={vi.fn()} />
    );
    // Free is active (Revoke); Plus is inactive → the only Assign button.
    await userEvent.click(screen.getByRole('button', { name: 'licensePlans.assign' }));
    expect(onAssign).toHaveBeenCalledWith('plus');
  });

  test('revoking an active plan requires confirmation', async () => {
    const onRevoke = vi.fn();
    render(
      <ManageLicensePlans available={available} activePlanIds={['free']} onAssign={vi.fn()} onRevoke={onRevoke} />
    );
    // Free is active → the only Revoke button.
    await userEvent.click(screen.getByRole('button', { name: 'licensePlans.revoke' }));
    expect(onRevoke).not.toHaveBeenCalled();
    const dialog = screen.getByRole('alertdialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'licensePlans.revoke' }));
    expect(onRevoke).toHaveBeenCalledWith('free');
  });

  test('renders an empty state when no plans are available', () => {
    render(<ManageLicensePlans available={[]} activePlanIds={[]} onAssign={vi.fn()} onRevoke={vi.fn()} />);
    expect(screen.getByText('licensePlans.empty')).toBeInTheDocument();
  });
});
