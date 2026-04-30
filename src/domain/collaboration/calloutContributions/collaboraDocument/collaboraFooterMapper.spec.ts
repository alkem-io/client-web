import { describe, expect, it } from 'vitest';
import { CommunityMembershipStatus, ContentUpdatePolicy } from '@/core/apollo/generated/graphql-schema';
import { mapCollaboraFooterProps } from './collaboraFooterMapper';

const baseParams = {
  connectionStatus: 'connected' as const,
  saveStatus: 'saved' as const,
  connectedUsers: [],
  isAuthenticated: true,
  hasEditPrivilege: true,
  isContribution: false,
  hasDeletePrivileges: false,
};

describe('mapCollaboraFooterProps', () => {
  it('returns null readonly reason when connected, authenticated, and allowed to edit', () => {
    expect(mapCollaboraFooterProps(baseParams).readonlyReason).toBeNull();
  });

  it('reports connecting while the iframe is still handshaking', () => {
    expect(mapCollaboraFooterProps({ ...baseParams, connectionStatus: 'connecting' }).readonlyReason).toBe(
      'connecting'
    );
  });

  it('reports unauthenticated for guests even when connected', () => {
    expect(mapCollaboraFooterProps({ ...baseParams, isAuthenticated: false }).readonlyReason).toBe('unauthenticated');
  });

  it('reports noMembership when content policy requires contributors and user is not a member', () => {
    const result = mapCollaboraFooterProps({
      ...baseParams,
      hasEditPrivilege: false,
      contentUpdatePolicy: ContentUpdatePolicy.Contributors,
      myMembershipStatus: CommunityMembershipStatus.NotMember,
    });
    expect(result.readonlyReason).toBe('noMembership');
  });

  it('falls back to contentUpdatePolicy when the user lacks edit privilege but is a member', () => {
    const result = mapCollaboraFooterProps({
      ...baseParams,
      hasEditPrivilege: false,
      contentUpdatePolicy: ContentUpdatePolicy.Owner,
      myMembershipStatus: CommunityMembershipStatus.Member,
    });
    expect(result.readonlyReason).toBe('contentUpdatePolicy');
  });

  it('only surfaces onDelete for contributions with delete privilege', () => {
    const onDelete = () => undefined;

    const framing = mapCollaboraFooterProps({ ...baseParams, onDelete });
    expect(framing.onDelete).toBeUndefined();

    const contribNoPriv = mapCollaboraFooterProps({ ...baseParams, isContribution: true, onDelete });
    expect(contribNoPriv.onDelete).toBeUndefined();

    const contribWithPriv = mapCollaboraFooterProps({
      ...baseParams,
      isContribution: true,
      hasDeletePrivileges: true,
      onDelete,
    });
    expect(contribWithPriv.onDelete).toBe(onDelete);
  });

  it('derives memberCount from connectedUsers length and marks guest from auth state', () => {
    const result = mapCollaboraFooterProps({
      ...baseParams,
      isAuthenticated: false,
      connectedUsers: [
        { id: '1', name: 'Alice', color: '#aaa' },
        { id: '2', name: 'Bob', color: '#bbb' },
      ],
    });
    expect(result.memberCount).toBe(2);
    expect(result.isGuest).toBe(true);
  });
});
