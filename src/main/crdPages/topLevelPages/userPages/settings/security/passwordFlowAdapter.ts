import type { SettingsFlow, UiContainer, UiNode, UiNodeInputAttributes } from '@ory/kratos-client';
import { isHiddenInput, isInputNode, isSubmitButton } from '@/core/auth/authentication/components/Kratos/helpers';
import type { CrdKratosPasswordFlow } from '@/crd/forms/auth/CrdKratosPasswordCard';

const isPasswordInputNode = (node: UiNode): node is UiNode & { attributes: UiNodeInputAttributes } =>
  node.group === 'password' && isInputNode(node) && node.attributes.name === 'password';

const isPasswordSubmitNode = (node: UiNode): node is UiNode & { attributes: UiNodeInputAttributes } =>
  isSubmitButton(node) && node.attributes.name === 'method' && node.attributes.value === 'password';

const toMessageType = (type: string | undefined): 'info' | 'error' | 'success' => {
  if (type === 'error') return 'error';
  if (type === 'success') return 'success';
  return 'info';
};

const asString = (value: unknown): string => (value == null ? '' : String(value));

/**
 * Projects the password slice of a Kratos `SettingsFlow` onto the plain-TS
 * `CrdKratosPasswordFlow` consumed by `CrdKratosPasswordCard`. The
 * `@ory/kratos-client` dependency stops here (the integration layer); the CRD
 * card stays free of it.
 *
 * Preserves the native form POST exactly: the form `action`/`method` come from
 * `flow.ui.action`/`method`; every hidden node (CSRF token) is forwarded
 * verbatim; the password input keeps its real `name`; the submit keeps the
 * method node's `name`/`value` (`method`/`password`).
 */
export const adaptPasswordFlow = (ui: UiContainer): CrdKratosPasswordFlow | null => {
  const passwordNode = ui.nodes.find(isPasswordInputNode);
  const submitNode = ui.nodes.find(isPasswordSubmitNode);
  if (!passwordNode || !submitNode) return null;

  const hidden = ui.nodes.filter(isHiddenInput).map(node => ({
    name: node.attributes.name,
    value: asString(node.attributes.value),
  }));

  const passwordAttrs = passwordNode.attributes;
  const passwordErrorMessage = passwordNode.messages?.find(message => message.type === 'error')?.text;

  return {
    action: ui.action,
    method: ui.method?.toUpperCase() === 'GET' ? 'GET' : 'POST',
    hidden,
    passwordField: {
      name: passwordAttrs.name,
      label: passwordNode.meta.label?.text ?? '',
      value: asString(passwordAttrs.value),
      disabled: Boolean(passwordAttrs.disabled),
      autocomplete: 'new-password',
      errorMessage: passwordErrorMessage,
    },
    submit: {
      name: submitNode.attributes.name,
      value: asString(submitNode.attributes.value),
      label: submitNode.meta.label?.text ?? '',
      disabled: Boolean(submitNode.attributes.disabled),
    },
    messages: (ui.messages ?? []).map(message => ({
      id: message.id,
      type: toMessageType(message.type),
      text: message.text,
    })),
  };
};

export const adaptSettingsPasswordFlow = (flow: SettingsFlow): CrdKratosPasswordFlow | null =>
  adaptPasswordFlow(flow.ui);
