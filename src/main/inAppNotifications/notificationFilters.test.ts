import { describe, expect, it } from 'vitest';
import { NotificationEvent } from '@/core/apollo/generated/graphql-schema';
import {
  getCategoryFilterForNotificationType,
  getNotificationTypesForFilter,
  NotificationFilterType,
} from './notificationFilters';

describe('organization space-invitation events belong to the Space filter (061, T017)', () => {
  const orgEvents = [
    NotificationEvent.OrganizationAdminSpaceCommunityInvitation,
    NotificationEvent.SpaceAdminOrganizationCommunityInvitationAccepted,
    NotificationEvent.SpaceAdminOrganizationCommunityInvitationDeclined,
  ];

  it('are included in the Space filter type list', () => {
    const spaceTypes = getNotificationTypesForFilter(NotificationFilterType.Space);
    for (const event of orgEvents) {
      expect(spaceTypes).toContain(event);
    }
  });

  it('are included in the All filter type list', () => {
    const allTypes = getNotificationTypesForFilter(NotificationFilterType.All);
    for (const event of orgEvents) {
      expect(allTypes).toContain(event);
    }
  });

  it('resolve to the Space category, not Messages & Replies or Platform', () => {
    for (const event of orgEvents) {
      expect(getCategoryFilterForNotificationType(event)).toBe(NotificationFilterType.Space);
    }
  });

  it('are absent from the Messages & Replies and Platform filter lists', () => {
    const messagesTypes = getNotificationTypesForFilter(NotificationFilterType.MessagesAndReplies);
    const platformTypes = getNotificationTypesForFilter(NotificationFilterType.Platform);
    for (const event of orgEvents) {
      expect(messagesTypes).not.toContain(event);
      expect(platformTypes).not.toContain(event);
    }
  });
});

describe('organization-associate events belong to the Space filter (062)', () => {
  const associateEvents = [
    NotificationEvent.UserOrganizationAssociateInvitation,
    NotificationEvent.UserOrganizationAssociateApplicationApproved,
    NotificationEvent.UserOrganizationAssociateApplicationDeclined,
    NotificationEvent.OrganizationAdminAssociateInvitationAccepted,
    NotificationEvent.OrganizationAdminAssociateInvitationDeclined,
    NotificationEvent.OrganizationAdminAssociateApplication,
    NotificationEvent.OrganizationAdminAssociateJoined,
  ];

  it('are included in both the Space and All filter type lists', () => {
    const spaceTypes = getNotificationTypesForFilter(NotificationFilterType.Space);
    const allTypes = getNotificationTypesForFilter(NotificationFilterType.All);
    for (const event of associateEvents) {
      expect(spaceTypes).toContain(event);
      expect(allTypes).toContain(event);
    }
  });

  it('resolve to the Space category', () => {
    for (const event of associateEvents) {
      expect(getCategoryFilterForNotificationType(event)).toBe(NotificationFilterType.Space);
    }
  });
});

describe('the form-response admin event belongs to the Space filter', () => {
  const event = NotificationEvent.SpaceAdminCollaborationCalloutFormResponse;

  it('is listed under Space and All, and resolves to the Space category', () => {
    expect(getNotificationTypesForFilter(NotificationFilterType.Space)).toContain(event);
    expect(getNotificationTypesForFilter(NotificationFilterType.All)).toContain(event);
    expect(getCategoryFilterForNotificationType(event)).toBe(NotificationFilterType.Space);
  });

  it('is absent from the Messages & Replies and Platform filters', () => {
    expect(getNotificationTypesForFilter(NotificationFilterType.MessagesAndReplies)).not.toContain(event);
    expect(getNotificationTypesForFilter(NotificationFilterType.Platform)).not.toContain(event);
  });
});
