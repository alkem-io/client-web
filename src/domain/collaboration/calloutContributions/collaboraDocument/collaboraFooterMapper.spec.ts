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

  describe('disconnect mapping', () => {
    it('is not disconnected and has no cause while connected', () => {
      const r = mapCollaboraFooterProps(baseParams);
      expect(r.disconnected).toBe(false);
      expect(r.disconnectCause).toBeNull();
      expect(r.changesAtRisk).toBe(false);
    });

    it('flags disconnected + changesAtRisk for an edit-capable session with unsaved work', () => {
      const r = mapCollaboraFooterProps({
        ...baseParams,
        connectionStatus: 'disconnected',
        saveStatus: 'unsaved',
        disconnectCause: 'network',
      });
      expect(r.disconnected).toBe(true);
      expect(r.disconnectCause).toBe('network');
      expect(r.changesAtRisk).toBe(true);
    });

    it('does not warn of at-risk changes for a read-only viewer (FR-012)', () => {
      const r = mapCollaboraFooterProps({
        ...baseParams,
        hasEditPrivilege: false,
        connectionStatus: 'disconnected',
        saveStatus: 'unsaved',
        disconnectCause: 'service',
      });
      expect(r.disconnected).toBe(true);
      expect(r.changesAtRisk).toBe(false);
    });

    it('does not warn of at-risk changes for a guest, and falls back to an unknown cause', () => {
      const r = mapCollaboraFooterProps({
        ...baseParams,
        isAuthenticated: false,
        connectionStatus: 'disconnected',
        saveStatus: 'unsaved',
      });
      expect(r.changesAtRisk).toBe(false);
      expect(r.disconnectCause).toBe('unknown');
    });

    it('does not warn of at-risk changes when the document was cleanly saved at the drop', () => {
      const r = mapCollaboraFooterProps({
        ...baseParams,
        connectionStatus: 'disconnected',
        saveStatus: 'saved',
        disconnectCause: 'tokenExpiry',
      });
      expect(r.disconnected).toBe(true);
      expect(r.changesAtRisk).toBe(false);
    });

    it('treats the terminal state as disconnected', () => {
      const r = mapCollaboraFooterProps({ ...baseParams, connectionStatus: 'terminal', disconnectCause: 'service' });
      expect(r.disconnected).toBe(true);
    });

    it('suppresses the readonly reason once disconnected (the banner owns the messaging)', () => {
      const r = mapCollaboraFooterProps({ ...baseParams, hasEditPrivilege: false, connectionStatus: 'disconnected' });
      expect(r.readonlyReason).toBeNull();
    });

    it('maps a terminal status to a terminal, non-retryable state carrying its reason', () => {
      const r = mapCollaboraFooterProps({
        ...baseParams,
        connectionStatus: 'terminal',
        saveStatus: 'unsaved',
        terminalReason: 'notFound',
      });
      expect(r.terminal).toBe(true);
      expect(r.disconnected).toBe(true);
      expect(r.terminalReason).toBe('notFound');
      // No recovery is possible, so the "changes may not be saved" warning is not shown.
      expect(r.changesAtRisk).toBe(false);
    });

    it('carries the forbidden terminal reason', () => {
      const r = mapCollaboraFooterProps({ ...baseParams, connectionStatus: 'terminal', terminalReason: 'forbidden' });
      expect(r.terminalReason).toBe('forbidden');
    });

    it('is not terminal and has a null terminal reason for an ordinary disconnect', () => {
      const r = mapCollaboraFooterProps({
        ...baseParams,
        connectionStatus: 'disconnected',
        disconnectCause: 'network',
        terminalReason: 'notFound',
      });
      expect(r.terminal).toBe(false);
      expect(r.terminalReason).toBeNull();
    });
  });
});
