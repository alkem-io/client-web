import type { SettingsFlow, UiNode } from '@ory/kratos-client';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { secondFactorSettingsFlow } from '@/main/crdPages/auth/__fixtures__/secondFactorFlows';
import { TwoStepVerification } from '@/main/crdPages/auth/TwoStepVerification';
import PasswordChangeForm from './PasswordChangeForm';

const passwordNode = (type: string, name: string, value: string): UiNode =>
  ({
    type: 'input',
    group: 'password',
    attributes: { node_type: 'input', type, name, value, disabled: false },
    messages: [],
    meta: { label: { id: 1, text: name, type: 'info' } },
  }) as unknown as UiNode;

const flow = {
  ...secondFactorSettingsFlow,
  ui: {
    ...secondFactorSettingsFlow.ui,
    nodes: [
      ...secondFactorSettingsFlow.ui.nodes,
      passwordNode('password', 'password', ''),
      passwordNode('submit', 'method', 'password'),
    ],
  },
} as unknown as SettingsFlow;

describe('PasswordChangeForm beside the security-key registration', () => {
  // Ory's script writes the ceremony result into the document's first element named
  // `webauthn_register` and submits the form holding `webauthn_register_trigger`.
  it('leaves the security-key form as the one holding the result field the script finds', () => {
    render(
      <>
        <PasswordChangeForm flow={flow} />
        <TwoStepVerification flow={flow} />
      </>
    );

    const result = document.querySelector('[name="webauthn_register"]');
    const trigger = document.querySelector('[name="webauthn_register_trigger"]');

    expect(trigger).not.toBeNull();
    expect(result?.closest('form')).toBe(trigger?.closest('form'));
  });
});
