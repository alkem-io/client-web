import {
  UiNode,
  UiNodeAnchorAttributes,
  UiNodeAttributes,
  UiNodeImageAttributes,
  UiNodeInputAttributes,
  UiNodeTextAttributes,
} from '@ory/kratos-client';
import { FormEvent } from 'react';
import { UiNodeAnchor, UiNodeInput } from './UiNodeTypes';
import { KRATOS_REQUIRED_FIELDS, KRATOS_VERIFICATION_CONTINUE_LINK_ID } from './constants';
import { TFunction } from 'react-i18next';
import TranslationKey from '@/core/i18n/utils/TranslationKey';

export function isUiNodeAnchorAttributes(pet: UiNodeAttributes): pet is UiNodeAnchorAttributes {
  return (pet as UiNodeAnchorAttributes).href !== undefined;
}

export function isUiNodeImageAttributes(pet: UiNodeAttributes): pet is UiNodeImageAttributes {
  return (pet as UiNodeImageAttributes).src !== undefined;
}

export function isUiNodeInputAttributes(pet: UiNodeAttributes): pet is UiNodeInputAttributes {
  return (pet as UiNodeInputAttributes).name !== undefined;
}

export function isUiNodeTextAttributes(pet: UiNodeAttributes): pet is UiNodeTextAttributes {
  return (pet as UiNodeTextAttributes).text !== undefined;
}

export function getNodeName({ attributes }: UiNode) {
  if (isUiNodeInputAttributes(attributes)) {
    return attributes.name;
  }

  return '';
}

export function getNodeValue({ attributes }: UiNode) {
  if (isUiNodeInputAttributes(attributes)) {
    return attributes.value;
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

  if (attributes.name === 'identifier') {
    return 'username';
  }

  switch (attributes.type) {
    case 'hidden':
      return null;
    case 'email':
      return 'email';
    case 'submit':
      return null;
    case 'password':
      return 'password';
    case 'profile':
      return 'profile';
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

export const isInputNode = (node: UiNode): node is UiNodeInput => node.type === 'input';

export const isAnchorNode = (node: UiNode): node is UiNodeAnchor => node.type === 'a';

export const isSubmitButton = (node: UiNode): node is UiNodeInput =>
  isInputNode(node) && node.attributes.type === 'submit';

export const isHiddenInput = (node: UiNode): node is UiNodeInput =>
  isInputNode(node) && node.attributes.type === 'hidden';

export const isVerificationContinueLink = (link: UiNodeAnchor) =>
  link.meta.label?.id === KRATOS_VERIFICATION_CONTINUE_LINK_ID;
