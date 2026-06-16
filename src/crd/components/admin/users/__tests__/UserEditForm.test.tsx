import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { UserEditForm, type UserFormValues } from '../UserEditForm';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/crd/forms/markdown/MarkdownEditor', () => ({
  MarkdownEditor: ({ value }: { value: string }) => <div data-testid="markdown">{value}</div>,
}));
vi.mock('@/crd/forms/references/ReferencesEditor', () => ({
  ReferencesEditor: () => <div data-testid="references" />,
}));
vi.mock('@/crd/components/common/CountryCombobox', () => ({
  CountryCombobox: () => <div data-testid="country" />,
}));

const empty: UserFormValues = {
  firstName: '',
  lastName: '',
  displayName: '',
  email: 'user@x.io',
  phone: '',
  tagline: '',
  bio: '',
  city: '',
  country: '',
  references: [],
};

const baseProps = {
  onChange: vi.fn(),
  onReferencesChange: vi.fn(),
  onSubmit: vi.fn(),
  onCancel: vi.fn(),
  countries: [],
};

describe('UserEditForm', () => {
  test('requires first name, last name and display name to submit', () => {
    const { rerender } = render(<UserEditForm values={empty} {...baseProps} />);
    expect(screen.getByRole('button', { name: 'userForm.save' })).toBeDisabled();

    rerender(<UserEditForm values={{ ...empty, firstName: 'A', lastName: 'B', displayName: 'AB' }} {...baseProps} />);
    expect(screen.getByRole('button', { name: 'userForm.save' })).toBeEnabled();
  });

  test('email is read-only (changed via the change-email dialog)', () => {
    render(<UserEditForm values={empty} {...baseProps} />);
    expect(screen.getByLabelText('userForm.email')).toHaveAttribute('readonly');
  });

  test('submitting a valid form calls onSubmit', async () => {
    const onSubmit = vi.fn();
    render(
      <UserEditForm
        values={{ ...empty, firstName: 'A', lastName: 'B', displayName: 'AB' }}
        {...baseProps}
        onSubmit={onSubmit}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'userForm.save' }));
    expect(onSubmit).toHaveBeenCalled();
  });
});
