import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  CommunityMembershipStatus,
  SpaceLevel,
  TagsetReservedName,
  TagsetType,
} from '@/core/apollo/generated/graphql-schema';
import { SpacePageDocument } from '@/core/apollo/generated-v2/apollo-hooks';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import { spacePageVariables } from '@/domain/space/hooks/useSpacePage';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import SubspaceContextProvider from './SubspaceContext';

vi.mock('@/main/routing/urlResolver/useUrlResolver', () => ({
  default: () => ({ spaceId: 'l2', parentSpaceId: 'l1', loading: false }),
}));

const fileRef = (url: string) => ({
  __typename: 'FileRef',
  alt: null,
  file: { __typename: 'File', id: `f${url}`, url },
});
const lead = (typename: string, id: string, actorType: string) => ({
  __typename: typename,
  id,
  actorType,
  url: `/${id}`,
  about: {
    __typename: 'About',
    displayName: `Lead ${id}`,
    avatar: { __typename: 'FileRef', alt: null, file: { __typename: 'File', url: `/a-${id}` } },
    location: { city: 'Delft', country: 'NL' },
  },
});
const flags = (read: boolean) => ({
  __typename: 'SpaceCan',
  ...Object.fromEntries(
    [
      'delete',
      'archive',
      'createDocument',
      'invite',
      'manageMembers',
      'manageTemplates',
      'upload',
      'readActivity',
      'saveAsTemplate',
      'join',
      'apply',
    ].map(flag => [flag, false])
  ),
  read,
  update: read,
  createPost: read,
  createSubspace: false,
});

// A reader's 021 D2 Space document; the face-only variant carries the face tier and masks the rest (null).
const document = (reader: boolean, depth = 2) => ({
  __typename: 'Space',
  id: 'l2',
  entityType: 'space',
  handle: 'handle-l2',
  url: '/root/challenges/l1/opportunities/l2',
  depth,
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
  tags: ['t1'],
  isContentPublic: false,
  settings: null,
  videoCallUrl: null,
  memberCount: reader ? 7 : null,
  about: {
    __typename: 'About',
    displayName: 'Deep',
    tagline: 'Deep tagline',
    description: 'Deep description',
    location: { city: 'Delft', country: 'NL' },
    facets: [],
    avatar: fileRef('/avatar'),
    banner: null,
    card: reader ? fileRef('/card') : null,
  },
  links: [],
  classifications: [],
  guidelines: null,
  applicationForm: null,
  host: reader ? { ...lead('Organization', 'host', 'organization'), account: null } : null,
  leads: reader ? [lead('User', 'u1', 'user'), lead('Organization', 'o1', 'organization')] : null,
  stages: null,
  membership: { __typename: 'Membership', roles: [], status: reader ? 'MEMBER' : 'NONE', request: null },
  parent: null,
  entitlements: null,
  can: flags(reader),
});

function renderContext(node: ReturnType<typeof document>) {
  const sent: string[] = [];
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(
      operation =>
        new Observable(() => {
          sent.push(operation.operationName);
        })
    ),
  });
  client.writeQuery({
    query: SpacePageDocument,
    variables: spacePageVariables('l2', ['space']),
    data: { node },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <ApolloProvider client={client}>
      <SubspaceContextProvider>{children}</SubspaceContextProvider>
    </ApolloProvider>
  );
  return { sent, ...renderHook(() => useSubSpace(), { wrapper }) };
}

const contributor = (id: string) => ({
  id,
  profile: {
    id,
    displayName: `Lead ${id}`,
    url: `/${id}`,
    avatar: { id, uri: `/a-${id}` },
    location: { city: 'Delft', country: 'NL' },
  },
});

describe('SubspaceContext (021 T004, the subspace D2 Space document)', () => {
  it('a reader gets the legacy value shape from D2, with no request of its own', async () => {
    const { result, sent } = renderContext(document(true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(sent).toEqual([]);
    expect(result.current).toEqual({
      loading: false,
      parentSpaceId: 'l1',
      permissions: { canUpdate: true, canCreate: true, canCreateSubspace: false, canRead: true, contextPrivileges: [] },
      subspace: {
        id: 'l2',
        nameId: 'handle-l2',
        level: SpaceLevel.L2,
        about: {
          id: 'l2',
          who: '',
          why: '',
          isContentPublic: false,
          provider: contributor('host'),
          membership: {
            myMembershipStatus: CommunityMembershipStatus.Member,
            roleSetID: 'l2',
            communityID: 'l2',
            leadUsers: [contributor('u1')],
            leadOrganizations: [contributor('o1')],
          },
          guidelines: { id: 'l2' },
          metrics: [{ name: 'members', value: '7' }],
          profile: {
            id: 'l2',
            url: '/root/challenges/l1/opportunities/l2',
            displayName: 'Deep',
            tagline: 'Deep tagline',
            description: 'Deep description',
            tagset: {
              id: 'l2',
              name: TagsetReservedName.Default,
              tags: ['t1'],
              allowedValues: [],
              type: TagsetType.Freeform,
            },
            avatar: { id: 'f/avatar', uri: '/avatar', alternativeText: undefined },
            banner: undefined,
            cardBanner: { id: 'f/card', uri: '/card', alternativeText: undefined },
            references: [],
            location: { id: 'l2', city: 'Delft', country: 'NL' },
          },
        },
      },
    });
  });

  it('a face-only viewer gets no read and the masked fields as absent data', async () => {
    const { result } = renderContext(document(false));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.permissions).toEqual({
      canUpdate: false,
      canCreate: false,
      canCreateSubspace: false,
      canRead: false,
      contextPrivileges: [],
    });
    expect(result.current.subspace.about).toMatchObject({
      provider: undefined,
      metrics: [],
      membership: { myMembershipStatus: CommunityMembershipStatus.NotMember, leadUsers: [], leadOrganizations: [] },
      profile: { displayName: 'Deep', cardBanner: undefined },
    });
  });

  it('a depth-1 space is level L1; a top-level space is never provided as a subspace', async () => {
    const l1 = renderContext(document(true, 1));
    await waitFor(() => expect(l1.result.current.subspace.level).toBe(SpaceLevel.L1));
    const l0 = renderContext(document(true, 0));
    expect(l0.result.current.subspace.id).toBe('');
    expect(l0.result.current.loading).toBe(true);
  });
});
