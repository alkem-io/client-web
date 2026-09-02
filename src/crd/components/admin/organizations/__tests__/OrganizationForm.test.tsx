import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { OrganizationForm, type OrgFormValues } from '../OrganizationForm';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// The markdown editor + references editor pull heavy deps; stub them to keep
// this a focused form-logic test.
vi.mock('@/crd/forms/markdown/MarkdownEditor', () => ({
  MarkdownEditor: ({ value }: { value: string }) => <div data-testid="markdown">{value}</div>,
}));
vi.mock('@/crd/forms/references/ReferencesEditor', () => ({
  ReferencesEditor: () => <div data-testid="references" />,
}));
vi.mock('@/crd/components/common/CountryCombobox', () => ({
  CountryCombobox: () => <div data-testid="country" />,
}));

const empty: OrgFormValues = {
  nameID: '',
  displayName: '',
  contactEmail: '',
  domain: '',
  legalEntityName: '',
  website: '',
  tagline: '',
  description: '',
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

describe('OrganizationForm', () => {
  test('create mode requires both alias and display name to submit', () => {
    const { rerender } = render(<OrganizationForm mode="create" values={empty} {...baseProps} />);
    expect(screen.getByRole('button', { name: 'orgForm.create' })).toBeDisabled();

    rerender(
      <OrganizationForm mode="create" values={{ ...empty, nameID: 'acme', displayName: 'Acme' }} {...baseProps} />
    );
    expect(screen.getByRole('button', { name: 'orgForm.create' })).toBeEnabled();
  });

  test('invalid email / website block submit and show an error', () => {
    render(
      <OrganizationForm
        mode="create"
        values={{ ...empty, nameID: 'acme', displayName: 'Acme', contactEmail: 'not-an-email' }}
        {...baseProps}
      />
    );
    expect(screen.getByText('orgForm.invalidEmail')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'orgForm.create' })).toBeDisabled();
  });

  test('edit mode makes the alias read-only and shows the location section + Save', () => {
    render(<OrganizationForm mode="edit" values={{ ...empty, nameID: 'acme', displayName: 'Acme' }} {...baseProps} />);
    expect(screen.getByLabelText('orgForm.nameID')).toHaveAttribute('readonly');
    expect(screen.getByText('orgForm.location')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'orgForm.save' })).toBeEnabled();
  });

  test('submitting a valid form calls onSubmit', async () => {
    const onSubmit = vi.fn();
    render(
      <OrganizationForm
        mode="create"
        values={{ ...empty, nameID: 'acme', displayName: 'Acme' }}
        {...baseProps}
        onSubmit={onSubmit}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'orgForm.create' }));
    expect(onSubmit).toHaveBeenCalled();
  });
});
