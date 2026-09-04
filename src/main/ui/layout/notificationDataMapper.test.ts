import type { TFunction } from 'i18next';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import {
  ActorType,
  CalendarEventType,
  NotificationEvent,
  NotificationEventCategory,
  NotificationEventInAppState,
  NotificationEventPayload,
  RoleName,
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

  it('sends the org-invited notification to the organization Invitations tab, not the space (061, contract §4)', () => {
    const href = hrefOf(
      notification(
        NotificationEvent.OrganizationAdminSpaceCommunityInvitation,
        {
          type: NotificationEventPayload.SpaceCommunityInvitation,
          space: spacePayload(),
          organization: { id: 'org-1', profile: { displayName: 'Acme Org', url: '/organization/acme' } },
        },
        NotificationEventCategory.Organization
      )
    );

    expect(href).toBe('/organization/acme/settings/invitations');
  });

  it('sends the org-accepted notification to the inviting space Community tab', () => {
    const href = hrefOf(
      notification(
        NotificationEvent.SpaceAdminOrganizationCommunityInvitationAccepted,
        {
          type: NotificationEventPayload.SpaceCommunityActor,
          space: spacePayload('/my-space'),
          actor: { type: ActorType.Organization, profile: { displayName: 'Acme Org', url: '/organization/acme' } },
        },
        NotificationEventCategory.SpaceAdmin
      )
    );

    expect(href).toBe('/my-space/settings/community');
  });

  it('sends the org-declined notification to the inviting space Community tab', () => {
    const href = hrefOf(
      notification(
        NotificationEvent.SpaceAdminOrganizationCommunityInvitationDeclined,
        {
          type: NotificationEventPayload.SpaceCommunityActor,
          space: spacePayload('/my-space'),
          actor: { type: ActorType.Organization, profile: { displayName: 'Acme Org', url: '/organization/acme' } },
        },
        NotificationEventCategory.SpaceAdmin
      )
    );

    expect(href).toBe('/my-space/settings/community');
  });
});

describe('organization outcome notifications name the organization (061, spec-cw-5)', () => {
  const outcomeNotification = (type: NotificationEvent) =>
    notification(
      type,
      {
        type: NotificationEventPayload.SpaceCommunityActor,
        space: spacePayload('/my-space'),
        actor: { type: ActorType.Organization, profile: { displayName: 'Acme Org', url: '/organization/acme' } },
      },
      NotificationEventCategory.SpaceAdmin
    );

  it('names the organization on the accepted notification, not just the space', () => {
    const data = mapNotificationToItemData(
      outcomeNotification(NotificationEvent.SpaceAdminOrganizationCommunityInvitationAccepted),
      t,
      NotificationEventInAppState.Unread
    );
    const title = data.title as ReactElement<{ values: Record<string, string | undefined> }>;
    expect(title.props.values.organizationName).toBe('Acme Org');
  });

  it('names the organization on the declined notification, not just the space', () => {
    const data = mapNotificationToItemData(
      outcomeNotification(NotificationEvent.SpaceAdminOrganizationCommunityInvitationDeclined),
      t,
      NotificationEventInAppState.Unread
    );
    const title = data.title as ReactElement<{ values: Record<string, string | undefined> }>;
    expect(title.props.values.organizationName).toBe('Acme Org');
  });

  it('does not name an organization when the actor is not one (e.g. new-member notification sharing the same payload)', () => {
    const data = mapNotificationToItemData(
      notification(
        NotificationEvent.SpaceAdminCommunityNewMember,
        {
          type: NotificationEventPayload.SpaceCommunityActor,
          space: spacePayload('/my-space'),
          actor: { type: ActorType.User, profile: { displayName: 'Ada Lovelace', url: '/user/ada' } },
        },
        NotificationEventCategory.SpaceAdmin
      ),
      t,
      NotificationEventInAppState.Unread
    );
    const title = data.title as ReactElement<{ values: Record<string, string | undefined> }>;
    expect(title.props.values.organizationName).toBeUndefined();
  });
});

describe('organization space-invitation translation values (061)', () => {
  const orgInvitedNotification = (invitation: NonNullable<InAppNotificationPayloadModel['invitation']>) =>
    notification(
      NotificationEvent.OrganizationAdminSpaceCommunityInvitation,
      {
        type: NotificationEventPayload.SpaceCommunityInvitation,
        space: spacePayload(),
        organization: { id: 'org-1', profile: { displayName: 'Acme Org', url: '/organization/acme' } },
        invitation,
      },
      NotificationEventCategory.Organization
    );

  it('resolves invitationRole to "member" (translated) when extraRoles has no Lead', () => {
    const data = mapNotificationToItemData(
      orgInvitedNotification({ extraRoles: [], invitedToParent: false, spacesToJoinOnAccept: [] }),
      t,
      NotificationEventInAppState.Unread
    );
    const title = data.title as ReactElement<{ values: Record<string, string | undefined> }>;
    expect(title.props.values.invitationRole).toBe('member');
    expect(title.props.values.organizationName).toBe('Acme Org');
  });

  it('resolves invitationRole to "member + lead" when extraRoles includes Lead', () => {
    const data = mapNotificationToItemData(
      orgInvitedNotification({
        extraRoles: [RoleName.Lead],
        invitedToParent: false,
        spacesToJoinOnAccept: [],
      }),
      t,
      NotificationEventInAppState.Unread
    );
    const title = data.title as ReactElement<{ values: Record<string, string | undefined> }>;
    expect(title.props.values.invitationRole).toBe('member + lead');
  });

  it('spacesToJoin is empty when accepting joins only the target Space', () => {
    const data = mapNotificationToItemData(
      orgInvitedNotification({
        extraRoles: [],
        invitedToParent: false,
        spacesToJoinOnAccept: [{ profile: { displayName: 'Green Energy', url: '/space/green-energy' } }],
      }),
      t,
      NotificationEventInAppState.Unread
    );
    const title = data.title as ReactElement<{ values: Record<string, string | undefined> }>;
    expect(title.props.values.spacesToJoin).toBe('');
  });

  it('spacesToJoin lists every extra Space when accepting joins more than one', () => {
    const data = mapNotificationToItemData(
      orgInvitedNotification({
        extraRoles: [],
        invitedToParent: true,
        spacesToJoinOnAccept: [
          { profile: { displayName: 'Root Space', url: '/space/root' } },
          { profile: { displayName: 'Green Energy', url: '/space/root/green-energy' } },
        ],
      }),
      t,
      NotificationEventInAppState.Unread
    );
    const title = data.title as ReactElement<{ values: Record<string, string | undefined> }>;
    // `t` here is the plain key-echo stub (as elsewhere in this file) — assert the nested
    // key was reached (not the interpolated English, which a real i18next instance renders).
    expect(title.props.values.spacesToJoin).toContain('components.inAppNotifications.spacesToJoin');
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
        },
        NotificationEventCategory.Platform
      )
    );

    expect(href).toBeUndefined();
  });

  it('renders the profile-removed notification with no PII in its interpolation values', () => {
    const model = notification(
      NotificationEvent.PlatformAdminUserProfileRemoved,
      { type: NotificationEventPayload.PlatformUserProfileRemoved },
      NotificationEventCategory.Platform
    );
    const data = mapNotificationToItemData(model, t, NotificationEventInAppState.Unread);

    // The removed user's display name and email are gone from the wire payload
    // entirely (schema fields dropped) — assert the values passed into <Trans>
    // carry no leftover trace of either, so a future re-add of the fields to the
    // shared payload model can't silently leak them back into this notification.
    const title = data.title as ReactElement<{ values: Record<string, string | undefined> }>;
    expect(title.props.values.userEmail).toBeUndefined();
    expect(title.props.values.userDisplayName).toBeUndefined();
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
    const data = mapNotificationToItemData(model, t, NotificationEventInAppState.Unread);
    expect(data.href).toBe('/my-space/callout-1');
    expect(data.isUnread).toBe(true);
    // The subject is a <Trans> element; its `values` carry the interpolation the
    // template consumes. Assert calloutName is threaded through, so the test fails
    // if buildTranslationValues ever omits or renames it.
    const title = data.title as ReactElement<{ values: Record<string, string | undefined> }>;
    expect(title.props.values.calloutName).toBe('A Named Callout');
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
    let data: ReturnType<typeof mapNotificationToItemData> | undefined;
    expect(() => {
      data = mapNotificationToItemData(model, t, NotificationEventInAppState.Unread);
    }).not.toThrow();
    // The unknown slug must resolve through glyphForSlug to undefined — never the
    // raw wire slug — so the subject placeholder renders empty rather than
    // leaking "unknown-slug-9999".
    const title = data!.title as ReactElement<{ values: Record<string, string | undefined> }>;
    expect(title.props.values.emoji).toBeUndefined();
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

describe('notification avatar subject', () => {
  const newMember = (actor?: InAppNotificationPayloadModel['actor']) =>
    mapNotificationToItemData(
      notification(NotificationEvent.SpaceAdminCommunityNewMember, {
        type: NotificationEventPayload.SpaceCommunityActor,
        space: spacePayload(),
        actor,
      }),
      t,
      NotificationEventInAppState.Unread
    );

  it('shows the member who joined, not whoever triggered the join', () => {
    // The trigger is a lead accepting an invitation / adding a member, so the two differ;
    // the copy names the member, and the avatar has to name the same person.
    const data = newMember({
      profile: { displayName: 'Grace Hopper', url: '/user/grace', visual: { uri: 'grace.png' } },
    });

    expect(data.avatarUrl).toBe('grace.png');
    expect(data.avatarFallback).toBe('GH');
  });

  it('keeps the member as the subject when that member has no avatar image', () => {
    const data = newMember({ profile: { displayName: 'Grace Hopper', url: '/user/grace' } });

    expect(data.avatarUrl).toBeUndefined();
    expect(data.avatarFallback).toBe('GH');
  });

  it('falls back to the triggering user when the payload carries no actor', () => {
    const data = newMember(undefined);

    expect(data.avatarUrl).toBe('ada.png');
    expect(data.avatarFallback).toBe('AL');
  });

  it('leaves types whose copy leads with the triggering user on that user', () => {
    // This template reads "<triggeredBy> declined your invitation for <contributor>", so
    // the trigger is its subject even though the payload also carries an actor.
    const data = mapNotificationToItemData(
      notification(NotificationEvent.SpaceAdminVirtualCommunityInvitationDeclined, {
        type: NotificationEventPayload.VirtualContributor,
        space: spacePayload(),
        actor: { profile: { displayName: 'A VC', url: '/vc/a-vc', visual: { uri: 'vc.png' } } },
      }),
      t,
      NotificationEventInAppState.Unread
    );

    expect(data.avatarUrl).toBe('ada.png');
    expect(data.avatarFallback).toBe('AL');
  });
});
