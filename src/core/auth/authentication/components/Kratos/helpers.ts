import { UiNode, UiNodeAttributes, UiNodeAnchorAttributes, UiNodeInputAttributes } from '@ory/kratos-client';
import { FormEvent } from 'react';
import { KRATOS_REQUIRED_FIELDS, KRATOS_VERIFICATION_CONTINUE_LINK_ID } from './constants';
import { TFunction } from 'react-i18next';
import TranslationKey from '@/core/i18n/utils/TranslationKey';

export function isUiNodeAnchorAttributes(attr: UiNodeAttributes) {
  if (attr.node_type === 'a') {
    return true;
  }
  return false;
}

export function isUiNodeImageAttributes(attr: UiNodeAttributes) {
  if (attr.node_type === 'img') {
    return true;
  }
  return false;
}

export function isUiNodeInputAttributes(attr: UiNodeAttributes) {
  if (attr.node_type === 'input') {
    return true;
  }
  return false;
}

export function isUiNodeTextAttributes(attr: UiNodeAttributes) {
  if (attr.node_type === 'text') {
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

export const getNodeTitle = ({ attributes, meta }: UiNode, t: TFunction): string => {
  if (!isUiNodeInputAttributes(attributes)) {
    throw new Error('Not an Input node');
  }

  const labelText = meta.label?.text;

  if (!labelText) {
    throw new Error('No label text specified for the Node');
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
