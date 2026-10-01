import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { RoleSetInvitationResultType } from '@/core/apollo/generated/graphql-schema';
import type { InvitationResult } from '@/crd/components/community/InviteMembersDialog';
import { OrgInviteAssociatesDialogConnector } from './OrgInviteAssociatesDialogConnector';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { t: (key: string) => key } }),
}));

vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));

vi.mock('@/domain/platform/config/useConfig', () => ({
  useConfig: () => ({ language: { eligible: ['en', 'nl'] } }),
}));

const runInviteMock = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useInviteForEntryRoleOnRoleSetMutation: () => [runInviteMock],
}));

vi.mock('@/domain/access/AvailableContributors/useRoleSetAvailableUsers', () => ({
  default: () => ({
    users: [{ id: 'user-p', profile: { displayName: 'Pat' } }],
    hasMore: false,
    loading: false,
    fetchMore: vi.fn(),
  }),
}));

type DialogProps = {
  onAddEmails: (raw: string) => void;
  onSelectUser: (id: string) => void;
  onSend: () => void;
  onSuggestedLanguageChange: (code: string | undefined) => void;
  allowEmailInvites: boolean;
  availableLanguages: { code: string; label: string }[];
  results: InvitationResult[] | undefined;
  labels: { searchHint: string; searchPlaceholder: string; searchAriaLabel: string };
};
let dialogProps!: DialogProps;
vi.mock('@/crd/components/community/InviteMembersDialog', () => ({
  InviteMembersDialog: (props: DialogProps) => {
    dialogProps = props;
    return null;
  },
}));

const renderConnector = () =>
  render(
    <OrgInviteAssociatesDialogConnector
      open={true}
      onClose={vi.fn()}
      roleSetId="rs-org"
      organizationName="Acme"
      existingAssociateIds={[]}
      onSent={vi.fn()}
    />
  );

describe('OrgInviteAssociatesDialogConnector', () => {
  beforeEach(() => {
    runInviteMock.mockReset();
  });

  test('enables email paste and the language control, with the generic (non-member) search copy', async () => {
    await act(async () => {
      renderConnector();
    });
    expect(dialogProps.allowEmailInvites).toBe(true);
    expect(dialogProps.availableLanguages.map(l => l.code)).toEqual(['en', 'nl']);
    expect(dialogProps.labels.searchHint).toBe('inviteMembers.dialog.searchHint');
    expect(dialogProps.labels.searchPlaceholder).toBe('inviteMembers.dialog.searchPlaceholder');
    expect(dialogProps.labels.searchAriaLabel).toBe('inviteMembers.dialog.searchAriaLabel');
  });

  test('sends picked users and typed addresses together and matches results by identity', async () => {
    runInviteMock.mockResolvedValue({
      data: {
        inviteForEntryRoleOnRoleSet: [
          {
            type: RoleSetInvitationResultType.InvitedToRoleSet,
            invitedActorID: 'user-r',
            invitedEmail: 'registered@example.com',
            invitation: { id: 'inv-r', actor: { id: 'user-r' } },
          },
          {
            type: RoleSetInvitationResultType.InvitedToRoleSet,
            invitedActorID: 'user-p',
            invitation: { id: 'inv-p', actor: { id: 'user-p' } },
          },
          {
            type: RoleSetInvitationResultType.InvitedToPlatformAndRoleSet,
            invitedEmail: 'new@example.com',
            platformInvitation: { id: 'pi-1', email: 'new@example.com' },
          },
        ],
      },
    });
    await act(async () => {
      renderConnector();
    });
    await act(async () => {
      dialogProps.onSelectUser('user-p');
    });
    await act(async () => {
      dialogProps.onAddEmails('new@example.com, registered@example.com');
    });
    await act(async () => {
      dialogProps.onSend();
    });

    expect(runInviteMock).toHaveBeenCalledTimes(1);
    const { variables } = runInviteMock.mock.calls[0][0];
    expect(variables.roleSetId).toBe('rs-org');
    expect(variables.invitedActorIds).toEqual(['user-p']);
    expect(variables.invitedUserEmails).toEqual(['new@example.com', 'registered@example.com']);
    expect(variables.suggestedLanguage).toBeUndefined();
    expect(dialogProps.results?.map(r => r.outcome)).toEqual(['sent', 'sent', 'sent']);
  });

  test('includes the suggested language only when one was chosen', async () => {
    runInviteMock.mockResolvedValue({ data: { inviteForEntryRoleOnRoleSet: [] } });
    await act(async () => {
      renderConnector();
    });
    await act(async () => {
      dialogProps.onAddEmails('new@example.com');
      dialogProps.onSuggestedLanguageChange('nl');
    });
    await act(async () => {
      dialogProps.onSend();
    });
    expect(runInviteMock.mock.calls[0][0].variables.suggestedLanguage).toBe('nl');
    expect(runInviteMock.mock.calls[0][0].variables.invitedUserEmails).toEqual(['new@example.com']);
  });

  test('never sends an invalid address', async () => {
    await act(async () => {
      renderConnector();
    });
    await act(async () => {
      dialogProps.onAddEmails('not-an-email');
    });
    await act(async () => {
      dialogProps.onSend();
    });
    expect(runInviteMock).not.toHaveBeenCalled();
  });

  test('flags addresses the server would reject as invalid and still sends the valid ones', async () => {
    runInviteMock.mockResolvedValue({ data: { inviteForEntryRoleOnRoleSet: [] } });
    await act(async () => {
      renderConnector();
    });
    await act(async () => {
      dialogProps.onAddEmails('new@example.com, a@b.c, jane..doe@example.com, jane@exa_mple.com');
    });
    await act(async () => {
      dialogProps.onSend();
    });
    expect(runInviteMock).toHaveBeenCalledTimes(1);
    expect(runInviteMock.mock.calls[0][0].variables.invitedUserEmails).toEqual(['new@example.com']);
  });
});
