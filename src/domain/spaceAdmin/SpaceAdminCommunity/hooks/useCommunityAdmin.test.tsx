import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { act, renderHook, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';

// The applications/invitations lists are not repointed (requests); they stay mocked here.
vi.mock('@/domain/access/ApplicationsAndInvitations/useRoleSetApplicationsAndInvitations', () => ({
  default: vi.fn(() => ({
    applications: [],
    invitations: [],
    platformInvitations: [],
    applicationStateChange: vi.fn(),
    invitationStateChange: vi.fn(),
    deleteInvitation: vi.fn(),
    deletePlatformInvitation: vi.fn(),
    resendPlatformInvitation: vi.fn(),
    loading: false,
    errored: false,
  })),
}));

import useCommunityAdmin from './useCommunityAdmin';

type Reply = Record<string, unknown> | { errors: GraphQLError[] };
type Request = { operationName: string; variables: Record<string, unknown> };

const about = (displayName: string) => ({
  __typename: 'About',
  displayName,
  avatar: { __typename: 'FileRef', file: { __typename: 'File', url: `/avatar/${displayName}` } },
});
const user = (id: string) => ({
  __typename: 'User',
  id,
  actorType: 'user',
  url: `/user/${id}`,
  about: about(id),
  firstName: `First ${id}`,
  // READ_USER_PII: null for a member whose PII the admin may not read.
  email: id === 'u-1' ? `${id}@example.org` : null,
});
const organization = (id: string) => ({
  __typename: 'Organization',
  id,
  actorType: 'organization',
  url: `/organization/${id}`,
  about: about(id),
});
const agent = (id: string) => ({
  __typename: 'Agent',
  id,
  actorType: 'virtual_contributor',
  url: `/vc/${id}`,
  about: about(id),
});
const membersPage = (members: Array<[Record<string, unknown>, string[]]>, endCursor: string | null) => ({
  members: {
    __typename: 'MemberConnection',
    edges: members.map(([actor, roles]) => ({
      __typename: 'MemberEdge',
      node: { __typename: 'Member', roles, actor },
    })),
    pageInfo: { __typename: 'PageInfo', hasNextPage: endCursor !== null, endCursor },
  },
});
const adminReply = (can: { invite: boolean; manageMembers: boolean }) => ({
  node: { __typename: 'Space', id: 'space-1', entityType: 'space', can: { __typename: 'SpaceCan', ...can } },
  rolePolicies: [
    { __typename: 'RolePolicy', role: 'lead', actorType: 'user', minHolders: 0, maxHolders: 2, holders: 1 },
    { __typename: 'RolePolicy', role: 'lead', actorType: 'organization', minHolders: null, maxHolders: 9, holders: 0 },
    { __typename: 'RolePolicy', role: 'member', actorType: 'user', minHolders: null, maxHolders: null, holders: 1 },
  ],
});
const pickerAdmitted = {
  candidates: {
    __typename: 'ActorConnection',
    edges: [{ __typename: 'ActorEdge', node: { __typename: 'Agent', id: 'vc-free' } }],
  },
};
const forbidden = { errors: [new GraphQLError('forbidden', { extensions: { code: 'FORBIDDEN' } })] };
const setRolesReply = {
  setRoles: {
    __typename: 'MembershipResult',
    node: { __typename: 'Space', id: 'space-1' },
  },
};

function setup(replies: Record<string, Reply[]>) {
  const requests: Request[] = [];
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(
      operation =>
        new Observable(observer => {
          requests.push({ operationName: operation.operationName, variables: operation.variables });
          const reply = replies[operation.operationName]?.shift();
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
  const hook = renderHook(() => useCommunityAdmin({ spaceId: 'space-1', roleSetId: 'rs-1' }), { wrapper });
  const named = (name: string) => requests.filter(r => r.operationName === name);
  return { ...hook, requests, named };
}

const ROSTER: Array<[Record<string, unknown>, string[]]> = [
  [user('u-member'), ['member']],
  [user('u-lead'), ['member', 'lead']],
  [user('u-admin'), ['member', 'admin', 'invitee']],
  [organization('o-member'), ['member']],
  [organization('o-lead'), ['member', 'lead']],
  [agent('vc-member'), ['member']],
];

/** Every query the hook issues on mount, plus the refetches a mutation triggers. */
const standardReplies = (extra: Record<string, Reply[]> = {}) => ({
  SpaceCommunityMembers: [membersPage(ROSTER, null), membersPage(ROSTER, null)],
  SpaceCommunityAdmin: [
    adminReply({ invite: true, manageMembers: true }),
    adminReply({ invite: true, manageMembers: true }),
  ],
  SpaceCommunityVirtualContributorPicker: [pickerAdmitted, pickerAdmitted],
  ...extra,
});

describe('useCommunityAdmin — roster (Query.members)', () => {
  it('reads every members page of the space and splits the roster by actorType', async () => {
    const fixture = setup({
      ...standardReplies(),
      SpaceCommunityMembers: [
        membersPage([[user('u-1'), ['member']]], 'cursor-1'),
        membersPage([[organization('o-1'), ['member', 'lead']]], null),
      ],
    });

    await waitFor(() => expect(fixture.result.current.loading).toBe(false));

    expect(fixture.named('SpaceCommunityMembers').map(r => r.variables)).toEqual([
      { space: 'space-1', first: 100 },
      { space: 'space-1', first: 100, after: 'cursor-1' },
    ]);
    expect(fixture.result.current.userAdmin.members).toEqual([
      expect.objectContaining({
        id: 'u-1',
        displayName: 'u-1',
        avatarUrl: '/avatar/u-1',
        url: '/user/u-1',
        firstName: 'First u-1',
        email: 'u-1@example.org',
        isMember: true,
        isLead: false,
        isAdmin: false,
      }),
    ]);
    expect(fixture.result.current.organizationAdmin.members).toEqual([
      expect.objectContaining({ id: 'o-1', isMember: true, isLead: true }),
    ]);
    expect(fixture.result.current.errored).toBe(false);
  });

  it('maps rolePolicies onto the lead bounds (null max = unbounded, null min = none)', async () => {
    const fixture = setup(standardReplies());
    await waitFor(() => expect(fixture.result.current.loading).toBe(false));

    expect(fixture.named('SpaceCommunityAdmin')[0].variables).toEqual({ space: 'space-1' });
    expect(fixture.result.current.membershipAdmin.leadRoleDefinition).toEqual({
      userPolicy: { minimum: 0, maximum: 2 },
      organizationPolicy: { minimum: 0, maximum: 9 },
    });
    expect(fixture.result.current.membershipAdmin.memberRoleDefinition).toEqual({
      userPolicy: { minimum: 0, maximum: -1 },
      organizationPolicy: { minimum: 0, maximum: -1 },
    });
  });

  it('is errored when the members read fails', async () => {
    const fixture = setup({ ...standardReplies(), SpaceCommunityMembers: [forbidden] });
    await waitFor(() => expect(fixture.result.current.errored).toBe(true));
  });
});

describe('useCommunityAdmin — gates', () => {
  it('reads SpaceCan.invite / SpaceCan.manageMembers and an admitted add-VC picker', async () => {
    const fixture = setup(standardReplies());
    await waitFor(() => expect(fixture.result.current.gates.virtualContributorPicker).toBe(true));

    expect(fixture.result.current.gates).toMatchObject({ invite: true, manageMembers: true, loading: false });
    expect(fixture.named('SpaceCommunityVirtualContributorPicker')[0].variables).toEqual({ space: 'space-1' });
    expect(fixture.result.current.permissions).toEqual({
      canInvite: true,
      canInviteOrganizations: true,
      canAddVirtualContributors: true,
    });
  });

  it('denies the add-VC picker when the server refuses the DIRECT directory (FORBIDDEN)', async () => {
    const fixture = setup({
      ...standardReplies(),
      SpaceCommunityAdmin: [adminReply({ invite: false, manageMembers: false })],
      SpaceCommunityVirtualContributorPicker: [forbidden],
    });
    await waitFor(() => expect(fixture.result.current.gates.virtualContributorPicker).toBe(false));

    expect(fixture.result.current.gates).toMatchObject({ invite: false, manageMembers: false });
    expect(fixture.result.current.permissions.canAddVirtualContributors).toBe(false);
    // A refused picker is a verdict, not a broken tab.
    expect(fixture.result.current.errored).toBe(false);
  });
});

describe('useCommunityAdmin — setRoles sends the exact desired role set', () => {
  const cases: Array<{
    name: string;
    act: (admin: ReturnType<typeof useCommunityAdmin>) => Promise<unknown>;
    actor: string;
    roles: string[];
  }> = [
    {
      name: 'lead on',
      act: a => a.userAdmin.onLeadChange('u-member', true),
      actor: 'u-member',
      roles: ['member', 'lead'],
    },
    { name: 'lead off', act: a => a.userAdmin.onLeadChange('u-lead', false), actor: 'u-lead', roles: ['member'] },
    {
      name: 'admin on (other roles kept)',
      act: a => a.userAdmin.onAuthorizationChange('u-lead', true),
      actor: 'u-lead',
      roles: ['member', 'lead', 'admin'],
    },
    {
      name: 'admin off (a non-community role kept)',
      act: a => a.userAdmin.onAuthorizationChange('u-admin', false),
      actor: 'u-admin',
      roles: ['member', 'invitee'],
    },
    { name: 'remove user', act: a => a.userAdmin.onRemove('u-admin'), actor: 'u-admin', roles: [] },
    {
      name: 'organization lead on',
      act: a => a.organizationAdmin.onLeadChange('o-member', true),
      actor: 'o-member',
      roles: ['member', 'lead'],
    },
    {
      name: 'organization lead off',
      act: a => a.organizationAdmin.onLeadChange('o-lead', false),
      actor: 'o-lead',
      roles: ['member'],
    },
    { name: 'remove organization', act: a => a.organizationAdmin.onRemove('o-lead'), actor: 'o-lead', roles: [] },
    { name: 'add VC', act: a => a.virtualContributorAdmin.onAdd('vc-new'), actor: 'vc-new', roles: ['member'] },
    { name: 'remove VC', act: a => a.virtualContributorAdmin.onRemove('vc-member'), actor: 'vc-member', roles: [] },
  ];

  let fixture: ReturnType<typeof setup>;
  beforeEach(() => {
    fixture = setup(standardReplies({ SetSpaceCommunityRoles: [setRolesReply] }));
  });

  for (const testCase of cases) {
    it(testCase.name, async () => {
      await waitFor(() => expect(fixture.result.current.loading).toBe(false));
      let result: unknown;
      await act(async () => {
        result = await testCase.act(fixture.result.current);
      });

      expect(fixture.named('SetSpaceCommunityRoles').map(r => r.variables)).toEqual([
        { space: 'space-1', actor: testCase.actor, roles: testCase.roles },
      ]);
      // The committed result comes back to the caller.
      expect(result).toMatchObject({ node: { id: 'space-1' } });
      // The roster and gates are refreshed from the server after the change.
      expect(fixture.named('SpaceCommunityMembers')).toHaveLength(2);
      expect(fixture.named('SpaceCommunityAdmin')).toHaveLength(2);
    });
  }
});
