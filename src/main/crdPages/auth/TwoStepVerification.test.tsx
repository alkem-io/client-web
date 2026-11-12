import type { SettingsFlow } from '@ory/kratos-client';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { enrolledSecondFactorSettingsFlow } from './__fixtures__/secondFactorFlows';
import { TwoStepVerification } from './TwoStepVerification';

const postKratosForm = vi.hoisted(() => vi.fn());
const invokePasskeyTrigger = vi.hoisted(() => vi.fn());

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('./postKratosForm', () => ({ postKratosForm }));
vi.mock('./passkeyTrigger', () => ({
  invokePasskeyTrigger,
  translatePasskeyError: () => 'security key failed',
}));
vi.mock('./useKratosMessageCopy', () => ({
  useKratosMessageCopy: () => (messages: { text: string }[]) =>
    messages.map(message => ({ ...message, text: `localised: ${message.text}` })),
}));

describe('TwoStepVerification', () => {
  beforeEach(() => {
    postKratosForm.mockClear();
    invokePasskeyTrigger.mockReset();
  });

  it('posts method webauthn with the key id once a key removal is confirmed', async () => {
    render(<TwoStepVerification flow={enrolledSecondFactorSettingsFlow} />);

    await userEvent.click(screen.getByRole('button', { name: 'user.security.twoStep.securityKeys.removeNamed' }));
    const dialog = await screen.findByRole('alertdialog').catch(() => screen.getByRole('dialog'));
    await userEvent.click(within(dialog).getByRole('button', { name: 'user.security.twoStep.remove' }));

    expect(postKratosForm).toHaveBeenCalledWith(
      enrolledSecondFactorSettingsFlow.ui.action,
      expect.objectContaining({ method: 'webauthn', webauthn_remove: 'key-1' })
    );
  });

  it('shows the error when the security key ceremony fails', async () => {
    invokePasskeyTrigger.mockRejectedValue(new Error('cancelled'));
    render(<TwoStepVerification flow={enrolledSecondFactorSettingsFlow} />);

    await userEvent.click(screen.getByRole('button', { name: /user\.security\.twoStep\.securityKeys\.add/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('security key failed');
  });

  it("shows the flow's messages in Alkemio's own copy", () => {
    const flow = {
      ...enrolledSecondFactorSettingsFlow,
      active: 'totp',
      ui: {
        ...enrolledSecondFactorSettingsFlow.ui,
        messages: [{ id: 1050001, type: 'success', text: 'Your changes have been saved!' }],
      },
    } as SettingsFlow;

    render(<TwoStepVerification flow={flow} />);

    expect(screen.getByText('localised: Your changes have been saved!')).toHaveAttribute('role', 'status');
  });
});
