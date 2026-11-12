import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TwoStepVerificationSection, type TwoStepVerificationSectionProps } from './TwoStepVerificationSection';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const handlers = () => ({
  onConfirmAuthenticator: vi.fn(),
  onRemoveAuthenticator: vi.fn(),
  onGenerateRecoveryCodes: vi.fn(),
  onConfirmRecoveryCodes: vi.fn(),
  onRevealRecoveryCodes: vi.fn(),
  onRemoveRecoveryCodes: vi.fn(),
  onAddSecurityKey: vi.fn(),
  onRemoveSecurityKey: vi.fn(),
});

const renderSection = (props: Partial<TwoStepVerificationSectionProps> = {}) => {
  const callbacks = handlers();
  const view = render(
    <TwoStepVerificationSection
      authenticator={{ kind: 'available', qr: { src: 'data:image/png;base64,QR', alt: 'qr' }, secret: 'SECRET' }}
      recoveryCodes={{ kind: 'disabled' }}
      securityKeys={{ keys: [] }}
      {...callbacks}
      {...props}
    />
  );
  return { ...view, callbacks };
};

const confirmDialog = async () => {
  const dialog = await screen.findByRole('alertdialog').catch(() => screen.getByRole('dialog'));
  await userEvent.click(
    within(dialog).getByRole('button', { name: /user\.security\.twoStep\.(remove|recoveryCodes\.)/ })
  );
};

describe('TwoStepVerificationSection — authenticator', () => {
  it('offers the QR, the secret and one code field when not enrolled, and confirms through the handler', async () => {
    const { callbacks } = renderSection();

    expect(screen.getByRole('img', { name: 'user.security.twoStep.authenticator.qrAlt' })).toHaveAttribute(
      'src',
      'data:image/png;base64,QR'
    );
    expect(screen.getByText('SECRET')).toBeInTheDocument();
    expect(screen.getByText('user.security.twoStep.neverShare')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('user.security.twoStep.authenticator.codeLabel'), '123456');
    await userEvent.click(screen.getByRole('button', { name: 'user.security.twoStep.authenticator.confirm' }));

    expect(callbacks.onConfirmAuthenticator).toHaveBeenCalledWith('123456');
  });

  it('shows the code error from the identity provider', () => {
    renderSection({ authenticator: { kind: 'available', codeError: 'The code is wrong.' } });
    expect(screen.getByText('The code is wrong.')).toBeInTheDocument();
  });

  it('shows "active" with Remove when enrolled, and removes only after confirmation', async () => {
    const { callbacks } = renderSection({ authenticator: { kind: 'enrolled' } });

    expect(screen.getByText('user.security.twoStep.authenticator.active')).toBeInTheDocument();
    expect(screen.queryByLabelText('user.security.twoStep.authenticator.codeLabel')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'user.security.twoStep.remove' }));
    expect(callbacks.onRemoveAuthenticator).not.toHaveBeenCalled();
    await confirmDialog();

    expect(callbacks.onRemoveAuthenticator).toHaveBeenCalledTimes(1);
  });
});

describe('TwoStepVerificationSection — last-factor warning (FR-018)', () => {
  it('warns that the requirement applies again when the last factor is removed while covered', async () => {
    renderSection({ authenticator: { kind: 'enrolled' }, requirementCovered: true });
    await userEvent.click(screen.getByRole('button', { name: 'user.security.twoStep.remove' }));

    expect(await screen.findByText(/user\.security\.twoStep\.lastFactorWarning/)).toBeInTheDocument();
  });

  it('does not warn when not covered', async () => {
    renderSection({ authenticator: { kind: 'enrolled' }, requirementCovered: false });
    await userEvent.click(screen.getByRole('button', { name: 'user.security.twoStep.remove' }));

    expect(await screen.findByText(/user\.security\.twoStep\.authenticator\.removeDescription/)).toBeInTheDocument();
    expect(screen.queryByText(/lastFactorWarning/)).not.toBeInTheDocument();
  });

  it('does not warn when another factor remains', async () => {
    renderSection({
      authenticator: { kind: 'enrolled' },
      securityKeys: { keys: [{ id: 'key-1', name: 'Blue key' }] },
      requirementCovered: true,
    });
    await userEvent.click(screen.getAllByRole('button', { name: 'user.security.twoStep.remove' })[0]);

    expect(await screen.findByText(/authenticator\.removeDescription/)).toBeInTheDocument();
    expect(screen.queryByText(/lastFactorWarning/)).not.toBeInTheDocument();
  });
});

describe('TwoStepVerificationSection — recovery codes', () => {
  it('none: offers Generate', async () => {
    const { callbacks } = renderSection({ recoveryCodes: { kind: 'none' } });
    await userEvent.click(screen.getByRole('button', { name: 'user.security.twoStep.recoveryCodes.generate' }));
    expect(callbacks.onGenerateRecoveryCodes).toHaveBeenCalledTimes(1);
  });

  it('generated but unconfirmed: shows the codes once, with copy and the notice, and must be confirmed', async () => {
    const { callbacks } = renderSection({ recoveryCodes: { kind: 'unconfirmed', codes: ['abcd1234', 'efgh5678'] } });

    expect(screen.getByText('abcd1234')).toBeInTheDocument();
    expect(screen.getByText('user.security.twoStep.recoveryCodes.shownOnce')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'user.security.twoStep.recoveryCodes.copy' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'user.security.twoStep.recoveryCodes.confirm' }));
    expect(callbacks.onConfirmRecoveryCodes).toHaveBeenCalledTimes(1);
  });

  it('confirmed: offers reveal, regenerate and remove (after confirmation)', async () => {
    const { callbacks } = renderSection({ recoveryCodes: { kind: 'confirmed' } });

    await userEvent.click(screen.getByRole('button', { name: 'user.security.twoStep.recoveryCodes.reveal' }));
    expect(callbacks.onRevealRecoveryCodes).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole('button', { name: 'user.security.twoStep.recoveryCodes.remove' }));
    expect(callbacks.onRemoveRecoveryCodes).not.toHaveBeenCalled();
    const dialog = await screen.findByRole('alertdialog').catch(() => screen.getByRole('dialog'));
    await userEvent.click(within(dialog).getByRole('button', { name: 'user.security.twoStep.recoveryCodes.remove' }));
    expect(callbacks.onRemoveRecoveryCodes).toHaveBeenCalledTimes(1);
  });

  it('disabled: Generate is disabled with an explanation when no other factor is enrolled', () => {
    renderSection({ recoveryCodes: { kind: 'disabled' } });

    expect(screen.getByRole('button', { name: 'user.security.twoStep.recoveryCodes.generate' })).toBeDisabled();
    expect(screen.getByText('user.security.twoStep.recoveryCodes.needsFactor')).toBeInTheDocument();
  });
});

describe('TwoStepVerificationSection — security keys', () => {
  const registration = {
    action: 'https://identity.example.test/self-service/settings?flow=1',
    hiddenFields: [
      { name: 'csrf_token', value: 'csrf' },
      { name: 'method', value: 'webauthn' },
      { name: 'webauthn_register', value: '' },
    ],
    resultFieldName: 'webauthn_register',
    nameFieldName: 'webauthn_register_displayname',
    trigger: { name: 'webauthn_register_trigger', value: '{"publicKey":{}}' },
  };

  /** Submits the form as Ory's script does once the ceremony has run, and returns whether it went through. */
  const submitAsScript = (form: HTMLFormElement) =>
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

  it('lets the submission carrying the ceremony result through to the flow action, with the key name', async () => {
    const { callbacks } = renderSection({ securityKeys: { keys: [], registration } });
    const form = screen.getByRole('button', { name: 'user.security.twoStep.securityKeys.add' }).closest('form');
    if (!form) throw new Error('no registration form');

    await userEvent.type(screen.getByLabelText('user.security.twoStep.securityKeys.nameLabel'), 'Desk key');
    const result = form.querySelector<HTMLInputElement>('input[name="webauthn_register"]');
    if (!result) throw new Error('no result input');
    result.value = '{"id":"credential"}';

    expect(form).toHaveAttribute('method', 'POST');
    expect(form).toHaveAttribute('action', registration.action);
    expect(Object.fromEntries(new FormData(form))).toEqual({
      csrf_token: 'csrf',
      method: 'webauthn',
      webauthn_register: '{"id":"credential"}',
      webauthn_register_displayname: 'Desk key',
    });
    expect(submitAsScript(form)).toBe(true);
    expect(callbacks.onAddSecurityKey).not.toHaveBeenCalled();
  });

  it('starts the ceremony instead of posting when Enter is pressed in the name field', async () => {
    const { callbacks } = renderSection({ securityKeys: { keys: [], registration } });

    await userEvent.type(screen.getByLabelText('user.security.twoStep.securityKeys.nameLabel'), 'Desk key{Enter}');

    expect(callbacks.onAddSecurityKey).toHaveBeenCalledWith(registration.trigger.value);
  });

  it('empty list: says so and offers the name field and the add trigger in one native form', async () => {
    const { callbacks, container } = renderSection({ securityKeys: { keys: [], registration } });

    expect(screen.getByText('user.security.twoStep.securityKeys.empty')).toBeInTheDocument();
    const trigger = screen.getByRole('button', { name: 'user.security.twoStep.securityKeys.add' });
    const form = trigger.closest('form');
    expect(form).toHaveAttribute('action', registration.action);
    expect(form?.querySelector('input[type="hidden"][name="webauthn_register"]')).not.toBeNull();
    expect(form?.querySelector('input[name="webauthn_register_displayname"]')).not.toBeNull();
    expect(container.querySelectorAll('[name="webauthn_register_trigger"]')).toHaveLength(1);
    expect(trigger).toHaveAttribute('value', registration.trigger.value);

    await userEvent.click(trigger);
    expect(callbacks.onAddSecurityKey).toHaveBeenCalledWith(registration.trigger.value);
  });

  it('one key: lists it by name and removes it after confirmation', async () => {
    const { callbacks } = renderSection({
      authenticator: { kind: 'enrolled' },
      securityKeys: { keys: [{ id: 'key-1', name: 'Blue key' }], registration },
    });

    expect(screen.getByText('Blue key')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'user.security.twoStep.securityKeys.removeNamed' }));
    await confirmDialog();

    expect(callbacks.onRemoveSecurityKey).toHaveBeenCalledWith('key-1');
  });
});
