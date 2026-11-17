import type { SettingsFlow, UiNode } from '@ory/kratos-client';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { enrolledSecondFactorSettingsFlow, secondFactorSettingsFlow } from './__fixtures__/secondFactorFlows';
import { TwoStepVerification } from './TwoStepVerification';

const postKratosForm = vi.hoisted(() => vi.fn());
const submitKratosSettings = vi.hoisted(() => vi.fn());
const downloadTextFile = vi.hoisted(() => vi.fn());
const invokePasskeyTrigger = vi.hoisted(() => vi.fn());

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('./postKratosForm', () => ({ postKratosForm }));
vi.mock('./submitKratosSettings', () => ({ submitKratosSettings }));
vi.mock('@/core/utils/downloadTextFile', () => ({ downloadTextFile }));
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
    submitKratosSettings.mockReset();
    submitKratosSettings.mockResolvedValue({ kind: 'flow', flow: enrolledSecondFactorSettingsFlow });
    invokePasskeyTrigger.mockReset();
  });

  it('posts method webauthn with the key id once a key removal is confirmed', async () => {
    render(<TwoStepVerification flow={enrolledSecondFactorSettingsFlow} />);

    await userEvent.click(screen.getByRole('button', { name: 'user.security.twoStep.securityKeys.removeNamed' }));
    const dialog = await screen.findByRole('alertdialog').catch(() => screen.getByRole('dialog'));
    await userEvent.click(within(dialog).getByRole('button', { name: 'user.security.twoStep.remove' }));

    expect(submitKratosSettings).toHaveBeenCalledWith(
      enrolledSecondFactorSettingsFlow.ui.action,
      expect.objectContaining({ method: 'webauthn', webauthn_remove: 'key-1' })
    );
    expect(postKratosForm).not.toHaveBeenCalled();
  });

  it('shows the flow Kratos answers with, in place, and hands it to the page', async () => {
    // Kratos answers with the same flow, now carrying the enrolled authenticator.
    const saved = { ...enrolledSecondFactorSettingsFlow, id: secondFactorSettingsFlow.id };
    submitKratosSettings.mockResolvedValue({ kind: 'flow', flow: saved });
    const onFlowChange = vi.fn();
    render(<TwoStepVerification flow={secondFactorSettingsFlow} onFlowChange={onFlowChange} />);
    expect(screen.queryByText('user.security.twoStep.authenticator.active')).toBeNull();

    await userEvent.type(screen.getByLabelText('user.security.twoStep.authenticator.codeLabel'), '123456{Enter}');

    expect(submitKratosSettings).toHaveBeenCalledWith(
      secondFactorSettingsFlow.ui.action,
      expect.objectContaining({ method: 'totp', totp_code: '123456' })
    );
    expect(await screen.findByText('user.security.twoStep.authenticator.active')).toBeInTheDocument();
    expect(onFlowChange).toHaveBeenCalledWith(saved);
    expect(postKratosForm).not.toHaveBeenCalled();
  });

  it('follows a completed flow onto the fresh one Kratos answers with', async () => {
    // Kratos answers a submission to a flow it already completed on a new flow, with a new id and action.
    const fresh = {
      ...enrolledSecondFactorSettingsFlow,
      id: 'settings-fresh',
      ui: {
        ...enrolledSecondFactorSettingsFlow.ui,
        action: 'http://localhost/self-service/settings?flow=settings-fresh',
      },
    } as SettingsFlow;
    submitKratosSettings.mockResolvedValue({ kind: 'flow', flow: fresh });
    render(<TwoStepVerification flow={secondFactorSettingsFlow} />);

    await userEvent.type(screen.getByLabelText('user.security.twoStep.authenticator.codeLabel'), '123456{Enter}');
    expect(await screen.findByText('user.security.twoStep.authenticator.active')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'user.security.twoStep.securityKeys.removeNamed' }));
    await userEvent.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'user.security.twoStep.remove' })
    );
    expect(submitKratosSettings).toHaveBeenLastCalledWith(
      fresh.ui.action,
      expect.objectContaining({ webauthn_remove: 'key-1' })
    );
  });

  it('saves the codes as a file, then confirms them: the file is the saved copy', async () => {
    const regenerated = {
      ...enrolledSecondFactorSettingsFlow,
      ui: {
        ...enrolledSecondFactorSettingsFlow.ui,
        nodes: [
          ...enrolledSecondFactorSettingsFlow.ui.nodes.filter((node: UiNode) => node.group !== 'lookup_secret'),
          {
            type: 'text',
            group: 'lookup_secret',
            attributes: {
              node_type: 'text',
              id: 'lookup_secret_codes',
              text: {
                id: 1,
                type: 'info',
                text: '',
                context: { secrets: [{ text: 'abcd1234' }, { text: 'efgh5678' }] },
              },
            },
            messages: [],
            meta: {},
          },
          {
            type: 'input',
            group: 'lookup_secret',
            attributes: {
              node_type: 'input',
              type: 'submit',
              name: 'lookup_secret_confirm',
              value: 'true',
              disabled: false,
            },
            messages: [],
            meta: {},
          },
        ],
      },
    } as unknown as SettingsFlow;
    render(<TwoStepVerification flow={regenerated} />);

    await userEvent.click(screen.getByRole('button', { name: 'user.security.twoStep.recoveryCodes.download' }));

    expect(downloadTextFile).toHaveBeenCalledWith('abcd1234\nefgh5678\n', 'alkemio-recovery-codes.txt');
    expect(submitKratosSettings).toHaveBeenCalledWith(
      regenerated.ui.action,
      expect.objectContaining({ method: 'lookup_secret', lookup_secret_confirm: 'true' })
    );
  });

  it('drops an answer that arrives after a later one', async () => {
    let answerFirst: (value: unknown) => void = () => {};
    submitKratosSettings
      .mockImplementationOnce(() => new Promise(resolve => (answerFirst = resolve)))
      .mockResolvedValueOnce({
        kind: 'flow',
        flow: { ...enrolledSecondFactorSettingsFlow, id: secondFactorSettingsFlow.id },
      });
    render(<TwoStepVerification flow={secondFactorSettingsFlow} />);
    const code = screen.getByLabelText('user.security.twoStep.authenticator.codeLabel');

    await userEvent.type(code, '111111{Enter}');
    await userEvent.type(code, '{Backspace>6}222222{Enter}');
    expect(await screen.findByText('user.security.twoStep.authenticator.active')).toBeInTheDocument();

    answerFirst({ kind: 'flow', flow: secondFactorSettingsFlow });
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(screen.getByText('user.security.twoStep.authenticator.active')).toBeInTheDocument();
  });

  it('follows Kratos when it sends the browser elsewhere first', async () => {
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, assign });
    try {
      submitKratosSettings.mockResolvedValue({ kind: 'redirect', to: 'http://localhost/login?refresh=true' });
      render(<TwoStepVerification flow={secondFactorSettingsFlow} />);

      await userEvent.type(screen.getByLabelText('user.security.twoStep.authenticator.codeLabel'), '123456{Enter}');

      await waitFor(() => expect(assign).toHaveBeenCalledWith('http://localhost/login?refresh=true'));
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('falls back to a native POST when Kratos answers with neither', async () => {
    submitKratosSettings.mockRejectedValue(new Error('500'));
    render(<TwoStepVerification flow={secondFactorSettingsFlow} />);

    await userEvent.type(screen.getByLabelText('user.security.twoStep.authenticator.codeLabel'), '123456{Enter}');

    await waitFor(() =>
      expect(postKratosForm).toHaveBeenCalledWith(
        secondFactorSettingsFlow.ui.action,
        expect.objectContaining({ method: 'totp', totp_code: '123456' })
      )
    );
  });

  it('shows the error when the security key ceremony fails', async () => {
    invokePasskeyTrigger.mockRejectedValue(new Error('cancelled'));
    render(<TwoStepVerification flow={enrolledSecondFactorSettingsFlow} />);

    await userEvent.type(screen.getByLabelText('user.security.twoStep.securityKeys.nameLabel'), 'Desk key');
    await userEvent.click(screen.getByRole('button', { name: /user\.security\.twoStep\.securityKeys\.add/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('security key failed');
  });

  it("shows Kratos's refusal of a key without a name on the name field, in Alkemio's copy", () => {
    const flow = {
      ...enrolledSecondFactorSettingsFlow,
      ui: {
        ...enrolledSecondFactorSettingsFlow.ui,
        nodes: enrolledSecondFactorSettingsFlow.ui.nodes.map(node =>
          'name' in node.attributes && node.attributes.name === 'webauthn_register_displayname'
            ? {
                ...node,
                messages: [
                  {
                    id: 4000002,
                    type: 'error',
                    text: 'Property webauthn_register_displayname is missing.',
                    context: { property: 'webauthn_register_displayname' },
                  },
                ],
              }
            : node
        ),
      },
    } as SettingsFlow;

    render(<TwoStepVerification flow={flow} />);

    const name = screen.getByLabelText('user.security.twoStep.securityKeys.nameLabel');
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveAccessibleDescription('user.security.twoStep.securityKeys.nameRequired');
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

  describe('last-factor warning', () => {
    // One security key and no other second factor: removing it leaves none.
    const soleKeyFlow = {
      ...enrolledSecondFactorSettingsFlow,
      ui: {
        ...enrolledSecondFactorSettingsFlow.ui,
        nodes: enrolledSecondFactorSettingsFlow.ui.nodes.filter(
          (node: UiNode) => !['totp', 'lookup_secret'].includes(node.group)
        ),
      },
    } as SettingsFlow;

    const openKeyRemoval = async () => {
      await userEvent.click(screen.getByRole('button', { name: 'user.security.twoStep.securityKeys.removeNamed' }));
      return screen.findByRole('alertdialog');
    };

    it('warns a covered member removing their only factor', async () => {
      render(<TwoStepVerification flow={soleKeyFlow} requirementCovered={true} />);

      expect(await openKeyRemoval()).toHaveTextContent('user.security.twoStep.lastFactorWarning');
    });

    it('does not warn a member no requirement covers', async () => {
      render(<TwoStepVerification flow={soleKeyFlow} requirementCovered={false} />);

      expect(await openKeyRemoval()).not.toHaveTextContent('user.security.twoStep.lastFactorWarning');
    });

    it('does not warn a covered member who keeps another factor', async () => {
      render(<TwoStepVerification flow={enrolledSecondFactorSettingsFlow} requirementCovered={true} />);

      expect(await openKeyRemoval()).not.toHaveTextContent('user.security.twoStep.lastFactorWarning');
    });
  });
});
