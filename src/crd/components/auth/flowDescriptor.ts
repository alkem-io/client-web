/**
 * Flow Descriptor — the integration-layer ⇄ CRD-layer boundary type.
 *
 * The plain-TypeScript projection of a Kratos authentication flow
 * (LoginFlow | RegistrationFlow | RecoveryFlow | VerificationFlow | SettingsFlow)
 * that the integration layer's `flowDescriptorAdapter` produces and the CRD
 * auth components consume.
 *
 * It lives in the CRD layer because it is the prop contract of `CrdKratosFlow`;
 * the integration-layer adapter imports it from here. It is deliberately pure
 * TypeScript — no `@ory/kratos-client` types leak across the boundary.
 */

import type { ReactNode } from 'react';

export type KratosFlowType = 'login' | 'registration' | 'recovery' | 'verification' | 'settings';

export type KratosMessageType = 'info' | 'error' | 'success';

export type KratosMessage = {
  /** Kratos numeric message id (used to special-case e.g. account-lockout 9000429). */
  id: number;
  type: KratosMessageType;
  /** Already-translated text from the backend. */
  text: string;
  /**
   * Kratos interpolation context (e.g. `{ provider: 'GitHub' }`). Used by the
   * integration layer to re-localise known message ids with Alkemio's own copy.
   */
  context?: Record<string, unknown>;
  /**
   * Pre-rendered rich content for messages whose Alkemio copy contains markup
   * (e.g. the recovery "email sent" block, with `<strong>`/`<li>`/`<br/>`).
   * When set, the banner renders this instead of `text`; the integration layer
   * produces it via `<Trans>`.
   */
  content?: ReactNode;
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

export type KratosCheckboxNode = {
  name: string;
  /** Value submitted when the box is checked. */
  value: string;
  required: boolean;
  disabled: boolean;
  /** Whether the backend currently has the box checked. */
  checked: boolean;
  messages: KratosMessage[];
};

export type SocialProviderCustomisation = {
  /** Matches the Kratos `node.attributes.value` field — e.g. 'linkedin'. */
  providerKey: string;
  /** Resolved URL of the provider's brand icon. */
  iconSrc: string;
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

export type KratosAnchorNode = {
  /** Destination the link navigates to (e.g. the post-verification "continue"). */
  href: string;
  label: string;
};

export type KratosFlowDescriptor = {
  flowType: KratosFlowType;

  /** The Kratos flow `state` (e.g. `choose_method`, `sent_email`, `passed_challenge`). */
  state?: string;

  /** Native form action URL (from `flow.ui.action`). */
  action: string;
  method: 'POST' | 'GET';

  /** Top-level flow messages (info/error/success). */
  messages: KratosMessage[];

  /** The accept-terms checkbox, present when the flow exposes one (registration). */
  acceptTerms?: KratosCheckboxNode;

  /**
   * Inputs the form must render, bucketed by their semantic group.
   * Every node from `flow.ui.nodes` is placed into exactly one bucket.
   * OIDC nodes are pre-sorted by `customisation?.sortOrder`.
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
    /** Anchor links (e.g. the post-verification "Continue" button). */
    anchors: KratosAnchorNode[];
  };
};
