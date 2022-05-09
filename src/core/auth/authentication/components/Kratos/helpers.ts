import {
  UiNode,
  UiNodeAnchorAttributes,
  UiNodeAttributes,
  UiNodeImageAttributes,
  UiNodeInputAttributes,
  UiNodeTextAttributes,
} from '@ory/kratos-client';

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

export const getNodeTitle = ({ attributes, meta }: UiNode): string => {
  if (isUiNodeInputAttributes(attributes)) {
    if (meta?.label?.text) {
      return meta.label.text;
    }
    return attributes.name;
  }

  if (meta?.label?.text) {
    return meta.label.text;
  }

  return '';
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
    default:
      return 'text';
  }
};

export const isInvalidNode = (node: UiNode) =>
  !!(node && Array.isArray(node.messages) && node.messages.find(x => x.type === 'error'));

export const isRequired = (node: UiNode) => {
  const requiredFileds = ['traits.email', 'traits.name.first', 'traits.name.last', 'traits.accepted_terms'];
  const attributes = node.attributes as UiNodeInputAttributes;
  const name = getNodeName(node);
  return attributes.required || requiredFileds.includes(name);
};
