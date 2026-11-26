import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { SpacePageDocument } from '@/core/apollo/generated-v2/apollo-hooks';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import { GlobalStateProvider } from '@/core/state/GlobalStateProvider';
import { spacePageVariables } from '@/domain/space/hooks/useSpacePage';
import { CrdSpaceAbout } from './CrdSpaceAbout';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
}));
vi.mock('@/domain/space/context/useSpace', () => ({
  useSpace: () => ({
    space: {
      id: 'space',
      level: SpaceLevel.L0,
      about: { profile: { url: '/space', displayName: 'Green Space' }, membership: {}, guidelines: { id: 'space' } },
    },
    permissions: { canRead: true, canUpdate: false },
  }),
}));

const can = Object.fromEntries(
  ['read', 'update', 'delete', 'archive', 'createPost', 'createSubspace', 'createDocument', 'invite']
    .concat(['manageMembers', 'manageTemplates', 'upload', 'readActivity', 'saveAsTemplate', 'join', 'apply'])
    .map(flag => [flag, flag === 'read'])
);
const lead = (id: string, actorType: string) => ({
  __typename: 'User',
  id,
  actorType,
  url: `/${id}`,
  about: { __typename: 'About', displayName: `Lead ${id}`, avatar: null, location: { city: 'Delft', country: null } },
});
const node = {
  __typename: 'Space',
  id: 'space',
  entityType: 'space',
  handle: 'space',
  url: '/space',
  depth: 0,
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
  tags: ['energy'],
  isContentPublic: true,
  settings: null,
  videoCallUrl: null,
  memberCount: 7,
  about: {
    __typename: 'About',
    displayName: 'Green Space',
    tagline: 'Greener',
    description: 'About text',
    location: null,
    facets: [],
    avatar: null,
    banner: null,
    card: null,
  },
  links: [],
  classifications: [],
  guidelines: { displayName: 'House rules', description: 'Be kind' },
  applicationForm: null,
  host: null,
  leads: [lead('ann', 'user')],
  stages: [],
  membership: { __typename: 'Membership', roles: ['member'], status: 'MEMBER', request: null },
  parent: null,
  entitlements: [],
  can: { __typename: 'SpaceCan', ...can },
};

describe('CrdSpaceAbout (021 T010)', () => {
  test('opening About from a tab renders the cached D2 document and sends no request', async () => {
    const sent: string[] = [];
    const client = new ApolloClient({
      cache: createV2Cache(),
      link: new ApolloLink(
        operation =>
          new Observable(observer => {
            sent.push(operation.operationName);
            observer.error(new Error(`unexpected ${operation.operationName}`));
          })
      ),
    });
    client.writeQuery({
      query: SpacePageDocument,
      variables: spacePageVariables('space', ['space']),
      data: { node },
    });

    render(
      <ApolloProvider client={client}>
        <GlobalStateProvider>
          <MemoryRouter initialEntries={['/space']}>
            <CrdSpaceAbout open={true} onClose={vi.fn()} />
          </MemoryRouter>
        </GlobalStateProvider>
      </ApolloProvider>
    );

    expect(await screen.findByText('Lead ann')).toBeInTheDocument();
    expect(screen.getByText('House rules')).toBeInTheDocument();
    expect(screen.getAllByText('Green Space').length).toBeGreaterThan(0);
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(sent).toEqual([]);
  });
});
