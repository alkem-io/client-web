import { describe, expect, it } from 'vitest';
import { CommunityMembershipStatus, ContentUpdatePolicy } from '@/core/apollo/generated/graphql-schema';
import { ReadOnlyCode } from '@/core/ui/forms/CollaborativeMarkdownInput/stateless-messaging/read.only.code';
import { mapMemoFooterProps } from '@/main/crdPages/memo/memoFooterMapper';

const base = {
  connectionStatus: 'connected' as const,
  synced: true,
  isAuthenticated: true,
  isReadOnly: true,
  memberCount: 2,
  connectedUsers: [],
  isContribution: false,
  hasDeletePrivileges: false,
  contentUpdatePolicy: ContentUpdatePolicy.Admins,
  hasOwner: true,
  myMembershipStatus: CommunityMembershipStatus.Member,
};

describe('mapMemoFooterProps readonlyReason', () => {
  it('explains the single-editor licence instead of a missing permission', () => {
    const { readonlyReason } = mapMemoFooterProps({ ...base, readOnlyCode: ReadOnlyCode.MULTI_USER_NOT_ALLOWED });

    expect(readonlyReason).toBe('multiUserNotAllowed');
  });

  it('explains that the maximum number of editors is reached', () => {
    const { readonlyReason } = mapMemoFooterProps({ ...base, readOnlyCode: ReadOnlyCode.ROOM_CAPACITY_REACHED });

    expect(readonlyReason).toBe('roomCapacityReached');
  });

  it('keeps the permission message when the server reports no update access', () => {
    const { readonlyReason } = mapMemoFooterProps({ ...base, readOnlyCode: ReadOnlyCode.NO_UPDATE_ACCESS });

    expect(readonlyReason).toBe('contentUpdatePolicy');
  });

  it('shows no reason when the memo is editable', () => {
    const { readonlyReason } = mapMemoFooterProps({
      ...base,
      isReadOnly: false,
      readOnlyCode: ReadOnlyCode.MULTI_USER_NOT_ALLOWED,
    });

    expect(readonlyReason).toBeNull();
  });
});
