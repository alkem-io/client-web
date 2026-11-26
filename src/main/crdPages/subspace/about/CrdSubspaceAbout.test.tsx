import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import type { SpaceAboutData } from '@/crd/components/space/SpaceAboutView';
import { subspaceAbout } from '@/domain/space/context/SubspaceContext';
import { CrdSubspaceAbout } from './CrdSubspaceAbout';

let dialog: { data: SpaceAboutData; memberCount?: string; guidelinesSlot?: unknown } | undefined;
const applyFlow = vi.fn((_options: { skip?: boolean }) => ({
  loading: false,
  isMember: false,
  buttonProps: {},
  dialogs: null,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/core/routing/useNavigate', () => ({ default: () => vi.fn() }));
vi.mock('@/crd/components/space/SpaceAboutDialog', () => ({
  SpaceAboutDialog: (props: typeof dialog) => {
    dialog = props;
    return null;
  },
}));
vi.mock('../../space/useSpaceApplyFlow', () => ({
  useSpaceApplyFlow: (options: { skip?: boolean }) => applyFlow(options),
}));
vi.mock('@/main/crdPages/space/isApplyUnavailable', () => ({ isApplyUnavailable: () => true }));

const user = {
  __typename: 'User',
  id: 'u1',
  actorType: 'user',
  url: '/user/u1',
  about: { __typename: 'About', displayName: 'Ada', avatar: null, location: { city: 'Delft', country: 'NL' } },
};
// The subspace D2 Space document fields About reads (021 F054-F068).
const space = {
  id: 'l1',
  handle: 'l1',
  url: '/root/challenges/l1',
  depth: 1,
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
  tags: ['climate'],
  isContentPublic: true,
  memberCount: 12,
  about: {
    displayName: 'Subspace',
    tagline: 'Its tagline',
    description: 'Its description',
    location: { city: 'Delft', country: 'NL' },
    facets: [
      { namespace: 'core', name: 'purpose', value: { why: 'Because climate', who: 'Everyone' } },
      // The references are the reference link roles' facets (Space.links is not served).
      {
        namespace: 'core',
        name: 'link_role.reference',
        value: [
          {
            id: 'k2',
            role: 'reference',
            uri: 'https://example.org/b',
            title: 'Second',
            description: null,
            sortOrder: 1,
          },
          {
            id: 'k1',
            role: 'reference',
            uri: 'https://example.org/a',
            title: 'First',
            description: 'Read',
            sortOrder: 0,
          },
        ],
      },
    ],
  },
  host: { ...user, id: 'host', about: { ...user.about, displayName: 'Host' } },
  leads: [user],
  membership: { roles: [], status: 'NONE' },
  can: { read: false, update: false },
} as unknown as Parameters<typeof subspaceAbout>[0];

vi.mock('@/domain/space/hooks/useSubSpace', () => ({
  useSubSpace: () => ({
    subspace: { id: 'l1', nameId: 'l1', level: SpaceLevel.L1, about: subspaceAbout(space) },
    permissions: { canRead: false, canUpdate: false },
    parentSpaceId: 'root',
  }),
}));

// The About reads the page's cached Space document only (cache-only): any request is recorded and fails the test.
function renderAbout(ui: ReactElement) {
  const sent: string[] = [];
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(operation => {
      sent.push(operation.operationName);
      return new Observable(observer => observer.error(new Error('unexpected request')));
    }),
  });
  render(<ApolloProvider client={client}>{ui}</ApolloProvider>);
  return sent;
}

describe('CrdSubspaceAbout (021 T021, the page D2 data)', () => {
  test('renders the About from the Space document, purpose facet and links included, with no request', () => {
    const sent = renderAbout(<CrdSubspaceAbout open={true} onClose={() => {}} />);
    expect(dialog?.data).toEqual({
      name: 'Subspace',
      tagline: 'Its tagline',
      description: 'Its description',
      location: 'Delft, NL',
      metrics: [{ name: 'members', value: '12' }],
      who: 'Everyone',
      why: 'Because climate',
      provider: { name: 'Host', avatarUrl: undefined, type: 'organization', location: 'Delft, NL', href: '/user/u1' },
      leadUsers: [{ name: 'Ada', avatarUrl: undefined, type: 'person', location: 'Delft, NL', href: '/user/u1' }],
      leadOrganizations: [],
      references: [
        { name: 'First', uri: 'https://example.org/a', description: 'Read' },
        { name: 'Second', uri: 'https://example.org/b', description: undefined },
      ],
      tags: ['climate'],
      classifications: [],
    });
    expect(dialog?.memberCount).toBe('12');
    expect(sent).toEqual([]);
  });

  test('a closed About issues no apply-flow request', () => {
    renderAbout(<CrdSubspaceAbout open={false} onClose={() => {}} />);
    expect(applyFlow).toHaveBeenLastCalledWith(expect.objectContaining({ skip: true }));
  });
});
