import type { SettingsFlow, UiNode } from '@ory/kratos-client';
import { describe, expect, it } from 'vitest';
import { AuthenticationType } from '@/core/apollo/generated/graphql-schema';
import contributorSettingsEn from '@/crd/i18n/contributorSettings/contributorSettings.en.json';
import { adaptConnectedAccountsFlow } from './connectedAccountsFlowAdapter';

const hiddenNode = (name: string, value: string): UiNode =>
  ({
    type: 'input',
    group: 'default',
    attributes: { node_type: 'input', type: 'hidden', name, value, disabled: false },
    messages: [],
    meta: {},
  }) as unknown as UiNode;

const oidcSubmitNode = (name: 'link' | 'unlink', providerId: string): UiNode =>
  ({
    type: 'input',
    group: 'oidc',
    attributes: { node_type: 'input', type: 'submit', name, value: providerId, disabled: false },
    messages: [],
    meta: { label: { id: name === 'link' ? 1050002 : 1050003, text: `${name} ${providerId}` } },
  }) as unknown as UiNode;

const passkeyRemoveNode = (name: 'webauthn_remove' | 'passkey_remove' = 'webauthn_remove'): UiNode =>
  ({
    type: 'input',
    group: 'webauthn',
    attributes: { node_type: 'input', type: 'submit', name, value: 'cred-1', disabled: false },
    messages: [],
    meta: {},
  }) as unknown as UiNode;

const buildFlow = (nodes: UiNode[], messages: SettingsFlow['ui']['messages'] = []): SettingsFlow =>
  ({
    ui: { action: 'https://kratos/self-service/settings?flow=abc', method: 'POST', nodes, messages },
  }) as unknown as SettingsFlow;

// Resolves a dotted i18n key (e.g. `user.security.connectedAccounts.unavailable.message`) against the
// real shipped `contributorSettings.en.json` resource — a plain `toBeTruthy()` on the key string passes
// even when the key names a resource path that does not exist. This is the guard against that drift.
const resolveI18nKey = (resource: unknown, dottedKey: string): unknown =>
  dottedKey.split('.').reduce<unknown>((node, segment) => {
    if (node === undefined || node === null || typeof node !== 'object') return undefined;
    return (node as Record<string, unknown>)[segment];
  }, resource);

describe('adaptConnectedAccountsFlow', () => {
  describe('fail-closed (FR-024)', () => {
    it('returns unavailable when the flow is missing', () => {
      const result = adaptConnectedAccountsFlow(undefined, [AuthenticationType.Email]);
      expect(result.status).toBe('unavailable');
      // Pinned to the exact key string, and resolved against the real shipped locale resource, so a
      // future rename of either side fails the suite instead of rendering the raw key to the user.
      expect(result.unavailableReasonKey).toBe('user.security.connectedAccounts.unavailable.message');
      expect(typeof resolveI18nKey(contributorSettingsEn, result.unavailableReasonKey as string)).toBe('string');
      expect(result.providers).toEqual([]);
      expect(result.credentials).toEqual([]);
    });

    it('returns unavailable when authentication methods are missing', () => {
      const flow = buildFlow([hiddenNode('csrf_token', 'x'), oidcSubmitNode('link', 'cleverbase')]);
      const result = adaptConnectedAccountsFlow(flow, undefined);
      expect(result.status).toBe('unavailable');
      expect(result.providers).toEqual([]);
    });

    it('returns unavailable when a provider carries both a link and an unlink node (adapter-detected inconsistency)', () => {
      const flow = buildFlow([
        hiddenNode('csrf_token', 'x'),
        oidcSubmitNode('link', 'cleverbase'),
        oidcSubmitNode('unlink', 'cleverbase'),
      ]);
      const result = adaptConnectedAccountsFlow(flow, [AuthenticationType.Cleverbase]);
      expect(result.status).toBe('unavailable');
    });

    it('unavailable ⇒ zero rows and zero actions, never a connected/not-connected claim', () => {
      const result = adaptConnectedAccountsFlow(undefined, undefined);
      expect(result.providers).toHaveLength(0);
      expect(result.credentials).toHaveLength(0);
      expect(result.messages).toHaveLength(0);
    });
  });

  describe('derivation table (data-model.md)', () => {
    it('link node only, not in methods → not-connected with a link action', () => {
      const flow = buildFlow([hiddenNode('csrf_token', 'csrf-1'), oidcSubmitNode('link', 'cleverbase')]);
      const result = adaptConnectedAccountsFlow(flow, [AuthenticationType.Email]);

      const row = result.providers.find(p => p.providerId === 'cleverbase');
      expect(row?.state).toBe('not-connected');
      expect(row?.action).toMatchObject({ kind: 'link', submitName: 'link', submitValue: 'cleverbase' });
    });

    it('unlink node + in methods → connected with an unlink action', () => {
      const flow = buildFlow([hiddenNode('csrf_token', 'csrf-1'), oidcSubmitNode('unlink', 'cleverbase')]);
      const result = adaptConnectedAccountsFlow(flow, [AuthenticationType.Email, AuthenticationType.Cleverbase]);

      const row = result.providers.find(p => p.providerId === 'cleverbase');
      expect(row?.state).toBe('connected');
      expect(row?.action).toMatchObject({ kind: 'unlink', submitName: 'unlink', submitValue: 'cleverbase' });
    });

    it('no node, in methods → connected-locked: no action, a lockedReasonKey, still enumerated (FR-008)', () => {
      const flow = buildFlow([hiddenNode('csrf_token', 'csrf-1')]);
      const result = adaptConnectedAccountsFlow(flow, [AuthenticationType.Cleverbase]);

      const row = result.providers.find(p => p.providerId === 'cleverbase');
      expect(row?.state).toBe('connected-locked');
      expect(row?.action).toBeNull();
      expect(row?.lockedReasonKey).toBeTruthy();
    });

    it('unlink node present but methods lagging (not yet in methods) → connected, the flow wins (data-model.md 4th row)', () => {
      const flow = buildFlow([hiddenNode('csrf_token', 'csrf-1'), oidcSubmitNode('unlink', 'cleverbase')]);
      const result = adaptConnectedAccountsFlow(flow, [AuthenticationType.Email]);

      const row = result.providers.find(p => p.providerId === 'cleverbase');
      expect(row?.state).toBe('connected');
      expect(row?.action?.kind).toBe('unlink');
    });

    it('neither a node nor a methods entry → the provider is not rendered at all', () => {
      const flow = buildFlow([hiddenNode('csrf_token', 'csrf-1'), oidcSubmitNode('link', 'github')]);
      const result = adaptConnectedAccountsFlow(flow, [AuthenticationType.Email]);

      expect(result.providers.find(p => p.providerId === 'cleverbase')).toBeUndefined();
    });
  });

  describe('invariants', () => {
    it('locked state ⟹ action === null and lockedReasonKey is set', () => {
      const flow = buildFlow([hiddenNode('csrf_token', 'csrf-1')]);
      const result = adaptConnectedAccountsFlow(flow, [AuthenticationType.Cleverbase]);
      const locked = result.providers.filter(p => p.state === 'connected-locked');
      expect(locked.length).toBeGreaterThan(0);
      for (const row of locked) {
        expect(row.action).toBeNull();
        expect(row.lockedReasonKey).toBeTruthy();
      }
    });

    it('is a pure function: identical inputs produce deep-equal output on repeated calls', () => {
      const flow = buildFlow(
        [hiddenNode('csrf_token', 'csrf-1'), oidcSubmitNode('link', 'cleverbase'), passkeyRemoveNode()],
        [{ id: 1050001, text: 'Your changes have been saved!', type: 'success' }]
      );
      const methods = [AuthenticationType.Email];

      const first = adaptConnectedAccountsFlow(flow, methods);
      const second = adaptConnectedAccountsFlow(flow, methods);
      expect(second).toEqual(first);
    });
  });

  describe('CSRF propagation', () => {
    it('replicates the flow-level CSRF hidden node into every row action', () => {
      const flow = buildFlow([
        hiddenNode('csrf_token', 'csrf-xyz'),
        oidcSubmitNode('link', 'cleverbase'),
        oidcSubmitNode('unlink', 'github'),
      ]);
      const result = adaptConnectedAccountsFlow(flow, [AuthenticationType.Email, AuthenticationType.Github]);

      for (const row of result.providers) {
        expect(row.action?.csrf).toEqual({ name: 'csrf_token', value: 'csrf-xyz' });
        expect(row.action?.formAction).toBe('https://kratos/self-service/settings?flow=abc');
        expect(row.action?.method).toBe('POST');
      }
    });
  });

  describe('display naming (FR-025/FR-026)', () => {
    it('uses the socialProviderCustomizations display name when known', () => {
      const flow = buildFlow([hiddenNode('csrf_token', 'x'), oidcSubmitNode('link', 'cleverbase')]);
      const result = adaptConnectedAccountsFlow(flow, [AuthenticationType.Email]);
      expect(result.providers.find(p => p.providerId === 'cleverbase')?.displayName).toBe('Cleverbase');
    });

    it('falls back to a capitalised id for an unknown provider (no code change needed to render a newly configured one)', () => {
      const flow = buildFlow([hiddenNode('csrf_token', 'x'), oidcSubmitNode('link', 'newprovider')]);
      const result = adaptConnectedAccountsFlow(flow, [AuthenticationType.Email]);
      expect(result.providers.find(p => p.providerId === 'newprovider')?.displayName).toBe('Newprovider');
    });
  });

  describe('provider ordering', () => {
    it('sorts by socialProviderCustomizations.sortOrder', () => {
      const flow = buildFlow([
        hiddenNode('csrf_token', 'x'),
        oidcSubmitNode('link', 'cleverbase'),
        oidcSubmitNode('link', 'microsoft'),
        oidcSubmitNode('link', 'github'),
      ]);
      const result = adaptConnectedAccountsFlow(flow, [AuthenticationType.Email]);
      expect(result.providers.map(p => p.providerId)).toEqual(['microsoft', 'github', 'cleverbase']);
    });
  });

  describe('credential rows (password/passkey — FR-022)', () => {
    it('password present exactly when AuthenticationType.Email is in methods', () => {
      const flow = buildFlow([hiddenNode('csrf_token', 'x')]);
      expect(adaptConnectedAccountsFlow(flow, [AuthenticationType.Email]).credentials).toContainEqual({
        kind: 'password',
        present: true,
      });
      expect(adaptConnectedAccountsFlow(flow, []).credentials).toContainEqual({
        kind: 'password',
        present: false,
      });
    });

    it.each([
      'webauthn_remove',
      'passkey_remove',
    ] as const)('passkey present when a %s node exists in the flow', removeNodeName => {
      const flow = buildFlow([hiddenNode('csrf_token', 'x'), passkeyRemoveNode(removeNodeName)]);
      expect(adaptConnectedAccountsFlow(flow, []).credentials).toContainEqual({ kind: 'passkey', present: true });
    });

    it('passkey absent when no remove node exists', () => {
      const flow = buildFlow([hiddenNode('csrf_token', 'x')]);
      expect(adaptConnectedAccountsFlow(flow, []).credentials).toContainEqual({ kind: 'passkey', present: false });
    });
  });

  describe('flow-message pass-through (translation happens in the integration layer — research D4)', () => {
    it('passes the flow-level id/type/text/context through verbatim, untranslated — the adapter stays pure', () => {
      const flow = buildFlow(
        [hiddenNode('csrf_token', 'x')],
        [{ id: 1050001, text: 'Your changes have been saved!', type: 'success' }]
      );
      const result = adaptConnectedAccountsFlow(flow, []);
      expect(result.messages[0]).toMatchObject({
        id: 1050001,
        type: 'success',
        text: 'Your changes have been saved!',
      });
    });

    it('passes id 4000007 (duplicate identity) through the same way — the settings-context copy is applied downstream, not here', () => {
      const flow = buildFlow(
        [hiddenNode('csrf_token', 'x')],
        [{ id: 4000007, text: 'This email is already associated with an account.', type: 'error' }]
      );
      const result = adaptConnectedAccountsFlow(flow, []);
      expect(result.messages[0]).toMatchObject({ id: 4000007, type: 'error' });
    });

    it('carries an unmapped id through with its raw Kratos text and type normalised to info/error/success', () => {
      const flow = buildFlow(
        [hiddenNode('csrf_token', 'x')],
        [{ id: 4000099, text: 'Some other flow validation message.', type: 'error' }]
      );
      const result = adaptConnectedAccountsFlow(flow, []);
      expect(result.messages[0]).toEqual({
        id: 4000099,
        type: 'error',
        text: 'Some other flow validation message.',
        context: undefined,
      });
    });

    it('keeps flow-level messages when the flow was produced by the oidc method', () => {
      const flow = buildFlow(
        [hiddenNode('csrf_token', 'x')],
        [{ id: 4000007, text: 'An account with the same identifier exists already.', type: 'error' }]
      );
      (flow as unknown as { active: string }).active = 'oidc';
      expect(adaptConnectedAccountsFlow(flow, []).messages).toHaveLength(1);
    });

    it("drops flow-level messages produced by another method — the shared flow's password outcome must not render in this section", () => {
      const flow = buildFlow(
        [hiddenNode('csrf_token', 'x')],
        [{ id: 1050001, text: 'Your changes have been saved!', type: 'success' }]
      );
      (flow as unknown as { active: string }).active = 'password';
      expect(adaptConnectedAccountsFlow(flow, []).messages).toEqual([]);
    });
  });
});
