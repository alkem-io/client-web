import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import type { V2DashboardActivityQuery } from '@/core/apollo/generated-v2/graphql-schema';
import { mapNativeActivityToFeedItems } from './dashboardDataMappers';

type NativeActivity = V2DashboardActivityQuery['activity']['edges'][number]['node'];

const t = ((key: string, options?: { subject?: string }) =>
  options?.subject ? `${key}:${options.subject}` : key) as unknown as TFunction;

const activity = (type: string, subject: NativeActivity['subject']): NativeActivity => ({
  id: `activity-${type}`,
  type,
  createdAt: '2026-11-20T10:00:00Z',
  actor: { __typename: 'User', id: 'author', about: { displayName: 'Ann Author', avatar: null } },
  space: { id: 'space-1', url: '/space-1', about: { displayName: 'Space one' } },
  subject,
});

const post = (url: string, displayName: string, parent?: { url: string; displayName: string }) => ({
  __typename: 'Post' as const,
  id: url,
  entityType: 'post',
  url,
  about: { displayName },
  parentPost: parent ? { id: parent.url, url: parent.url, about: { displayName: parent.displayName } } : null,
});

const map = (entry: NativeActivity) => mapNativeActivityToFeedItems([entry], t)[0];

// The native type is the legacy kebab kind (legacy-enums.tsv:10-21); the subject is the declared activity subject.
describe('mapNativeActivityToFeedItems (Query.activity → feed entries)', () => {
  it('callout published: the callout post, in its space', () => {
    expect(map(activity('callout-published', post('/c', 'Callout')))).toMatchObject({
      titlePlain: 'Callout',
      titleHref: '/c',
      contextName: 'Space one',
      userName: 'Ann Author',
      activityIconLabel: 'activity.iconLabel.CALLOUT_PUBLISHED',
    });
  });

  it('response and link: the subject post, with its parent callout as context (Post.parentPost)', () => {
    expect(map(activity('post-created', post('/r', 'Response', { url: '/c', displayName: 'Callout' })))).toMatchObject({
      titlePlain: 'Response',
      titleHref: '/r',
      contextName: 'Callout',
    });
    // Legacy links the whole row to the parent callout (links have no page of their own).
    expect(
      map(activity('callout-link-added', post('/l', 'Link', { url: '/c', displayName: 'Callout' })))
    ).toMatchObject({
      titlePlain: 'Link',
      titleHref: '/c',
      contextName: 'Callout',
    });
  });

  it('member joined, subspace and event: the subject actor / space / event post', () => {
    expect(
      map(
        activity('member-joined', {
          __typename: 'User',
          id: 'joiner',
          entityType: 'user',
          url: '/user/joiner',
          actorAbout: { displayName: 'Joe' },
        })
      )
    ).toMatchObject({
      titlePlain: 'components.activityLogView.description.MEMBER_JOINED:Joe',
      titleHref: '/user/joiner',
    });
    expect(
      map(
        activity('subspace-created', {
          __typename: 'Space',
          id: 'sub',
          entityType: 'space',
          url: '/space-1/sub',
          about: { displayName: 'Sub' },
        })
      )
    ).toMatchObject({ titlePlain: 'Sub', titleHref: '/space-1/sub', contextName: 'Space one' });
    expect(map(activity('calendar-event-created', post('/e', 'Event')))).toMatchObject({
      titlePlain: 'Event',
      contextName: 'Space one',
    });
  });

  it('whiteboard / memo created: the document, without a callout context (no parent carrier, H-activity-4)', () => {
    expect(
      map(
        activity('whiteboard-created', {
          __typename: 'Document',
          id: 'doc',
          entityType: 'document',
          url: '/doc',
          documentAbout: { displayName: 'Board' },
        })
      )
    ).toMatchObject({ titlePlain: 'Board', titleHref: '/doc', contextName: undefined });
  });

  it('comments and updates carry no GraphQL text (H-activity-2): the entry keeps its subject link and context only', () => {
    expect(map(activity('post-comment', post('/r', 'Response')))).toMatchObject({
      titlePlain: '',
      titleHref: '/r',
      contextName: 'Response',
    });
    expect(map(activity('update-sent', { __typename: 'Room', id: 'room', entityType: 'room' }))).toMatchObject({
      titlePlain: '',
      titleHref: '/space-1',
      contextName: 'Space one',
    });
  });
});
