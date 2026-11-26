import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { act, renderHook, waitFor } from '@testing-library/react';
import { GraphQLError, print } from 'graphql';
import type { PropsWithChildren } from 'react';
import { describe, expect, it } from 'vitest';
import type { SpaceSettingsSettingsQuery } from '@/core/apollo/generated-v2/graphql-schema';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import { useSettingsTabData } from './useSettingsTabData';

type Request = { operationName: string; variables: Record<string, unknown>; query: string };
type Reply = Record<string, unknown> | { errors: GraphQLError[] };

const space = (actorType = 'organization', audience = 'PUBLIC'): SpaceSettingsSettingsQuery => ({
  node: {
    __typename: 'Space',
    id: 'space-1',
    entityType: 'space',
    settings: {
      allow_callouts: true,
      allow_subspaces: false,
      inherit_membership: false,
      allow_guests: false,
      allow_platform_support_as_admin: false,
      subspace_invites: false,
      membership_policy: 'applications',
      events_from_subspaces: false,
      permissions: { members_video_call: false, inherit_audience: true },
      user_information_visibility: 'space',
    },
    audience: audience as 'PUBLIC',
    host: {
      __typename: 'Organization',
      id: 'host-1',
      actorType,
      about: { __typename: 'About', displayName: 'Host Org' },
    },
    curated: [
      {
        __typename: 'CuratedItem',
        role: 'trusted_org',
        sortOrder: 1,
        node: { __typename: 'Organization', id: 'other-org', entityType: 'organization' },
      },
      {
        __typename: 'CuratedItem',
        role: 'homepage_space',
        sortOrder: 0,
        node: { __typename: 'Space', id: 'unrelated', entityType: 'space' },
      },
    ],
  },
});

function setup(handlers: Record<string, Array<Reply>>) {
  const requests: Request[] = [];
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(
      operation =>
        new Observable(observer => {
          requests.push({
            operationName: operation.operationName,
            variables: operation.variables,
            query: print(operation.query),
          });
          const reply = handlers[operation.operationName]?.shift();
          const timer = setTimeout(() => {
            if (!reply) observer.error(new Error(`Unexpected ${operation.operationName}`));
            else if ('errors' in reply) {
              observer.next(reply as { errors: GraphQLError[] });
              observer.complete();
            } else {
              observer.next({ data: reply });
              observer.complete();
            }
          }, 0);
          return () => clearTimeout(timer);
        })
    ),
  });
  const wrapper = ({ children }: PropsWithChildren) => <ApolloProvider client={client}>{children}</ApolloProvider>;
  const hook = renderHook(() => useSettingsTabData('space-1'), { wrapper });
  return { ...hook, requests };
}

const loaded = async (fixture: ReturnType<typeof setup>) =>
  waitFor(() => expect(fixture.result.current.providerDisplayName).toBe('Host Org'));

describe('useSettingsTabData — native Space.settings / audience / trusted_org references', () => {
  it('reads the settings tab from one native space read', async () => {
    const fixture = setup({ SpaceSettingsSettings: [space()] });
    await loaded(fixture);
    expect(fixture.requests).toHaveLength(1);
    expect(fixture.requests[0].variables).toEqual({ id: 'space-1' });
    expect(fixture.requests[0].query).toContain('curated');
    expect(fixture.requests[0].query).not.toMatch(/lookup|roleSet|trustedOrganizations/);
    const current = fixture.result.current;
    expect(current.privacy).toBe('public');
    expect(current.membershipPolicy).toBe('application');
    expect(current.userInfoVisibility).toBe('followSpace');
    expect(current.hostIsOrganization).toBe(true);
    // Only the host decides the toggle; another trusted organization does not flip it.
    expect(current.hostOrganizationTrusted).toBe(false);
    expect(current.allowedActions.find(a => a.key === 'memberCreatePosts')?.enabled).toBe(true);
    expect(current.allowedActions.find(a => a.key === 'subspaceEvents')?.enabled).toBe(false);
  });

  it.each([
    ['organization', true],
    ['user', false],
  ])('flags whether the host is an organization (actorType %s → %s)', async (actorType, expected) => {
    const fixture = setup({ SpaceSettingsSettings: [space(actorType)] });
    await loaded(fixture);
    expect(fixture.result.current.hostIsOrganization).toBe(expected);
  });

  it('maps a RESTRICTED audience to private', async () => {
    const fixture = setup({ SpaceSettingsSettings: [space('organization', 'RESTRICTED')] });
    await loaded(fixture);
    expect(fixture.result.current.privacy).toBe('private');
  });

  it('shows a REGISTERED audience as the signed-in-users option and writes it back (signed FC-S4)', async () => {
    const fixture = setup({
      SpaceSettingsSettings: [space('organization', 'REGISTERED')],
      SpaceSettingsSetAudience: [{ setSpaceAudience: { __typename: 'Space', id: 'space-1', audience: 'PUBLIC' } }],
    });
    await loaded(fixture);
    expect(fixture.result.current.privacy).toBe('registered');

    act(() => fixture.result.current.onPrivacyChange('public'));
    await act(async () => {
      await fixture.result.current.unsaved.saveAll();
    });
    expect(fixture.requests.filter(r => r.operationName === 'SpaceSettingsSetAudience').map(r => r.variables)).toEqual([
      { id: 'space-1', audience: 'PUBLIC' },
    ]);
  });

  it('buffers changes, counts one per control, and drops a control put back', async () => {
    const fixture = setup({ SpaceSettingsSettings: [space()] });
    await loaded(fixture);
    act(() => fixture.result.current.onPrivacyChange('private'));
    act(() => fixture.result.current.onToggleAllowedAction('videoCalls', true));
    act(() => fixture.result.current.onHostOrgTrustChange(true));
    act(() => fixture.result.current.onMembershipPolicyChange('open'));
    act(() => fixture.result.current.onMembershipPolicyChange('application'));
    expect(fixture.result.current.privacy).toBe('private');
    expect(fixture.result.current.hostOrganizationTrusted).toBe(true);
    expect(fixture.result.current.unsaved.count).toBe(3);
    expect(fixture.requests).toHaveLength(1);
  });

  it('writes each change through its own intent and keeps every other trust link', async () => {
    const fixture = setup({
      SpaceSettingsSettings: [space()],
      SpaceSettingsUpdateSettings: [{ updateSpace: { __typename: 'Space', id: 'space-1', settings: {} } }],
      SpaceSettingsSetAudience: [{ setSpaceAudience: { __typename: 'Space', id: 'space-1', audience: 'RESTRICTED' } }],
      SpaceSettingsSetTrustedOrganizations: [
        {
          setReferences: {
            __typename: 'Space',
            id: 'space-1',
            entityType: 'space',
            curated: [
              {
                __typename: 'CuratedItem',
                role: 'trusted_org',
                sortOrder: 0,
                node: { __typename: 'Organization', id: 'other-org', entityType: 'organization' },
              },
              {
                __typename: 'CuratedItem',
                role: 'trusted_org',
                sortOrder: 1,
                node: { __typename: 'Organization', id: 'host-1', entityType: 'organization' },
              },
            ],
          },
        },
      ],
    });
    await loaded(fixture);
    act(() => fixture.result.current.onPrivacyChange('private'));
    act(() => fixture.result.current.onToggleAllowedAction('videoCalls', true));
    act(() => fixture.result.current.onToggleAllowedAction('alkemioSupportAccess', true));
    act(() => fixture.result.current.onUserInfoVisibilityChange('membersOnly'));
    act(() => fixture.result.current.onMembershipPolicyChange('open'));
    act(() => fixture.result.current.onHostOrgTrustChange(true));

    let ok: boolean | undefined;
    await act(async () => {
      ok = await fixture.result.current.unsaved.saveAll();
    });

    expect(ok).toBe(true);
    const byName = (name: string) => fixture.requests.filter(r => r.operationName === name);
    expect(byName('SpaceSettingsUpdateSettings').map(r => r.variables)).toEqual([
      {
        id: 'space-1',
        settings: {
          permissions: { members_video_call: true, inherit_audience: true },
          allow_platform_support_as_admin: true,
          user_information_visibility: 'members',
          membership_policy: 'open',
        },
      },
    ]);
    expect(byName('SpaceSettingsSetAudience').map(r => r.variables)).toEqual([
      { id: 'space-1', audience: 'RESTRICTED' },
    ]);
    expect(byName('SpaceSettingsSetTrustedOrganizations').map(r => r.variables)).toEqual([
      { owner: 'space-1', targets: ['other-org', 'host-1'] },
    ]);
    expect(byName('SpaceSettingsSetTrustedOrganizations')[0].query).toContain('role: "trusted_org"');
    expect(byName('SpaceSettingsSettings')).toHaveLength(1);
    expect(fixture.result.current.unsaved.count).toBe(0);
    expect(fixture.result.current.hostOrganizationTrusted).toBe(true);
  });

  it('keeps a refused change counted and reports the error, while the written ones leave the buffer', async () => {
    const fixture = setup({
      SpaceSettingsSettings: [space()],
      SpaceSettingsUpdateSettings: [{ updateSpace: { __typename: 'Space', id: 'space-1', settings: {} } }],
      SpaceSettingsSetAudience: [{ errors: [new GraphQLError('Forbidden')] }],
    });
    await loaded(fixture);
    act(() => fixture.result.current.onPrivacyChange('private'));
    act(() => fixture.result.current.onToggleAllowedAction('memberCreatePosts', false));

    let ok: boolean | undefined;
    await act(async () => {
      ok = await fixture.result.current.unsaved.saveAll();
    });

    expect(ok).toBe(false);
    expect(fixture.result.current.unsaved.error).toBe('Forbidden');
    expect(fixture.result.current.unsaved.count).toBe(1);
    expect(fixture.result.current.privacy).toBe('private');
  });

  it('reset puts every control back to the server value', async () => {
    const fixture = setup({ SpaceSettingsSettings: [space()] });
    await loaded(fixture);
    act(() => fixture.result.current.onPrivacyChange('private'));
    act(() => fixture.result.current.unsaved.reset());
    expect(fixture.result.current.privacy).toBe('public');
    expect(fixture.result.current.unsaved.count).toBe(0);
  });
});
