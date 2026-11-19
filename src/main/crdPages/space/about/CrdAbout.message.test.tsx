import { render } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const { messageContributor, aboutDialog } = vi.hoisted(() => ({
  messageContributor: vi.fn(),
  aboutDialog: vi.fn((_props: Record<string, unknown>) => null),
}));

const lead = (id: string, displayName: string) => ({
  id,
  profile: { id: `${id}-profile`, displayName, url: `/user/${id}`, tagline: null, location: null, keywords: null },
});

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useSpaceAboutDetailsQuery: () => ({
    data: {
      lookup: {
        space: {
          about: {
            profile: { displayName: 'A space', url: '/a-space', references: [], tagset: { tags: [] } },
            metrics: [],
            guidelines: { id: 'g' },
            membership: { leadUsers: [lead('mila', 'Mila Janssen'), lead('kai', 'Kai Tanaka')], leadOrganizations: [] },
          },
        },
      },
    },
  }),
  useCommunityGuidelinesQuery: () => ({ data: undefined, loading: false }),
  // Mila accepts direct messages, Kai does not.
  useUsersContactabilityQuery: () => ({
    data: {
      users: [
        { id: 'mila', isContactable: true },
        { id: 'kai', isContactable: false },
      ],
    },
  }),
}));
vi.mock('@/core/routing/useNavigate', () => ({ default: () => vi.fn() }));
vi.mock('@/crd/components/space/SpaceAboutDialog', () => ({ SpaceAboutDialog: aboutDialog }));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: { id: 'viewer' } }),
}));
const spaceLike = { id: 'space', level: 'L0', about: { profile: { displayName: 'A space', url: '/a-space' } } };
vi.mock('@/domain/space/context/useSpace', () => ({
  useSpace: () => ({ space: spaceLike, permissions: { canUpdate: false } }),
}));
vi.mock('@/domain/space/hooks/useSubSpace', () => ({
  useSubSpace: () => ({
    subspace: { ...spaceLike, level: 'L1' },
    permissions: { canUpdate: false },
    parentSpaceId: 'p',
  }),
}));
vi.mock('@/main/crdPages/space/useSpaceApplyFlow', () => ({
  useSpaceApplyFlow: () => ({ loading: false, isMember: true, buttonProps: {}, dialogs: null }),
}));
vi.mock('@/main/crdPages/topLevelPages/common/useSendMessageHandler', () => ({
  useMessageContributor: () => messageContributor,
}));
vi.mock('@/main/crdPages/topLevelPages/spaceSettings/about/aboutMapper', () => ({
  mapClassificationEntries: () => [],
}));

const { CrdSpaceAbout } = await import('./CrdSpaceAbout');
const { CrdSubspaceAbout } = await import('@/main/crdPages/subspace/about/CrdSubspaceAbout');

type LeadProps = { data: { leadUsers: { name: string; preview?: { canMessage?: boolean } }[] } };

beforeEach(() => aboutDialog.mockClear());

describe.each([
  ['Space', CrdSpaceAbout],
  ['Subspace', CrdSubspaceAbout],
])('%s About dialog leads', (_level, About) => {
  test('get the direct-chat Message action, offered only on leads who accept direct messages', () => {
    render(<About open={true} onClose={vi.fn()} />);
    const props = aboutDialog.mock.lastCall?.[0] as unknown as LeadProps & { onMessageContributor?: unknown };

    expect(props.onMessageContributor).toBe(messageContributor);
    const canMessage = Object.fromEntries(props.data.leadUsers.map(l => [l.name, l.preview?.canMessage]));
    expect(canMessage).toEqual({ 'Mila Janssen': true, 'Kai Tanaka': false });
  });
});
