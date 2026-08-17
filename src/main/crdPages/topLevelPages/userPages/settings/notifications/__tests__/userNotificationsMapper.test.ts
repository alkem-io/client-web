import { describe, expect, it } from 'vitest';
import type { NotificationSettings } from '@/domain/community/userAdmin/tabs/model/NotificationSettings.model';
import {
  type ContributorSettingsTranslator,
  mapUserNotifications,
  type NotificationPrivileges,
} from '../userNotificationsMapper';

// Identity translator — mirrors the pattern used across the settings test suite
// (e.g. CrdUserSettingsTab.test.tsx): asserting on keys is enough here, the
// literal copy is exercised by the i18n key-parity check, not by unit tests.
const t = ((key: string) => key) as ContributorSettingsTranslator;

const noPrivileges: NotificationPrivileges = {
  isPlatformAdmin: false,
  isOrganizationAdmin: false,
  isSpaceAdmin: false,
  isSpaceLead: false,
};

// Per data-model.md §1 the migration backfill seeds both rows with these
// channel defaults (email off, push on, inApp always off).
const backfilledDefaults = { email: false, inApp: false, push: true };

const serverWithMessagingRows: NotificationSettings = {
  user: {
    conversationMessageDirect: backfilledDefaults,
    conversationMessageGroup: backfilledDefaults,
  },
};

const findUserGroup = (server: NotificationSettings) => {
  const { groups } = mapUserNotifications(server, new Map(), noPrivileges, t);
  const userGroup = groups.find(group => group.groupId === 'user');
  if (!userGroup) throw new Error('user group missing');
  return userGroup;
};

describe('mapUserNotifications — conversation-message rows (US3, contract C-5)', () => {
  it('binds the two rows under the exact field names conversationMessageDirect / conversationMessageGroup', () => {
    const userGroup = findUserGroup(serverWithMessagingRows);
    const properties = userGroup.rows.map(row => row.property);
    expect(properties).toContain('conversationMessageDirect');
    expect(properties).toContain('conversationMessageGroup');
  });

  it('resolves server-fed defaults: email off, push on, inApp off', () => {
    const userGroup = findUserGroup(serverWithMessagingRows);
    const direct = userGroup.rows.find(row => row.property === 'conversationMessageDirect');
    const group = userGroup.rows.find(row => row.property === 'conversationMessageGroup');

    expect(direct?.channels).toEqual({ email: false, inApp: false, push: true });
    expect(group?.channels).toEqual({ email: false, inApp: false, push: true });
  });

  it('defaults channels to false when the server has not yet backfilled the row', () => {
    const userGroup = findUserGroup({ user: {} });
    const direct = userGroup.rows.find(row => row.property === 'conversationMessageDirect');
    expect(direct?.channels).toEqual({ email: false, inApp: false, push: false });
  });

  it('marks the in-app cell locked (with a caption) for both messaging rows only', () => {
    const userGroup = findUserGroup(serverWithMessagingRows);
    const direct = userGroup.rows.find(row => row.property === 'conversationMessageDirect');
    const group = userGroup.rows.find(row => row.property === 'conversationMessageGroup');
    const commentReply = userGroup.rows.find(row => row.property === 'commentReply');

    expect(direct?.inAppLockedCaption).toBe('user.notifications.inAppLockedChat');
    expect(group?.inAppLockedCaption).toBe('user.notifications.inAppLockedChat');
    // Other rows in the same group are unaffected.
    expect(commentReply?.inAppLockedCaption).toBeUndefined();
  });

  it('applies optimistic overrides on top of the server value, same as any other row', () => {
    const overrides = new Map<string, boolean>([['user::conversationMessageDirect::push', false]]);
    const { groups } = mapUserNotifications(serverWithMessagingRows, overrides, noPrivileges, t);
    const userGroup = groups.find(g => g.groupId === 'user');
    const direct = userGroup?.rows.find(row => row.property === 'conversationMessageDirect');
    expect(direct?.channels.push).toBe(false);
  });
});
