/**
 * Flow Descriptor — the integration-layer ⇄ CRD-layer boundary type.
 *
 * This is the plain-TypeScript projection of a Kratos authentication flow
 * (LoginFlow | RegistrationFlow | RecoveryFlow | VerificationFlow) that the
 * adapter in `src/main/crdPages/auth/flowDescriptorAdapter.ts` produces and
 * every CRD presentational component under `src/crd/components/auth/` consumes.
 *
 * The CRD layer MUST NOT import from `@ory/kratos-client`. The whole purpose
 * of this type is to keep that dependency on the integration-layer side of
 * the boundary.
 *
 * This file is the canonical contract. The implementation files reference
 * it but the spec lives here.
 */

export type KratosFlowType = 'login' | 'registration' | 'recovery' | 'verification';

export type KratosMessageType = 'info' | 'error' | 'success';

export type KratosMessage = {
  /** Kratos numeric message id (used to special-case e.g. account-lockout 9000429). */
  id: number;
  type: KratosMessageType;
  /** Already-translated text from the backend. */
  text: string;
};

export type KratosHiddenInputNode = {
  name: string;
  value: string;
};

export type KratosTextInputNode = {
  name: string;
  type: 'text' | 'email' | 'password' | 'tel';
  label: string;
  required: boolean;
  disabled: boolean;
  value: string;
  messages: KratosMessage[];
  autocomplete?: string;
};

export type KratosSubmitButtonNode = {
  name: string;
  value: string;
  label: string;
  disabled: boolean;
};

export type SocialProviderCustomisation = {
  /** Matches the Kratos `node.attributes.value` field — e.g. 'linkedin'. */
  providerKey: string;
  /** Path to the SVG asset under /public/. */
  iconSrc: string;
  /** i18n key in the `crd-auth` namespace. Fallback: the node's own label. */
  i18nLabelKey?: string;
  /** Lower renders first. */
  sortOrder: number;
};

export type KratosOidcButtonNode = {
  name: string;
  value: string;
  label: string;
  disabled: boolean;
  customisation?: SocialProviderCustomisation;
};

export type KratosPasskeyTrigger =
  | 'oryPasskeyLogin'
  | 'oryPasskeyLoginAutocompleteInit'
  | 'oryPasskeyRegistration'
  | 'oryPasskeySettingsRegistration';

export type KratosPasskeyButtonNode = {
  name: string;
  value: string;
  label: string;
  disabled: boolean;
  /** Pre-resolved by the adapter; the CRD layer never touches `window.__oryPasskey*`. */
  trigger: KratosPasskeyTrigger;
};

export type KratosTextNode = {
  text: string;
};

export type KratosFlowDescriptor = {
  flowType: KratosFlowType;

  /** Native form action URL (from `flow.ui.action`). */
  action: string;
  method: 'POST' | 'GET';

  /** Top-level flow messages (info/error/success). */
  messages: KratosMessage[];

  /**
   * Inputs the form must render, bucketed by their semantic group.
   * Every node from `flow.ui.nodes` is placed into exactly one bucket.
   * Unknown groups fall back to `rest`.
   * OIDC nodes are pre-sorted by `customisation?.sortOrder ?? Infinity`.
   */
  groups: {
    hidden: KratosHiddenInputNode[];
    default: KratosTextInputNode[];
    password: KratosTextInputNode[];
    rest: KratosTextInputNode[];
    submit: KratosSubmitButtonNode[];
    oidc: KratosOidcButtonNode[];
    passkey: KratosPasskeyButtonNode[];
    passkeyCredentials: KratosTextNode[];
  };
};
