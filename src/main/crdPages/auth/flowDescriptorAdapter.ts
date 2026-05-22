import type {
  LoginFlow,
  RecoveryFlow,
  RegistrationFlow,
  UiNode,
  UiNodeInputAttributes,
  UiNodeTextAttributes,
  UiText,
  VerificationFlow,
} from '@ory/kratos-client';
import {
  KRATOS_REMOVED_FIELDS_DEFAULT,
  KRATOS_REQUIRED_FIELDS,
} from '@/core/auth/authentication/components/Kratos/constants';
import {
  getPasskeyTriggerType,
  isAnchorNode,
  isHiddenInput,
  isInputNode,
  isPasskeyAutocompleteInit,
  isPasskeyTrigger,
  isScriptNode,
  isSubmitButton,
  isTextNode,
} from '@/core/auth/authentication/components/Kratos/helpers';
import { socialProviderCustomizations } from '@/core/auth/authentication/socialProviderCustomizations';
import type {
  KratosCheckboxNode,
  KratosFlowDescriptor,
  KratosFlowType,
  KratosMessage,
  KratosMessageType,
  KratosOidcButtonNode,
  KratosPasskeyButtonNode,
  KratosPasskeyTrigger,
  KratosSubmitButtonNode,
  KratosTextInputNode,
} from '@/crd/components/auth/flowDescriptor';

const ACCEPT_TERMS_FIELD = 'traits.accepted_terms';

type AnyKratosFlow = LoginFlow | RegistrationFlow | RecoveryFlow | VerificationFlow;
type InputNode = UiNode & { attributes: UiNodeInputAttributes };

const REMOVED_FIELD_NAMES = new Set(
  KRATOS_REMOVED_FIELDS_DEFAULT.map(field => (field as { name?: string }).name).filter(
    (name): name is string => typeof name === 'string'
  )
);

function toMessage(text: UiText): KratosMessage {
  return { id: text.id, type: (text.type as KratosMessageType) ?? 'info', text: text.text };
}

function toInputType(type: string | undefined): KratosTextInputNode['type'] {
  switch (type) {
    case 'email':
      return 'email';
    case 'password':
      return 'password';
    case 'tel':
      return 'tel';
    default:
      return 'text';
  }
}

function resolveAutocomplete(attrs: UiNodeInputAttributes, flowType: KratosFlowType): string | undefined {
  if (attrs.type === 'email' || attrs.name === 'identifier') {
    return 'username';
  }
  if (attrs.type === 'password') {
    return flowType === 'registration' ? 'new-password' : 'current-password';
  }
  return attrs.autocomplete;
}

function toTextInputNode(node: InputNode, flowType: KratosFlowType): KratosTextInputNode {
  const attrs = node.attributes;
  return {
    name: attrs.name,
    type: toInputType(attrs.type),
    label: node.meta.label?.text ?? '',
    required: Boolean(attrs.required) || KRATOS_REQUIRED_FIELDS.includes(attrs.name),
    disabled: Boolean(attrs.disabled),
    value: attrs.value == null ? '' : String(attrs.value),
    messages: (node.messages ?? []).map(toMessage),
    autocomplete: resolveAutocomplete(attrs, flowType),
  };
}

function toSubmitNode(node: InputNode): KratosSubmitButtonNode {
  const attrs = node.attributes;
  return {
    name: attrs.name,
    value: attrs.value == null ? '' : String(attrs.value),
    label: node.meta.label?.text ?? '',
    disabled: Boolean(attrs.disabled),
  };
}

function toOidcNode(node: InputNode): KratosOidcButtonNode {
  const attrs = node.attributes;
  const value = attrs.value == null ? '' : String(attrs.value);
  return {
    name: attrs.name,
    value,
    label: node.meta.label?.text ?? value,
    disabled: Boolean(attrs.disabled),
    customisation: socialProviderCustomizations[value],
  };
}

function toPasskeyNode(node: InputNode, trigger: KratosPasskeyTrigger): KratosPasskeyButtonNode {
  const attrs = node.attributes;
  return {
    name: attrs.name,
    value: attrs.value == null ? '' : String(attrs.value),
    label: node.meta.label?.text ?? '',
    disabled: Boolean(attrs.disabled),
    trigger,
  };
}

/**
 * Converts a Kratos flow into a plain `KratosFlowDescriptor` the CRD layer can
 * render. Buckets every `flow.ui.nodes` entry by its semantic group, mirroring
 * the MUI `KratosUI` grouping. The `@ory/kratos-client` dependency stops here.
 */
export function flowDescriptorAdapter(flow: AnyKratosFlow, flowType: KratosFlowType): KratosFlowDescriptor {
  const groups: KratosFlowDescriptor['groups'] = {
    hidden: [],
    default: [],
    password: [],
    rest: [],
    submit: [],
    oidc: [],
    passkey: [],
    passkeyCredentials: [],
    anchors: [],
  };

  let acceptTerms: KratosCheckboxNode | undefined;

  for (const node of flow.ui.nodes) {
    if (isScriptNode(node)) {
      continue;
    }
    if (isInputNode(node) && REMOVED_FIELD_NAMES.has(node.attributes.name)) {
      continue;
    }
    if (isPasskeyAutocompleteInit(node)) {
      continue;
    }
    // The accept-terms checkbox is rendered separately (above the form fields),
    // not as a regular input — extract it out of the node groups.
    if (isInputNode(node) && node.attributes.name === ACCEPT_TERMS_FIELD) {
      const attrs = node.attributes;
      acceptTerms = {
        name: attrs.name,
        value: 'true',
        required: Boolean(attrs.required) || KRATOS_REQUIRED_FIELDS.includes(attrs.name),
        disabled: Boolean(attrs.disabled),
        checked: attrs.value === true || attrs.value === 'true',
        messages: (node.messages ?? []).map(toMessage),
      };
      continue;
    }
    if (isHiddenInput(node)) {
      groups.hidden.push({
        name: node.attributes.name,
        value: node.attributes.value == null ? '' : String(node.attributes.value),
      });
      continue;
    }
    // Anchor nodes — e.g. the post-verification "Continue" link.
    if (isAnchorNode(node)) {
      groups.anchors.push({
        href: node.attributes.href,
        label: node.meta.label?.text ?? node.attributes.title?.text ?? '',
      });
      continue;
    }

    switch (node.group) {
      case 'oidc':
        if (isSubmitButton(node)) {
          groups.oidc.push(toOidcNode(node));
        } else if (isInputNode(node)) {
          groups.rest.push(toTextInputNode(node, flowType));
        }
        break;
      case 'webauthn':
      case 'passkey': {
        const trigger = isPasskeyTrigger(node)
          ? (getPasskeyTriggerType(node) as KratosPasskeyTrigger | undefined)
          : undefined;
        if (trigger && isInputNode(node)) {
          groups.passkey.push(toPasskeyNode(node, trigger));
        } else if (isTextNode(node)) {
          groups.passkeyCredentials.push({ text: (node.attributes as UiNodeTextAttributes).text?.text ?? '' });
        }
        break;
      }
      case 'code':
      case 'password':
      case 'profile':
        if (isSubmitButton(node)) {
          groups.submit.push(toSubmitNode(node));
        } else if (isInputNode(node)) {
          groups.password.push(toTextInputNode(node, flowType));
        }
        break;
      case 'default':
        if (isSubmitButton(node)) {
          groups.submit.push(toSubmitNode(node));
        } else if (isInputNode(node)) {
          groups.default.push(toTextInputNode(node, flowType));
        }
        break;
      default:
        if (isSubmitButton(node)) {
          groups.submit.push(toSubmitNode(node));
        } else if (isInputNode(node)) {
          groups.rest.push(toTextInputNode(node, flowType));
        }
        break;
    }
  }

  groups.oidc.sort(
    (a, b) =>
      (a.customisation?.sortOrder ?? Number.POSITIVE_INFINITY) -
      (b.customisation?.sortOrder ?? Number.POSITIVE_INFINITY)
  );

  return {
    flowType,
    state: (flow as { state?: string }).state,
    action: flow.ui.action,
    method: flow.ui.method?.toUpperCase() === 'GET' ? 'GET' : 'POST',
    // Drop Kratos's generic flow-level `info` notices on login / registration
    // (e.g. "Please choose a credential to authenticate yourself with") — they
    // are non-actionable noise. Errors and success notices are always kept.
    messages: (flow.ui.messages ?? [])
      .map(toMessage)
      .filter(message => !(message.type === 'info' && (flowType === 'login' || flowType === 'registration'))),
    acceptTerms,
    groups,
  };
}
