import type { SettingsFlow, UiNode, UiNodeInputAttributes } from '@ory/kratos-client';
import { AuthenticationType } from '@/core/apollo/generated/graphql-schema';
import { isHiddenInput, isSubmitButton } from '@/core/auth/authentication/components/Kratos/helpers';
import { socialProviderCustomizations } from '@/core/auth/authentication/socialProviderCustomizations';
import type { KratosMessage } from '@/crd/components/auth/flowDescriptor';

type InputNode = UiNode & { attributes: UiNodeInputAttributes };

export type ConnectionAction = {
  kind: 'link' | 'unlink';
  /** The flow's own `ui.action` — every per-row form POSTs here (research D1). */
  formAction: string;
  method: 'POST' | 'GET';
  /** The flow's CSRF hidden node, replicated verbatim into each row's own form. */
  csrf: { name: string; value: string };
  submitName: string;
  submitValue: string;
};

export type ProviderRowState = 'not-connected' | 'connected' | 'connected-locked';

export type ProviderRow = {
  providerId: string;
  displayName: string;
  iconSrc?: string;
  state: ProviderRowState;
  /** `null` exactly when `state === 'connected-locked'` (FR-008). */
  action: ConnectionAction | null;
  /** i18n key naming the reason + next step; set only when locked. */
  lockedReasonKey?: string;
};

export type CredentialRow = {
  kind: 'password' | 'passkey';
  present: boolean;
};

export type ConnectedAccountsModel = {
  status: 'unavailable' | 'ready';
  /** i18n key, set only when `status === 'unavailable'` (FR-024). */
  unavailableReasonKey?: string;
  providers: ProviderRow[];
  credentials: CredentialRow[];
  /**
   * Raw, untranslated flow messages (`id`/`type`/`text`/`context`) — the same
   * shape `flowDescriptorAdapter` produces elsewhere. The integration layer
   * re-localises them via `useKratosMessageCopy()` (which already carries id
   * 1050001 — "changes saved" — from the shared registry) plus its own
   * settings-context override for id 4000007: the shared registry keeps that
   * id's existing login-context copy, so a second, settings-specific reading
   * of the same id cannot live there too.
   */
  messages: KratosMessage[];
};

const UNAVAILABLE: ConnectedAccountsModel = {
  status: 'unavailable',
  unavailableReasonKey: 'user.security.connectedAccounts.unavailable.reason',
  providers: [],
  credentials: [],
  messages: [],
};

const isOidcSubmitNode = (node: UiNode): node is InputNode => node.group === 'oidc' && isSubmitButton(node);

const isPasswordCredentialPresent = (methods: AuthenticationType[]): boolean =>
  methods.includes(AuthenticationType.Email);

// A registered passkey/WebAuthn credential is what produces a *remove* node
// (as opposed to the registration-trigger nodes present regardless of
// whether a credential exists). Kratos names it `webauthn_remove` in some
// configurations and `passkey_remove` in others (V4 pins which on our
// deployment) — accept either so this doesn't silently under-detect.
const isPasskeyRemoveNode = (node: UiNode): boolean => {
  if (node.group !== 'webauthn' && node.group !== 'passkey') return false;
  if (!isSubmitButton(node)) return false;
  const name = node.attributes.name;
  return name === 'webauthn_remove' || name === 'passkey_remove';
};

export const displayNameFor = (providerId: string): string => {
  const customisation = socialProviderCustomizations[providerId];
  if (customisation) return customisation.displayName;
  // FR-025: an unconfigured-here provider still renders, with a readable
  // fallback name rather than the raw lowercase id.
  return providerId.length > 0 ? providerId[0].toUpperCase() + providerId.slice(1) : providerId;
};

const toAction = (
  kind: 'link' | 'unlink',
  node: InputNode,
  formAction: string,
  method: 'POST' | 'GET',
  csrf: { name: string; value: string }
): ConnectionAction => ({
  kind,
  formAction,
  method,
  csrf,
  submitName: node.attributes.name,
  submitValue: node.attributes.value == null ? '' : String(node.attributes.value),
});

/**
 * Projects the Kratos settings flow's `oidc`-group nodes plus the account's
 * current `authentication.methods` onto the Connected Accounts view model.
 * Pure — `(flow, authenticationMethods) → ConnectedAccountsModel` — so it is
 * unit-tested exactly like `passwordFlowAdapter`. Fails closed to
 * `unavailable` when either source is missing (FR-024) or when the flow
 * contradicts itself (both a `link` and an `unlink` node for one provider —
 * Kratos constructs these disjointly, so seeing both means something is
 * wrong upstream and rendering either would be a guess).
 */
export const adaptConnectedAccountsFlow = (
  flow: SettingsFlow | undefined,
  authenticationMethods: AuthenticationType[] | undefined
): ConnectedAccountsModel => {
  if (!flow || !authenticationMethods) return UNAVAILABLE;

  const nodes = flow.ui?.nodes ?? [];
  const formAction = flow.ui.action;
  const method = flow.ui.method?.toUpperCase() === 'GET' ? 'GET' : 'POST';
  const csrfNode = nodes.find(
    (node): node is InputNode => isHiddenInput(node) && node.attributes.name === 'csrf_token'
  );
  const csrf = {
    name: csrfNode?.attributes.name ?? 'csrf_token',
    value: csrfNode ? String(csrfNode.attributes.value ?? '') : '',
  };

  const linkNodes = new Map<string, InputNode>();
  const unlinkNodes = new Map<string, InputNode>();
  for (const node of nodes) {
    if (!isOidcSubmitNode(node)) continue;
    const providerId = node.attributes.value == null ? '' : String(node.attributes.value);
    if (!providerId) continue;
    if (node.attributes.name === 'link') linkNodes.set(providerId, node);
    else if (node.attributes.name === 'unlink') unlinkNodes.set(providerId, node);
  }

  // Both present for the same provider in one flow instance is structurally
  // impossible per Kratos's own construction — treat it as an adapter error
  // and fail closed rather than pick one arbitrarily.
  for (const providerId of linkNodes.keys()) {
    if (unlinkNodes.has(providerId)) return UNAVAILABLE;
  }

  const providerIds = new Set<string>([...linkNodes.keys(), ...unlinkNodes.keys()]);
  for (const authMethod of authenticationMethods) {
    const providerId = authMethod.toLowerCase();
    if (socialProviderCustomizations[providerId]) providerIds.add(providerId);
  }

  const providers: ProviderRow[] = Array.from(providerIds)
    .map((providerId): ProviderRow | null => {
      const linkNode = linkNodes.get(providerId);
      const unlinkNode = unlinkNodes.get(providerId);
      const inMethods = authenticationMethods.some(m => m.toLowerCase() === providerId);
      const customisation = socialProviderCustomizations[providerId];

      let state: ProviderRowState;
      let action: ConnectionAction | null;
      let lockedReasonKey: string | undefined;

      if (linkNode) {
        state = 'not-connected';
        action = toAction('link', linkNode, formAction, method, csrf);
      } else if (unlinkNode) {
        state = 'connected';
        action = toAction('unlink', unlinkNode, formAction, method, csrf);
      } else if (inMethods) {
        // Kratos omitted the unlink node: this is the account's last active
        // first-factor credential — connected, but disconnecting is blocked
        // until another sign-in method exists (FR-007/FR-008).
        state = 'connected-locked';
        action = null;
        lockedReasonKey = 'user.security.connectedAccounts.locked.reason';
      } else {
        // Neither a node nor a methods entry — not offered to this account.
        return null;
      }

      return {
        providerId,
        displayName: displayNameFor(providerId),
        iconSrc: customisation?.iconSrc,
        state,
        action,
        lockedReasonKey,
      };
    })
    .filter((row): row is ProviderRow => row !== null)
    .sort((a, b) => {
      const orderA = socialProviderCustomizations[a.providerId]?.sortOrder ?? Number.POSITIVE_INFINITY;
      const orderB = socialProviderCustomizations[b.providerId]?.sortOrder ?? Number.POSITIVE_INFINITY;
      if (orderA !== orderB) return orderA - orderB;
      return a.providerId.localeCompare(b.providerId);
    });

  const credentials: CredentialRow[] = [
    { kind: 'password', present: isPasswordCredentialPresent(authenticationMethods) },
    { kind: 'passkey', present: nodes.some(isPasskeyRemoveNode) },
  ];

  const messages: KratosMessage[] = (flow.ui.messages ?? []).map(message => ({
    id: message.id,
    type: message.type === 'error' ? 'error' : message.type === 'success' ? 'success' : 'info',
    text: message.text,
    context: message.context as Record<string, unknown> | undefined,
  }));

  return { status: 'ready', providers, credentials, messages };
};
