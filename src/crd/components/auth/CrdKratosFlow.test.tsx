import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FormEvent } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { CrdKratosFlow } from './CrdKratosFlow';
import type { KratosFlowDescriptor, KratosTextInputNode } from './flowDescriptor';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const textInput = (
  overrides: Partial<KratosTextInputNode> & Pick<KratosTextInputNode, 'name'>
): KratosTextInputNode => ({
  type: 'text',
  label: overrides.name,
  required: true,
  disabled: false,
  value: '',
  messages: [],
  ...overrides,
});

// A registration-shaped flow: the "Next" submit uses `method=profile` (NOT
// `password`) on purpose — the gate must still validate. The email field is
// reported as `type: 'text'` to prove the component forces it to `email`.
const registrationDescriptor = (): KratosFlowDescriptor => ({
  flowType: 'registration',
  action: 'https://example.test/registration',
  method: 'POST',
  messages: [],
  groups: {
    hidden: [],
    default: [
      textInput({ name: 'traits.email', type: 'text' }),
      textInput({ name: 'traits.name.first' }),
      textInput({ name: 'traits.name.last' }),
    ],
    password: [],
    rest: [],
    submit: [{ name: 'method', value: 'profile', label: 'Next', disabled: false }],
    oidc: [{ name: 'provider', value: 'linkedin', label: 'LinkedIn', disabled: false }],
    passkey: [],
    anchors: [],
  },
});

const getInput = (container: HTMLElement, name: string): HTMLInputElement => {
  const input = container.querySelector<HTMLInputElement>(`input[name="${name}"]`);
  if (!input) throw new Error(`input[name="${name}"] not found`);
  return input;
};

const getButton = (container: HTMLElement, name: string): HTMLButtonElement => {
  const button = container.querySelector<HTMLButtonElement>(`button[name="${name}"]`);
  if (!button) throw new Error(`button[name="${name}"] not found`);
  return button;
};

describe('CrdKratosFlow email validation gate', () => {
  test('forces email-named fields to type="email" even when Kratos reports text', () => {
    const { container } = render(<CrdKratosFlow descriptor={registrationDescriptor()} />);
    expect(getInput(container, 'traits.email').type).toBe('email');
  });

  test('honours Kratos-reported type="email" even for an unknown field name', () => {
    const descriptor = registrationDescriptor();
    // Replace `traits.email` (matched by name) with an unfamiliar name but
    // explicit `type: 'email'` from Kratos — should still render as email.
    descriptor.groups.default[0] = textInput({ name: 'traits.alt_email', type: 'email' });
    const { container } = render(<CrdKratosFlow descriptor={descriptor} />);
    expect(getInput(container, 'traits.alt_email').type).toBe('email');
  });

  test('blocks the primary submit when the email is malformed', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
    const { container, getByRole } = render(
      <CrdKratosFlow descriptor={registrationDescriptor()} onSubmit={onSubmit} />
    );

    await user.type(getInput(container, 'traits.email'), 'zamunda');
    await user.type(getInput(container, 'traits.name.first'), 'Ada');
    await user.type(getInput(container, 'traits.name.last'), 'Lovelace');

    await user.click(getByRole('button', { name: 'Next' }));

    // Validation failed → the consumer's submit handler must NOT run.
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('allows the primary submit when the email is well-formed', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
    const { container, getByRole } = render(
      <CrdKratosFlow descriptor={registrationDescriptor()} onSubmit={onSubmit} />
    );

    await user.type(getInput(container, 'traits.email'), 'ada@example.com');
    await user.type(getInput(container, 'traits.name.first'), 'Ada');
    await user.type(getInput(container, 'traits.name.last'), 'Lovelace');

    await user.click(getByRole('button', { name: 'Next' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  test('shows an inline format error after blurring an email field with an invalid address', async () => {
    const user = userEvent.setup();
    const { container, queryByText } = render(<CrdKratosFlow descriptor={registrationDescriptor()} />);

    const email = getInput(container, 'traits.email');
    await user.type(email, 'desgsdfsd');
    // Pre-blur — the user is still editing, no error yet.
    expect(queryByText('fields.invalidEmail')).toBeNull();
    await user.tab(); // blur
    expect(queryByText('fields.invalidEmail')).not.toBeNull();

    // Resuming editing clears the inline error so the user isn't yelled at mid-edit.
    await user.type(email, '@example.com');
    expect(queryByText('fields.invalidEmail')).toBeNull();
  });

  test.skip('OIDC provider submit bypasses validation (empty/invalid email is fine)', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
    const { container } = render(<CrdKratosFlow descriptor={registrationDescriptor()} onSubmit={onSubmit} />);

    await user.click(getButton(container, 'provider'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
