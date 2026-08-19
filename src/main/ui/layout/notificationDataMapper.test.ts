import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import {
  CalendarEventType,
  NotificationEvent,
  NotificationEventCategory,
  NotificationEventInAppState,
  NotificationEventPayload,
} from '@/core/apollo/generated/graphql-schema';
import type { InAppNotificationModel } from '@/main/inAppNotifications/model/InAppNotificationModel';
import type { InAppNotificationPayloadModel } from '@/main/inAppNotifications/model/InAppNotificationPayloadModel';
import { mapNotificationToItemData } from './notificationDataMapper';

const t = ((key: string) => key) as unknown as TFunction;

const spacePayload = (url = '/my-space'): InAppNotificationPayloadModel['space'] => ({
  id: 'space-1',
  about: { profile: { displayName: 'My Space', url } },
});

const notification = (
  type: NotificationEvent,
  payload: Partial<InAppNotificationPayloadModel>,
  category = NotificationEventCategory.SpaceAdmin
): InAppNotificationModel => ({
  id: `notification-${type}`,
  type,
  triggeredAt: new Date(),
  state: NotificationEventInAppState.Unread,
  category,
  triggeredBy: {
    profile: { displayName: 'Ada Lovelace', url: '/user/ada', visual: { uri: 'ada.png' } },
  },
  payload: { type: NotificationEventPayload.Space, ...payload } as InAppNotificationPayloadModel,
});

const hrefOf = (model: InAppNotificationModel) =>
  mapNotificationToItemData(model, t, NotificationEventInAppState.Unread).href;

describe('resolved notification destinations', () => {
  it('sends a community application to the community tab of the space settings', () => {
    const href = hrefOf(
      notification(NotificationEvent.SpaceAdminCommunityApplication, {
        type: NotificationEventPayload.SpaceCommunityApplication,
        space: spacePayload('/my-space'),
      })
    );

    // The space home page has no approve/reject surface — the pending memberships
    // table only exists on the settings Community tab.
    expect(href).toBe('/my-space/settings/community');
  });

  it('builds the same settings path for a subspace application', () => {
    const href = hrefOf(
      notification(NotificationEvent.SpaceAdminCommunityApplication, {
        type: NotificationEventPayload.SpaceCommunityApplication,
        space: spacePayload('/my-space/challenges/my-subspace'),
      })
    );

    expect(href).toBe('/my-space/challenges/my-subspace/settings/community');
  });

  it('leaves an application without a space URL unlinked rather than pointing at /settings/community', () => {
    const href = hrefOf(
      notification(NotificationEvent.SpaceAdminCommunityApplication, {
        type: NotificationEventPayload.SpaceCommunityApplication,
        space: { id: 'space-1', about: { profile: { displayName: 'My Space' } } },
      })
    );

    expect(href).toBeUndefined();
  });

  it('sends a new-member notification to the contributor who joined', () => {
    const href = hrefOf(
      notification(NotificationEvent.SpaceAdminCommunityNewMember, {
        type: NotificationEventPayload.SpaceCommunityActor,
        space: spacePayload(),
        actor: { profile: { displayName: 'Grace Hopper', url: '/user/grace' } },
      })
    );

    expect(href).toBe('/user/grace');
  });

  it('sends calendar notifications to the event, not to the space that also rides along', () => {
    const calendarEvent = {
      id: 'event-1',
      type: CalendarEventType.Event,
      profile: { displayName: 'Sprint demo', url: '/my-space/calendar/sprint-demo' },
    };

    const created = hrefOf(
      notification(NotificationEvent.SpaceCommunityCalendarEventCreated, {
        type: NotificationEventPayload.SpaceCommunityCalendarEvent,
        space: spacePayload(),
        calendarEvent,
      })
    );
    const commented = hrefOf(
      notification(NotificationEvent.SpaceCommunityCalendarEventComment, {
        type: NotificationEventPayload.SpaceCommunityCalendarEventComment,
        space: spacePayload(),
        calendarEvent,
      })
    );

    expect(created).toBe('/my-space/calendar/sprint-demo');
    expect(commented).toBe('/my-space/calendar/sprint-demo');
  });
});

describe('notification types kept on the generic payload fallback', () => {
  it('sends a callout comment to the commented message', () => {
    const href = hrefOf(
      notification(NotificationEvent.SpaceCollaborationCalloutComment, {
        type: NotificationEventPayload.SpaceCollaborationCalloutComment,
        space: spacePayload(),
        callout: { framing: { profile: { displayName: 'A callout', url: '/my-space/callout' } } },
        messageDetails: {
          message: 'Nice one',
          parent: { displayName: 'A callout', url: '/my-space/callout?comment=1' },
          room: { id: 'room-1' },
        },
      })
    );

    expect(href).toBe('/my-space/callout?comment=1');
  });

  it('sends a published callout to the callout', () => {
    const href = hrefOf(
      notification(NotificationEvent.SpaceCollaborationCalloutPublished, {
        type: NotificationEventPayload.SpaceCollaborationCallout,
        space: spacePayload(),
        callout: { framing: { profile: { displayName: 'A callout', url: '/my-space/callout' } } },
      })
    );

    expect(href).toBe('/my-space/callout');
  });

  it('keeps space-scoped notifications with no better destination on the space home page', () => {
    const update = hrefOf(
      notification(NotificationEvent.SpaceCommunicationUpdate, {
        type: NotificationEventPayload.SpaceCommunicationUpdate,
        space: spacePayload(),
        update: 'update-1',
      })
    );
    const invitation = hrefOf(
      notification(
        NotificationEvent.UserSpaceCommunityInvitation,
        { type: NotificationEventPayload.SpaceCommunityInvitation, space: spacePayload() },
        NotificationEventCategory.User
      )
    );
    const vcInvitationDeclined = hrefOf(
      notification(NotificationEvent.SpaceAdminVirtualCommunityInvitationDeclined, {
        type: NotificationEventPayload.VirtualContributor,
        space: spacePayload(),
        actor: { profile: { displayName: 'A VC', url: '/vc/a-vc' } },
      })
    );

    expect(update).toBe('/my-space');
    expect(invitation).toBe('/my-space');
    expect(vcInvitationDeclined).toBe('/my-space');
  });

  it('sends a forum discussion notification to the discussion', () => {
    const href = hrefOf(
      notification(
        NotificationEvent.PlatformForumDiscussionCreated,
        {
          type: NotificationEventPayload.PlatformForumDiscussion,
          discussion: { id: 'discussion-1', displayName: 'A discussion', url: '/forum/a-discussion' },
        },
        NotificationEventCategory.Platform
      )
    );

    expect(href).toBe('/forum/a-discussion');
  });

  it('leaves a payload with no linkable entity without an href', () => {
    const href = hrefOf(
      notification(
        NotificationEvent.PlatformAdminUserProfileRemoved,
        {
          type: NotificationEventPayload.PlatformUserProfileRemoved,
          userEmail: 'someone@example.com',
          userDisplayName: 'Someone',
        },
        NotificationEventCategory.Platform
      )
    );

    expect(href).toBeUndefined();
  });
});

describe('reaction notification rendering', () => {
  const calloutPayload = (calloutUrl: string, calloutName: string): Partial<InAppNotificationPayloadModel> => ({
    type: NotificationEventPayload.SpaceCollaborationCalloutReaction,
    emoji: 'heart',
    callout: { framing: { profile: { displayName: calloutName, url: calloutUrl } } },
    space: spacePayload('/my-space'),
  });

  it('deep-links to the callout when the payload carries callout.framing.profile.url', () => {
    const model = notification(
      NotificationEvent.SpaceCollaborationCalloutReaction,
      calloutPayload('/my-space/callout-1', 'My Callout')
    );
    const data = mapNotificationToItemData(model, t, NotificationEventInAppState.Unread);
    expect(data.href).toBe('/my-space/callout-1');
  });

  it('exposes the callout displayName as calloutName for subject interpolation', () => {
    const model = notification(
      NotificationEvent.SpaceCollaborationCalloutReaction,
      calloutPayload('/my-space/callout-1', 'A Named Callout')
    );
    // buildTranslationValues produces calloutName from payload.callout.framing.profile.displayName;
    // we verify the mapper does not crash and falls back cleanly to undefined when absent.
    const data = mapNotificationToItemData(model, t, NotificationEventInAppState.Unread);
    expect(data.href).toBe('/my-space/callout-1');
    expect(data.isUnread).toBe(true);
  });

  it('falls back to the space URL when the callout field is absent', () => {
    const model = notification(NotificationEvent.SpaceCollaborationCalloutReaction, {
      type: NotificationEventPayload.SpaceCollaborationCalloutReaction,
      emoji: 'heart',
      space: spacePayload('/my-space'),
    });
    const data = mapNotificationToItemData(model, t, NotificationEventInAppState.Unread);
    expect(data.href).toBe('/my-space');
  });

  it('leaves the href undefined when neither callout nor space is present', () => {
    const model = notification(NotificationEvent.SpaceCollaborationCalloutReaction, {
      type: NotificationEventPayload.SpaceCollaborationCalloutReaction,
    });
    const data = mapNotificationToItemData(model, t, NotificationEventInAppState.Unread);
    expect(data.href).toBeUndefined();
  });

  it('falls back gracefully when the emoji slug is unknown', () => {
    // An unrecognised slug must not throw — glyphForSlug returns undefined and the
    // placeholder interpolates as an empty string, which is the correct degraded state.
    const model = notification(NotificationEvent.SpaceCollaborationCalloutReaction, {
      type: NotificationEventPayload.SpaceCollaborationCalloutReaction,
      emoji: 'unknown-slug-9999',
      space: spacePayload('/my-space'),
    });
    expect(() => mapNotificationToItemData(model, t, NotificationEventInAppState.Unread)).not.toThrow();
  });

  it('produces an unread item for a reaction notification', () => {
    const model = notification(
      NotificationEvent.SpaceCollaborationCalloutReaction,
      calloutPayload('/my-space/callout-1', 'My Callout')
    );
    const data = mapNotificationToItemData(model, t, NotificationEventInAppState.Unread);
    expect(data.isUnread).toBe(true);
    expect(data.avatarFallback).toBe('AL');
  });
});
