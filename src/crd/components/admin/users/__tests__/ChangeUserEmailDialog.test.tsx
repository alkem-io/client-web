import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { type ChangeEmailFields, ChangeUserEmailDialog } from '../ChangeUserEmailDialog';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const make = (overrides: Partial<ChangeEmailFields> = {}): ChangeEmailFields => ({
  newEmail: '',
  confirmEmail: '',
  reason: '',
  approverName: '',
  approverRole: '',
  approverOrg: '',
  ...overrides,
});

const baseProps = {
  open: true,
  onOpenChange: vi.fn(),
  currentEmail: 'old@x.io',
  onChange: vi.fn(),
  onSubmit: vi.fn(),
  isDirty: false,
};

describe('ChangeUserEmailDialog', () => {
  test('shows the session warning at the bottom (MUI parity)', () => {
    render(<ChangeUserEmailDialog {...baseProps} values={make()} />);
    expect(screen.getByText('users.changeEmail.sessionWarning')).toBeInTheDocument();
  });

  test('submit is disabled until all required fields are valid', () => {
    const { rerender } = render(<ChangeUserEmailDialog {...baseProps} values={make()} />);
    expect(screen.getByRole('button', { name: 'users.changeEmail.submit' })).toBeDisabled();

    rerender(
      <ChangeUserEmailDialog
        {...baseProps}
        values={make({
          newEmail: 'new@x.io',
          confirmEmail: 'new@x.io',
          reason: 'support',
          approverName: 'Admin',
          approverRole: 'Ops',
        })}
      />
    );
    expect(screen.getByRole('button', { name: 'users.changeEmail.submit' })).toBeEnabled();
  });

  test('shows a mismatch message when the confirm email differs', () => {
    render(<ChangeUserEmailDialog {...baseProps} values={make({ newEmail: 'a@x.io', confirmEmail: 'b@x.io' })} />);
    expect(screen.getByText('users.changeEmail.mismatch')).toBeInTheDocument();
  });

  test('marks required fields and keeps optional approver organization unmarked', () => {
    render(<ChangeUserEmailDialog {...baseProps} values={make()} />);
    // Required inputs carry the HTML required attribute; the optional org does not.
    expect(screen.getByLabelText('users.changeEmail.newEmail')).toBeRequired();
    expect(screen.getByLabelText('users.changeEmail.reason')).toBeRequired();
    expect(screen.getByLabelText('users.changeEmail.approverName')).toBeRequired();
    expect(screen.getByLabelText('users.changeEmail.approverOrg')).not.toBeRequired();
  });
});
