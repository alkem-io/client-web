import {
  UiNode,
  UiNodeAttributes,
  UiNodeAnchorAttributes,
  UiNodeInputAttributes,
  UiNodeScriptAttributes,
  UiNodeTextAttributes,
} from '@ory/kratos-client';
import { FormEvent } from 'react';
import { KRATOS_REQUIRED_FIELDS, KRATOS_VERIFICATION_CONTINUE_LINK_ID } from './constants';
import type { TFunction } from 'i18next';
import TranslationKey from '@/core/i18n/utils/TranslationKey';

export function isUiNodeInputAttributes(attr: UiNodeAttributes) {
  if (attr.node_type === 'input') {
    return true;
  }
  return false;
}

export function getNodeName({ attributes }: UiNode) {
  if (isUiNodeInputAttributes(attributes)) {
    return (attributes as UiNodeInputAttributes).name;
  }

  return '';
}

export function getNodeValue({ attributes }: UiNode) {
  if (isUiNodeInputAttributes(attributes)) {
    return (attributes as UiNodeInputAttributes).value;
  }

  return '';
}

export const getNodeTitle = ({ meta }: UiNode, t: TFunction): string | undefined => {
  const labelText = meta.label?.text;

  if (!labelText) {
    return undefined;
  }

  return t(`kratos.fields.${labelText}` as TranslationKey, labelText) as string;
};

export const guessVariant = ({ attributes }: UiNode) => {
  if (!isUiNodeInputAttributes(attributes)) {
    return 'text';
  }

  if ((attributes as UiNodeInputAttributes).name === 'identifier') {
    return 'username';
  }

  switch ((attributes as UiNodeInputAttributes).type) {
    case 'hidden':
      return null;
    case 'email':
      return 'email';
    case 'submit':
      return null;
    case 'password':
      return 'password';
    default:
      return 'text';
  }
};

export const isInvalidNode = (node: UiNode) =>
  !!(node && Array.isArray(node.messages) && node.messages.find(x => x.type === 'error'));

export const isRequired = (node: UiNode) => {
  const attributes = node.attributes as UiNodeInputAttributes;
  const name = getNodeName(node);
  return attributes.required || KRATOS_REQUIRED_FIELDS.includes(name);
};

export const isSubmittingPasswordFlow = (event: FormEvent<HTMLFormElement>) => {
  // https://developer.mozilla.org/en-US/docs/Web/API/SubmitEvent/submitter
  const button = event.nativeEvent['submitter'] as HTMLButtonElement;
  return button && button.name === 'method' && button.value === 'password';
};

export const isInputNode = (node: UiNode): node is UiNode & { attributes: UiNodeInputAttributes } =>
  node.attributes.node_type === 'input';
export const isAnchorNode = (node: UiNode): node is UiNode & { attributes: UiNodeAnchorAttributes } =>
  node.attributes.node_type === 'a';
export const isSubmitButton = (node: UiNode): node is UiNode & { attributes: UiNodeInputAttributes } =>
  node.attributes.node_type === 'input' && (node.attributes as UiNodeInputAttributes).type === 'submit';
export const isHiddenInput = (node: UiNode): node is UiNode & { attributes: UiNodeInputAttributes } =>
  node.attributes.node_type === 'input' && (node.attributes as UiNodeInputAttributes).type === 'hidden';

export const isVerificationContinueLink = (link: UiNode & { attributes: UiNodeAnchorAttributes }) =>
  link.meta.label?.id === KRATOS_VERIFICATION_CONTINUE_LINK_ID;

export const isScriptNode = (node: UiNode): node is UiNode & { attributes: UiNodeScriptAttributes } =>
  node.attributes.node_type === 'script';

export const isTextNode = (node: UiNode): node is UiNode & { attributes: UiNodeTextAttributes } =>
  node.attributes.node_type === 'text';

const WEBAUTHN_PASSKEY_TRIGGERS = [
  'oryWebAuthnLogin',
  'oryWebAuthnRegistration',
  'oryPasskeyLogin',
  'oryPasskeyLoginAutocompleteInit',
  'oryPasskeyRegistration',
  'oryPasskeySettingsRegistration',
] as const;

// Triggers that should be rendered as visible buttons
const VISIBLE_WEBAUTHN_TRIGGERS = [
  'oryWebAuthnLogin',
  'oryWebAuthnRegistration',
  'oryPasskeyLogin',
  'oryPasskeyRegistration',
  'oryPasskeySettingsRegistration',
] as const;

/**
 * Checks if a node is a passkey autocomplete init trigger.
 * These should not be rendered as visible buttons - they initialize autocomplete.
 */
export const isPasskeyAutocompleteInit = (node: UiNode): boolean => {
  if (!isInputNode(node)) return false;
  const attrs = node.attributes as UiNodeInputAttributes;
  return attrs.onclickTrigger === 'oryPasskeyLoginAutocompleteInit';
};

export const isWebAuthnOrPasskeyTrigger = (node: UiNode): boolean => {
  if (!isInputNode(node)) return false;
  const attrs = node.attributes as UiNodeInputAttributes;

  // Check modern onclickTrigger attribute (exclude autocomplete init - it's not a visible button)
  if (attrs.onclickTrigger) {
    return VISIBLE_WEBAUTHN_TRIGGERS.includes(attrs.onclickTrigger as (typeof VISIBLE_WEBAUTHN_TRIGGERS)[number]);
  }

  // Check deprecated onclick attribute (contains inline JS like "window.__oryWebAuthnLogin()")
  if (attrs.onclick) {
    return VISIBLE_WEBAUTHN_TRIGGERS.some(trigger => attrs.onclick?.includes(`__${trigger}`));
  }

  return false;
};

/**
 * Checks if a node is a WebAuthn/Passkey method submit button (not a trigger button).
 * These buttons submit the form with the webauthn/passkey method but don't call Ory functions.
 */
export const isWebAuthnMethodButton = (node: UiNode): boolean => {
  if (!isInputNode(node)) return false;
  const attrs = node.attributes as UiNodeInputAttributes;
  return attrs.type === 'submit' && attrs.name === 'method' && (attrs.value === 'webauthn' || attrs.value === 'passkey');
};

/**
 * Gets the trigger type from a WebAuthn/Passkey node.
 * Returns the trigger name (e.g., 'oryWebAuthnLogin') or undefined if not a trigger node.
 */
export const getWebAuthnTriggerType = (node: UiNode): string | undefined => {
  if (!isInputNode(node)) return undefined;
  const attrs = node.attributes as UiNodeInputAttributes;

  // Check modern onclickTrigger attribute
  if (attrs.onclickTrigger && WEBAUTHN_PASSKEY_TRIGGERS.includes(attrs.onclickTrigger as (typeof WEBAUTHN_PASSKEY_TRIGGERS)[number])) {
    return attrs.onclickTrigger;
  }

  // Check deprecated onclick attribute
  if (attrs.onclick) {
    const match = WEBAUTHN_PASSKEY_TRIGGERS.find(trigger => attrs.onclick?.includes(`__${trigger}`));
    if (match) return match;
  }

  return undefined;
};
