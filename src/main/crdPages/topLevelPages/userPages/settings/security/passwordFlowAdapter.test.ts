import type { SettingsFlow, UiNode } from '@ory/kratos-client';
import { describe, expect, it } from 'vitest';
import { adaptSettingsPasswordFlow } from './passwordFlowAdapter';

const hiddenNode = (name: string, value: string): UiNode =>
  ({
    type: 'input',
    group: 'default',
    attributes: { node_type: 'input', type: 'hidden', name, value, disabled: false },
    messages: [],
    meta: {},
  }) as unknown as UiNode;

const passwordInputNode = (overrides: Record<string, unknown> = {}): UiNode =>
  ({
    type: 'input',
    group: 'password',
    attributes: { node_type: 'input', type: 'password', name: 'password', value: '', disabled: false, ...overrides },
    messages: [],
    meta: { label: { id: 1, text: 'Password', type: 'info' } },
  }) as unknown as UiNode;

const passwordSubmitNode = (): UiNode =>
  ({
    type: 'input',
    group: 'password',
    attributes: { node_type: 'input', type: 'submit', name: 'method', value: 'password', disabled: false },
    messages: [],
    meta: { label: { id: 1, text: 'Save', type: 'info' } },
  }) as unknown as UiNode;

const buildFlow = (nodes: UiNode[], messages: SettingsFlow['ui']['messages'] = []): SettingsFlow =>
  ({
    ui: { action: 'https://kratos/self-service/settings?flow=abc', method: 'POST', nodes, messages },
  }) as unknown as SettingsFlow;

describe('adaptSettingsPasswordFlow', () => {
  it('preserves the native form POST wiring (action, method, CSRF hidden, password name, submit name/value)', () => {
    const flow = buildFlow([hiddenNode('csrf_token', 'csrf-123'), passwordInputNode(), passwordSubmitNode()]);

    const result = adaptSettingsPasswordFlow(flow);

    expect(result).not.toBeNull();
    expect(result?.action).toBe('https://kratos/self-service/settings?flow=abc');
    expect(result?.method).toBe('POST');
    // CSRF token must reach the POST verbatim.
    expect(result?.hidden).toEqual([{ name: 'csrf_token', value: 'csrf-123' }]);
    // Password input keeps its real `name` so its value serialises.
    expect(result?.passwordField.name).toBe('password');
    // Submit keeps the method node's name/value — what Kratos keys the password method on.
    expect(result?.submit).toMatchObject({ name: 'method', value: 'password', label: 'Save' });
  });

  it('maps the password node error message onto the field', () => {
    const errored = passwordInputNode();
    (errored as unknown as { messages: unknown[] }).messages = [{ id: 4000005, text: 'too short', type: 'error' }];
    const flow = buildFlow([hiddenNode('csrf_token', 'x'), errored, passwordSubmitNode()]);

    expect(adaptSettingsPasswordFlow(flow)?.passwordField.errorMessage).toBe('too short');
  });

  it('maps flow-level messages with their type', () => {
    const flow = buildFlow(
      [hiddenNode('csrf_token', 'x'), passwordInputNode(), passwordSubmitNode()],
      [{ id: 1050001, text: 'Your changes have been saved!', type: 'success' }]
    );

    expect(adaptSettingsPasswordFlow(flow)?.messages).toEqual([
      { id: 1050001, type: 'success', text: 'Your changes have been saved!' },
    ]);
  });

  it('returns null when the password input or submit is absent', () => {
    expect(adaptSettingsPasswordFlow(buildFlow([hiddenNode('csrf_token', 'x'), passwordSubmitNode()]))).toBeNull();
    expect(adaptSettingsPasswordFlow(buildFlow([hiddenNode('csrf_token', 'x'), passwordInputNode()]))).toBeNull();
  });
});
