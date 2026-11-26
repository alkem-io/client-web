import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';
import { SpacePageDocument } from '@/core/apollo/generated-v2/apollo-hooks';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import { GlobalStateProvider } from '@/core/state/GlobalStateProvider';
import { spacePageVariables } from '@/domain/space/hooks/useSpacePage';
import { useSpaceApplyFlow } from './useSpaceApplyFlow';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
  Trans: ({ values }: { values: Record<string, string> }) => <span>{values.user}</span>,
}));
vi.mock('@/main/routing/urlResolver/native/useNativeRouteSpace', () => ({
  useNativeRouteSpace: () => ({
    ancestors: [{ id: 'parent', depth: 0, url: '/parent', about: { displayName: 'Parent space' } }],
  }),
}));

const flags = (enabled: string[]) =>
  Object.fromEntries(
    ['read', 'update', 'delete', 'archive', 'createPost', 'createSubspace', 'createDocument', 'invite']
      .concat(['manageMembers', 'manageTemplates', 'upload', 'readActivity', 'saveAsTemplate', 'join', 'apply'])
      .map(flag => [flag, enabled.includes(flag)])
  );
const node = (status: string, can: string[], parentStatus: string, parentCan: string[], extra = {}) => ({
  __typename: 'Space',
  id: 'space',
  entityType: 'space',
  handle: 'space',
  url: '/parent/challenges/space',
  depth: 1,
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
  tags: [],
  isContentPublic: true,
  settings: null,
  videoCallUrl: null,
  memberCount: null,
  about: {
    __typename: 'About',
    displayName: 'Child space',
    tagline: null,
    description: null,
    location: null,
    facets: [],
    avatar: null,
    banner: null,
    card: null,
  },
  links: [],
  classifications: [],
  guidelines: null,
  applicationForm: null,
  host: null,
  leads: [],
  stages: [],
  membership: { __typename: 'Membership', roles: [], status, request: null },
  parent: {
    __typename: 'Space',
    id: 'parent',
    url: '/parent',
    can: { __typename: 'SpaceCan', ...flags(parentCan) },
    membership: { __typename: 'Membership', status: parentStatus },
  },
  entitlements: [],
  can: { __typename: 'SpaceCan', ...flags(can) },
  ...extra,
});

function renderFlow(data: ReturnType<typeof node>) {
  const sent: string[] = [];
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(
      operation =>
        new Observable(observer => {
          sent.push(operation.operationName);
          observer.error(new Error('unexpected'));
        })
    ),
  });
  client.writeQuery({
    query: SpacePageDocument,
    variables: spacePageVariables('space', ['space']),
    data: { node: data },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <ApolloProvider client={client}>
      <GlobalStateProvider>
        <MemoryRouter>{children}</MemoryRouter>
      </GlobalStateProvider>
    </ApolloProvider>
  );
  const useFlow = () =>
    useSpaceApplyFlow({
      spaceId: 'space',
      spaceProfileUrl: '/space',
      communityName: 'Child space',
      parentSpaceId: 'parent',
    });
  const { result } = renderHook(useFlow, { wrapper });
  const Harness = () => {
    const { buttonProps, dialogs } = useFlow();
    return (
      <>
        <button type="button" onClick={buttonProps.onAcceptInvitationClick}>
          accept
        </button>
        <button type="button" onClick={buttonProps.onApplyClick}>
          apply
        </button>
        {dialogs}
      </>
    );
  };
  const renderDialogs = () => render(<Harness />, { wrapper });
  return { sent, result, renderDialogs };
}

describe('useSpaceApplyFlow from the D2 Space document (021 F038/F039)', () => {
  test('a member: no join or apply, nothing sent', () => {
    const { sent, result } = renderFlow(node('MEMBER', ['read'], 'MEMBER', []));
    expect(result.current.isMember).toBe(true);
    expect(result.current.buttonProps).toMatchObject({ isMember: true, isParentMember: true, canJoinCommunity: false });
    expect(sent).toEqual([]);
  });

  test('a pending application and an invitation follow Membership.status', () => {
    expect(renderFlow(node('APPLIED', [], 'MEMBER', [])).result.current.buttonProps.isApplicationPending).toBe(true);
    expect(renderFlow(node('INVITED', [], 'MEMBER', [])).result.current.buttonProps.canAcceptInvitation).toBe(true);
  });

  test('can.join / can.apply and the parent pre-step from the parent and its D1 face', () => {
    const { result } = renderFlow(node('NONE', ['apply'], 'APPLIED', ['join']));
    expect(result.current.buttonProps).toMatchObject({
      isMember: false,
      canJoinCommunity: false,
      canApplyToCommunity: true,
      canJoinParentCommunity: true,
      isParentApplicationPending: true,
    });
  });

  test('an INBOUND INVITED request opens its detail: welcome message and inviter from D2, no request', () => {
    const request = {
      __typename: 'MembershipRequest',
      id: 'request-1',
      state: 'INVITED',
      direction: 'INBOUND',
      message: 'Join us!',
      createdAt: '2026-11-20T10:00:00Z',
      createdBy: {
        __typename: 'User',
        id: 'inviter',
        actorType: 'user',
        url: '/user/inviter',
        about: { __typename: 'About', displayName: 'Inviter Name', avatar: null },
      },
    };
    const membership = { __typename: 'Membership', roles: [], status: 'INVITED', request };
    const { sent, result, renderDialogs } = renderFlow(node('INVITED', [], 'MEMBER', [], { membership }));
    expect(result.current.buttonProps.canAcceptInvitation).toBe(true);
    expect(result.current.buttonProps.userInvitation).toMatchObject({
      id: 'request-1',
      invitation: { welcomeMessage: 'Join us!', createdDate: '2026-11-20T10:00:00Z', state: 'invited' },
    });
    renderDialogs();
    fireEvent.click(screen.getByRole('button', { name: 'accept' }));
    expect(screen.getByText('Join us!')).toBeInTheDocument();
    expect(screen.getAllByText('Inviter Name').length).toBeGreaterThan(0);
    expect(sent).toEqual([]);
  });

  test('the apply dialog renders Space.applicationForm: description and questions', () => {
    const applicationForm = {
      description: 'Tell us about you',
      questions: [{ question: 'Why join?', explanation: '', required: true, max_length: 500, sort_order: 1 }],
    };
    const { sent, renderDialogs } = renderFlow(node('NONE', ['apply'], 'MEMBER', [], { applicationForm }));
    renderDialogs();
    fireEvent.click(screen.getByRole('button', { name: 'apply' }));
    expect(screen.getByText('Tell us about you')).toBeInTheDocument();
    expect(screen.getByText('Why join?')).toBeInTheDocument();
    expect(sent).toEqual([]);
  });
});
