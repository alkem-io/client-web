import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { act, render, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { RoleSetInvitationResultNotice, RoleSetInvitationResultType } from '@/core/apollo/generated/graphql-schema';
import { useSpaceCommunityVirtualContributorPickerQuery } from '@/core/apollo/generated-v2/apollo-hooks';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import type { ContributorSelectorInvitee } from '@/crd/forms/ContributorSelector';
import type InvitationResultModel from '@/domain/access/model/InvitationResultModel';
import type { SpaceCommunityInviteOutcome } from '@/domain/spaceAdmin/SpaceAdminCommunity/native/spaceCommunityNative';
import { InviteMembersDialogConnector, mapInvitationResults, mapInviteOutcomes } from './InviteMembersDialogConnector';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { t: (key: string) => key } }),
}));

const notify = vi.fn();
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notify }));

vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: { id: 'viewer-1' } }),
}));

vi.mock('@/domain/platform/config/useConfig', () => ({ useConfig: () => ({ language: { eligible: [] } }) }));

vi.mock('@/main/routing/urlResolver/useUrlResolver', () => ({
  default: () => ({ spaceId: 'space-url', parentSpaceId: undefined }),
}));

// Stub the presentational dialog — these tests exercise the connector's data wiring through
// the props it hands the CRD component.
type DialogProps = Record<string, unknown> & {
  searchResults: Array<{ userId: string; displayName: string; avatarUrl?: string; location?: string }>;
  results?: Array<{ outcome: string; notice?: string }>;
  vcAccountItems: Array<{ id: string; avatarUrl?: string }>;
  vcLibraryItems: Array<{ id: string; avatarUrl?: string }>;
  spaceName: string;
  onSearchChange: (value: string) => void;
  onSelectUser: (id: string) => void;
  onAddEmails: (text: string) => void;
  onExtraRolesChange: (roles: string[]) => void;
  onSuggestedLanguageChange: (code: string | undefined) => void;
  onSend: () => void;
  onAddAccountVc: (id: string) => Promise<void>;
  onInviteLibraryVc: (id: string, message: string) => Promise<void>;
};
const inviteMembersDialogMock = vi.fn((_props: DialogProps) => null);
vi.mock('@/crd/components/community/InviteMembersDialog', () => ({
  InviteMembersDialog: (props: DialogProps) => inviteMembersDialogMock(props),
}));
const latestProps = () => {
  const calls = inviteMembersDialogMock.mock.calls;
  return calls[calls.length - 1][0];
};

type Request = { operationName: string; variables: Record<string, unknown> };
/** A reply the server refuses (an `errors` result), as the Pi server answered the VC picker for a root space's admin. */
const FORBIDDEN = Symbol('forbidden');

const about = (displayName: string, extra: Record<string, unknown> = {}) => ({
  __typename: 'About',
  displayName,
  description: null,
  location: null,
  avatar: { __typename: 'FileRef', file: { __typename: 'File', url: `/avatar/${displayName}` } },
  ...extra,
});
const candidates = (nodes: Array<Record<string, unknown>>, endCursor: string | null = null) => ({
  candidates: {
    __typename: 'ActorConnection',
    edges: nodes.map(node => ({ __typename: 'ActorEdge', node })),
    pageInfo: { __typename: 'PageInfo', hasNextPage: endCursor !== null, endCursor },
  },
});
const userNode = (id: string, location?: Record<string, string>) => ({
  __typename: 'User',
  id,
  actorType: 'user',
  url: `/user/${id}`,
  about: about(id, location ? { location } : {}),
});
const orgNode = (id: string) => ({
  __typename: 'Organization',
  id,
  actorType: 'organization',
  url: null,
  about: about(id),
});
const vcNode = (id: string) => ({
  __typename: 'Agent',
  id,
  actorType: 'virtual_contributor',
  url: `/vc/${id}`,
  keywords: ['ai', 'helper'],
  about: about(id, { description: `About ${id}` }),
});
const inviteTarget = {
  node: {
    __typename: 'Space',
    id: 'space-1',
    entityType: 'space',
    about: { __typename: 'About', displayName: 'My Space' },
  },
};

function setup(respond: (request: Request) => Record<string, unknown> | typeof FORBIDDEN | undefined) {
  const requests: Request[] = [];
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(
      operation =>
        new Observable(observer => {
          const request = { operationName: operation.operationName, variables: operation.variables };
          requests.push(request);
          const reply = respond(request);
          const timer = setTimeout(() => {
            if (!reply) observer.error(new Error(`Unexpected ${operation.operationName}`));
            else if (reply === FORBIDDEN) {
              observer.next({ errors: [{ message: 'forbidden', extensions: { code: 'FORBIDDEN' } }] });
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
  const named = (name: string) => requests.filter(r => r.operationName === name).map(r => r.variables);
  return { wrapper, requests, named };
}

beforeEach(() => {
  inviteMembersDialogMock.mockClear();
  notify.mockClear();
});
/**
 * Pure-function coverage for the result-correlation logic (T007). The server
 * returns one RoleSetInvitationResult per submitted invitee, in input order;
 * successful/failed-with-invitation results are matched by actor id, and
 * results that create nothing (opt-out, Lead limit, already member, ...) fall
 * back to the next id-less result in submission order.
 */
describe('mapInvitationResults', () => {
  test('organization invitee correlates by invitation.actor.id → sent', () => {
    const invitees: ContributorSelectorInvitee[] = [{ kind: 'organization', id: 'org-1', displayName: 'Acme' }];
    const legacyResults: InvitationResultModel[] = [
      { type: RoleSetInvitationResultType.InvitedToRoleSet, invitation: { id: 'inv-1', actor: { id: 'org-1' } } },
    ];
    const results = mapInvitationResults(invitees, legacyResults);
    expect(results).toEqual([{ invitee: invitees[0], outcome: 'sent' }]);
  });

  test('a sent result carrying the zero-admin notice surfaces notice: "noAdministrators"', () => {
    const invitees: ContributorSelectorInvitee[] = [{ kind: 'organization', id: 'org-1', displayName: 'Acme' }];
    const legacyResults: InvitationResultModel[] = [
      {
        type: RoleSetInvitationResultType.InvitedToRoleSet,
        notice: RoleSetInvitationResultNotice.OrganizationHasNoAdministrators,
        invitation: { id: 'inv-1', actor: { id: 'org-1' } },
      },
    ];
    const results = mapInvitationResults(invitees, legacyResults);
    expect(results).toEqual([{ invitee: invitees[0], outcome: 'sent', notice: 'noAdministrators' }]);
  });

  test('ORGANIZATION_NOT_ACCEPTING_INVITATIONS → notAcceptingInvitations (id-less result, submission-order fallback)', () => {
    const invitees: ContributorSelectorInvitee[] = [{ kind: 'organization', id: 'org-1', displayName: 'Acme' }];
    const legacyResults: InvitationResultModel[] = [
      { type: RoleSetInvitationResultType.OrganizationNotAcceptingInvitations },
    ];
    const results = mapInvitationResults(invitees, legacyResults);
    expect(results).toEqual([{ invitee: invitees[0], outcome: 'notAcceptingInvitations' }]);
  });

  test('ORGANIZATION_LEAD_ROLE_LIMIT_REACHED → leadLimitReached', () => {
    const invitees: ContributorSelectorInvitee[] = [{ kind: 'organization', id: 'org-1', displayName: 'Acme' }];
    const legacyResults: InvitationResultModel[] = [
      { type: RoleSetInvitationResultType.OrganizationLeadRoleLimitReached },
    ];
    const results = mapInvitationResults(invitees, legacyResults);
    expect(results).toEqual([{ invitee: invitees[0], outcome: 'leadLimitReached' }]);
  });

  test('an email that is an existing user keeps its own outcome and does not steal an id-less result', () => {
    // The server invites an email belonging to an existing user through the
    // ACTOR path, so its result carries `invitation`, never
    // `platformInvitation`, and it is returned in the actor group — ahead of
    // the email group the chip was submitted in. Matching on
    // invitedEmail/invitedActorID keeps each invitee's outcome its own; the
    // old positional fallback handed the email chip Acme's opt-out failure
    // and left Acme with outcome 'error'.
    const invitees: ContributorSelectorInvitee[] = [
      { kind: 'email', email: 'bob@existing.com' },
      { kind: 'organization', id: 'org-1', displayName: 'Acme' },
    ];
    const legacyResults: InvitationResultModel[] = [
      {
        type: RoleSetInvitationResultType.InvitedToRoleSet,
        invitedActorID: 'user-existing',
        invitedEmail: 'bob@existing.com',
        invitation: { id: 'inv-1', actor: { id: 'user-existing' } },
      },
      {
        type: RoleSetInvitationResultType.OrganizationNotAcceptingInvitations,
        invitedActorID: 'org-1',
      },
    ];

    const results = mapInvitationResults(invitees, legacyResults);

    expect(results).toEqual([
      { invitee: invitees[0], outcome: 'sent' },
      { invitee: invitees[1], outcome: 'notAcceptingInvitations' },
    ]);
  });

  test('a batch of organizations: matched-by-id results are consumed before id-less results are assigned in order', () => {
    const invitees: ContributorSelectorInvitee[] = [
      { kind: 'organization', id: 'org-1', displayName: 'Acme' },
      { kind: 'organization', id: 'org-2', displayName: 'Beta' },
      { kind: 'organization', id: 'org-3', displayName: 'Gamma' },
    ];
    // Server order need not match submission order; org-2 is a genuine success,
    // the other two invitees hit id-less no-op outcomes, consumed in order.
    const legacyResults: InvitationResultModel[] = [
      { type: RoleSetInvitationResultType.OrganizationNotAcceptingInvitations },
      { type: RoleSetInvitationResultType.InvitedToRoleSet, invitation: { id: 'inv-2', actor: { id: 'org-2' } } },
      { type: RoleSetInvitationResultType.OrganizationLeadRoleLimitReached },
    ];
    const results = mapInvitationResults(invitees, legacyResults);
    expect(results).toEqual([
      { invitee: invitees[0], outcome: 'notAcceptingInvitations' },
      { invitee: invitees[1], outcome: 'sent' },
      { invitee: invitees[2], outcome: 'leadLimitReached' },
    ]);
  });

  test('an unmatched invitee with no result left falls back to error', () => {
    const invitees: ContributorSelectorInvitee[] = [{ kind: 'organization', id: 'org-1', displayName: 'Acme' }];
    const results = mapInvitationResults(invitees, []);
    expect(results).toEqual([{ invitee: invitees[0], outcome: 'error' }]);
  });

  test('an interleaved batch keeps every outcome on its own chip and never lends a typed failure to an unmatched chip', () => {
    const invitees: ContributorSelectorInvitee[] = [
      { kind: 'email', email: 'new@example.com' },
      { kind: 'user', userId: 'user-p', displayName: 'Pat' },
      { kind: 'email', email: 'registered@example.com' },
      { kind: 'email', email: 'pat@example.com' },
      { kind: 'user', userId: 'user-q', displayName: 'Quinn' },
    ];
    const legacyResults: InvitationResultModel[] = [
      {
        type: RoleSetInvitationResultType.ExtraRoleLimitReached,
        invitedActorID: 'user-q',
      },
      {
        type: RoleSetInvitationResultType.InvitedToRoleSet,
        invitedActorID: 'user-p',
        invitedEmail: 'pat@example.com',
        invitation: { id: 'inv-p', actor: { id: 'user-p' } },
      },
      {
        // The server echoes one result per typed chip: Pat's address typed again gets its own result,
        // sharing the invitation created for the picked user.
        type: RoleSetInvitationResultType.InvitedToRoleSet,
        invitedActorID: 'user-p',
        invitedEmail: 'pat@example.com',
        invitation: { id: 'inv-p', actor: { id: 'user-p' } },
      },
      {
        type: RoleSetInvitationResultType.InvitedToRoleSet,
        invitedActorID: 'user-r',
        invitedEmail: 'registered@example.com',
        invitation: { id: 'inv-r', actor: { id: 'user-r' } },
      },
      {
        type: RoleSetInvitationResultType.InvitedToPlatformAndRoleSet,
        invitedEmail: 'new@example.com',
        platformInvitation: { id: 'pi-1', email: 'new@example.com' },
      },
    ];

    const results = mapInvitationResults(invitees, legacyResults);

    expect(results.map(r => r.outcome)).toEqual([
      'sent',
      'sent',
      'sent',
      // Pat's address typed again: it has its own echoed result, so the typed chip reports sent too.
      'sent',
      'extraRoleLimitReached',
    ]);
  });

  test('identity-less legacy results are still consumed positionally', () => {
    const invitees: ContributorSelectorInvitee[] = [
      { kind: 'organization', id: 'org-1', displayName: 'Acme' },
      { kind: 'organization', id: 'org-2', displayName: 'Beta' },
    ];
    const legacyResults: InvitationResultModel[] = [
      { type: RoleSetInvitationResultType.OrganizationNotAcceptingInvitations },
      { type: RoleSetInvitationResultType.OrganizationLeadRoleLimitReached },
    ];
    expect(mapInvitationResults(invitees, legacyResults).map(r => r.outcome)).toEqual([
      'notAcceptingInvitations',
      'leadLimitReached',
    ]);
  });

  test('user and email invitees keep their existing correlation and outcomes', () => {
    const invitees: ContributorSelectorInvitee[] = [
      { kind: 'user', userId: 'u1', displayName: 'Alice' },
      { kind: 'email', email: 'bob@example.com' },
    ];
    const legacyResults: InvitationResultModel[] = [
      {
        type: RoleSetInvitationResultType.InvitedToPlatformAndRoleSet,
        platformInvitation: { id: 'pi-1', email: 'bob@example.com' },
      },
      { type: RoleSetInvitationResultType.InvitedToRoleSet, invitation: { id: 'inv-1', actor: { id: 'u1' } } },
    ];
    const results = mapInvitationResults(invitees, legacyResults);
    expect(results).toEqual([
      { invitee: invitees[0], outcome: 'sent' },
      { invitee: invitees[1], outcome: 'sent' },
    ]);
  });
});

/** The native `invite` outcomes (invite-send, community-roles-screens.tsv:174) onto the result rows. */
describe('mapInviteOutcomes', () => {
  const outcome = (
    fields: Partial<SpaceCommunityInviteOutcome> & Pick<SpaceCommunityInviteOutcome, 'outcome'>
  ): SpaceCommunityInviteOutcome => ({
    actor: null,
    email: null,
    noOrganizationAdmin: false,
    request: null,
    ...fields,
  });

  test('maps every InviteOutcomeKind onto the dialog vocabulary', () => {
    const kinds = [
      ['SENT', 'sent'],
      ['ALREADY_INVITED', 'alreadyInvited'],
      ['ALREADY_MEMBER', 'alreadyMember'],
      ['OPEN_APPLICATION', 'alreadyHasApplication'],
      ['PARENT_NOT_AUTHORIZED', 'parentNotAuthorized'],
      ['ORGANIZATION_NOT_ACCEPTING_INVITATIONS', 'notAcceptingInvitations'],
      ['ORGANIZATION_LEAD_ROLE_LIMIT_REACHED', 'leadLimitReached'],
      ['EXTRA_ROLE_LIMIT_REACHED', 'extraRoleLimitReached'],
      ['NOT_ALLOWED', 'error'],
      ['ROLE_LIMIT_REACHED', 'error'],
    ] as const;
    const invitees: ContributorSelectorInvitee[] = kinds.map(([kind]) => ({
      kind: 'organization',
      id: `org-${kind}`,
      displayName: kind,
    }));
    const outcomes = kinds.map(([kind]) => outcome({ actor: `org-${kind}`, outcome: kind }));

    expect(mapInviteOutcomes(invitees, outcomes).map(r => r.outcome)).toEqual(kinds.map(([, row]) => row));
  });

  test('correlates by actor id and by email regardless of server order; noOrganizationAdmin is the notice', () => {
    const invitees: ContributorSelectorInvitee[] = [
      { kind: 'email', email: 'Bob@Example.com' },
      { kind: 'user', userId: 'u-1', displayName: 'Alice' },
      { kind: 'organization', id: 'org-1', displayName: 'Acme' },
    ];
    const outcomes = [
      outcome({ actor: 'org-1', outcome: 'SENT', noOrganizationAdmin: true }),
      outcome({ actor: 'u-1', outcome: 'ALREADY_MEMBER' }),
      outcome({ email: 'bob@example.com', outcome: 'SENT' }),
    ];

    expect(mapInviteOutcomes(invitees, outcomes)).toEqual([
      { invitee: invitees[0], outcome: 'sent' },
      { invitee: invitees[1], outcome: 'alreadyMember' },
      { invitee: invitees[2], outcome: 'sent', notice: 'noAdministrators' },
    ]);
  });

  test('a chip no outcome names reports an error and never borrows another outcome', () => {
    const invitees: ContributorSelectorInvitee[] = [
      { kind: 'user', userId: 'u-1', displayName: 'Alice' },
      { kind: 'email', email: 'new@example.com' },
    ];
    const outcomes = [outcome({ actor: 'u-other', outcome: 'SENT' })];

    expect(mapInviteOutcomes(invitees, outcomes).map(r => r.outcome)).toEqual(['error', 'error']);
  });
});

describe('InviteMembersDialogConnector — organization invite', () => {
  test('lists INVITE organization candidates on open and reads the space name natively', async () => {
    const fixture = setup(({ operationName }) =>
      operationName === 'SpaceCommunityInviteTarget'
        ? inviteTarget
        : operationName === 'SpaceCommunityCandidates'
          ? candidates([orgNode('org-1')])
          : undefined
    );

    render(<InviteMembersDialogConnector open={true} kind="organization" spaceId="space-1" onClose={vi.fn()} />, {
      wrapper: fixture.wrapper,
    });

    await waitFor(() => expect(latestProps().searchResults).toEqual([{ userId: 'org-1', displayName: 'org-1' }]));
    expect(latestProps().spaceName).toBe('My Space');
    expect(fixture.named('SpaceCommunityInviteTarget')).toEqual([{ space: 'space-1' }]);
    expect(fixture.named('SpaceCommunityCandidates')).toEqual([
      { space: 'space-1', role: 'member', entry: 'INVITE', actorType: 'organization', first: 20 },
    ]);
  });
});

describe('InviteMembersDialogConnector — user invite', () => {
  test('searches INVITE user candidates, then sends one invite and maps its outcomes onto the rows', async () => {
    const fixture = setup(({ operationName }) => {
      if (operationName === 'SpaceCommunityInviteTarget') return inviteTarget;
      if (operationName === 'SpaceCommunityCandidates')
        return candidates([userNode('viewer-1'), userNode('u-1', { city: 'Delft', country: 'NL' })]);
      if (operationName === 'InviteToSpaceCommunity')
        return {
          invite: [
            {
              __typename: 'InviteOutcome',
              actor: 'u-1',
              email: null,
              outcome: 'SENT',
              noOrganizationAdmin: false,
              request: { __typename: 'MembershipRequest', id: 'req-1' },
            },
            {
              __typename: 'InviteOutcome',
              actor: null,
              email: 'bob@example.com',
              outcome: 'ALREADY_INVITED',
              noOrganizationAdmin: false,
              request: null,
            },
          ],
        };
      return undefined;
    });

    render(<InviteMembersDialogConnector open={true} spaceId="space-1" onClose={vi.fn()} />, {
      wrapper: fixture.wrapper,
    });
    await waitFor(() => expect(latestProps().spaceName).toBe('My Space'));
    // Users are only searched once something is typed.
    expect(fixture.named('SpaceCommunityCandidates')).toEqual([]);

    act(() => latestProps().onSearchChange(' ali '));
    // The viewer is never offered to themselves.
    await waitFor(() =>
      expect(latestProps().searchResults).toEqual([
        { userId: 'u-1', displayName: 'u-1', avatarUrl: '/avatar/u-1', location: 'Delft, NL' },
      ])
    );
    expect(fixture.named('SpaceCommunityCandidates')).toEqual([
      { space: 'space-1', role: 'member', entry: 'INVITE', actorType: 'user', terms: 'ali', first: 20 },
    ]);

    act(() => latestProps().onSelectUser('u-1'));
    act(() => latestProps().onAddEmails('bob@example.com'));
    act(() => latestProps().onExtraRolesChange(['Member', 'Lead']));
    act(() => latestProps().onSuggestedLanguageChange('nl'));
    act(() => latestProps().onSend());

    await waitFor(() => expect(latestProps().results).toBeDefined());
    expect(fixture.named('InviteToSpaceCommunity')).toEqual([
      {
        space: 'space-1',
        input: {
          actors: ['u-1'],
          emails: ['bob@example.com'],
          message: 'inviteMembers.dialog.defaultWelcomeMessage',
          roles: ['member', 'lead'],
          language: 'nl',
        },
      },
    ]);
    expect(latestProps().results?.map(r => r.outcome)).toEqual(['sent', 'alreadyInvited']);
  });
});

describe('InviteMembersDialogConnector — virtual contributors', () => {
  const vcFixture = () =>
    setup(({ operationName, variables }) => {
      if (operationName === 'SpaceCommunityInviteTarget') return inviteTarget;
      if (operationName === 'SpaceCommunityCandidates')
        return candidates([vcNode(variables.entry === 'DIRECT' ? 'vc-account' : 'vc-library')]);
      if (operationName === 'SetSpaceCommunityRoles')
        return {
          setRoles: {
            __typename: 'MembershipResult',
            node: { __typename: 'Space', id: 'space-1' },
          },
        };
      if (operationName === 'InviteToSpaceCommunity')
        return {
          invite: [
            {
              __typename: 'InviteOutcome',
              actor: 'vc-library',
              email: null,
              outcome: 'SENT',
              noOrganizationAdmin: false,
              request: { __typename: 'MembershipRequest', id: 'req-vc' },
            },
          ],
        };
      return undefined;
    });

  test('account VCs are DIRECT candidates and library VCs INVITE candidates, avatars passed through', async () => {
    const fixture = vcFixture();
    render(<InviteMembersDialogConnector open={true} kind="virtualContributor" spaceId="space-1" onClose={vi.fn()} />, {
      wrapper: fixture.wrapper,
    });

    await waitFor(() => expect(latestProps().vcLibraryItems).toHaveLength(1));
    const vcVariables = { space: 'space-1', role: 'member', actorType: 'virtual_contributor', first: 100 };
    expect(fixture.named('SpaceCommunityCandidates')).toEqual(
      expect.arrayContaining([
        { ...vcVariables, entry: 'DIRECT' },
        { ...vcVariables, entry: 'INVITE' },
      ])
    );
    expect(fixture.named('SpaceCommunityCandidates')).toHaveLength(2);
    expect(latestProps().vcAccountItems).toEqual([
      { id: 'vc-account', displayName: 'vc-account', avatarUrl: '/avatar/vc-account' },
    ]);
    expect(latestProps().vcLibraryItems).toEqual([
      { id: 'vc-library', displayName: 'vc-library', avatarUrl: '/avatar/vc-library' },
    ]);
  });

  test('libraryOnly reads only the INVITE list', async () => {
    const fixture = vcFixture();
    render(
      <InviteMembersDialogConnector
        open={true}
        kind="virtualContributor"
        spaceId="space-1"
        libraryOnly={true}
        onClose={vi.fn()}
      />,
      { wrapper: fixture.wrapper }
    );

    await waitFor(() => expect(latestProps().vcLibraryItems).toHaveLength(1));
    expect(fixture.named('SpaceCommunityCandidates').map(v => v.entry)).toEqual(['INVITE']);
  });

  test('adding an account VC is setRoles with exactly the member role', async () => {
    const fixture = vcFixture();
    const onClose = vi.fn();
    render(<InviteMembersDialogConnector open={true} kind="virtualContributor" spaceId="space-1" onClose={onClose} />, {
      wrapper: fixture.wrapper,
    });
    await waitFor(() => expect(latestProps().vcAccountItems).toHaveLength(1));

    await act(() => latestProps().onAddAccountVc('vc-account'));

    expect(fixture.named('SetSpaceCommunityRoles')).toEqual([
      { space: 'space-1', actor: 'vc-account', roles: ['member'] },
    ]);
    expect(notify).toHaveBeenCalledWith('inviteMembers.dialog.virtualContributor.addedNotice', 'success');
    expect(onClose).toHaveBeenCalled();
  });

  test('inviting a library VC is one invite with the VC and the welcome message', async () => {
    const fixture = vcFixture();
    render(<InviteMembersDialogConnector open={true} kind="virtualContributor" spaceId="space-1" onClose={vi.fn()} />, {
      wrapper: fixture.wrapper,
    });
    await waitFor(() => expect(latestProps().vcLibraryItems).toHaveLength(1));

    await act(() => latestProps().onInviteLibraryVc('vc-library', 'Welcome!'));

    expect(fixture.named('InviteToSpaceCommunity')).toEqual([
      { space: 'space-1', input: { actors: ['vc-library'], message: 'Welcome!' } },
    ]);
    expect(notify).toHaveBeenCalledWith('inviteMembers.dialog.virtualContributor.invitedNotice', 'success');
  });
});

/** The Community tab's mounted VC picker: a mutation's refetch list re-reads it. */
const PickerWatcher = () => {
  useSpaceCommunityVirtualContributorPickerQuery({ variables: { space: 'space-1' } });
  return null;
};

/**
 * A write the server committed resolves on its own result: a refetched query the caller may not read (the VC picker
 * refused FORBIDDEN) keeps its error to itself and never rejects the mutation, as legacy's role-set writes did
 * (useRoleSetManagerRolesAssignment evicted the role set and awaited no re-read).
 */
describe('InviteMembersDialogConnector — a refused refetch never rejects a committed write', () => {
  const refusedPicker = () =>
    setup(({ operationName, variables }) => {
      if (operationName === 'SpaceCommunityVirtualContributorPicker') return FORBIDDEN;
      if (operationName === 'SpaceCommunityInviteTarget') return inviteTarget;
      if (operationName === 'SpaceCommunityCandidates')
        return candidates([variables.actorType === 'user' ? userNode('u-1') : vcNode('vc-account')]);
      if (operationName === 'SpaceCommunityMembers' || operationName === 'SpaceCommunityAdmin') return undefined;
      if (operationName === 'SetSpaceCommunityRoles')
        return {
          setRoles: {
            __typename: 'MembershipResult',
            node: { __typename: 'Space', id: 'space-1' },
          },
        };
      if (operationName === 'InviteToSpaceCommunity')
        return {
          invite: [
            {
              __typename: 'InviteOutcome',
              actor: 'u-1',
              email: null,
              outcome: 'SENT',
              noOrganizationAdmin: false,
              request: { __typename: 'MembershipRequest', id: 'req-1' },
            },
          ],
        };
      return undefined;
    });

  test('setRoles: the account VC is added and the dialog closes', async () => {
    const fixture = refusedPicker();
    const onClose = vi.fn();
    render(
      <>
        <InviteMembersDialogConnector open={true} kind="virtualContributor" spaceId="space-1" onClose={onClose} />
        <PickerWatcher />
      </>,
      { wrapper: fixture.wrapper }
    );
    await waitFor(() => expect(latestProps().vcAccountItems).toHaveLength(1));
    await waitFor(() => expect(fixture.named('SpaceCommunityVirtualContributorPicker')).toHaveLength(1));

    await act(() => latestProps().onAddAccountVc('vc-account'));

    await waitFor(() => expect(fixture.named('SpaceCommunityVirtualContributorPicker')).toHaveLength(2));
    expect(notify).toHaveBeenCalledWith('inviteMembers.dialog.virtualContributor.addedNotice', 'success');
    expect(onClose).toHaveBeenCalled();
  });

  test('invite: the SENT outcome reaches the result screen', async () => {
    const fixture = refusedPicker();
    render(
      <>
        <InviteMembersDialogConnector open={true} spaceId="space-1" onClose={vi.fn()} />
        <PickerWatcher />
      </>,
      { wrapper: fixture.wrapper }
    );
    await waitFor(() => expect(latestProps().spaceName).toBe('My Space'));
    await waitFor(() => expect(fixture.named('SpaceCommunityVirtualContributorPicker')).toHaveLength(1));
    act(() => latestProps().onSearchChange('u'));
    await waitFor(() => expect(latestProps().searchResults).toHaveLength(1));
    act(() => latestProps().onSelectUser('u-1'));

    act(() => latestProps().onSend());

    await waitFor(() => expect(latestProps().results?.map(r => r.outcome)).toEqual(['sent']));
    await waitFor(() => expect(fixture.named('SpaceCommunityVirtualContributorPicker')).toHaveLength(2));
  });
});
