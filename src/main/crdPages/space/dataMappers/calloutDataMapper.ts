import { type CalloutContributionType, CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import type { CalloutDetailDialogData } from '@/crd/components/callout/CalloutDetailDialog';
import type { PostCardData, PostType } from '@/crd/components/space/PostCard';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import type { CalloutModelLightExtended } from '@/domain/collaboration/callout/models/CalloutModelLight';
import { mapMediaGalleryToViewProps } from './mediaGalleryDataMapper';

function mapFramingTypeToPostType(framingType: CalloutFramingType): PostType {
  if (framingType === CalloutFramingType.Whiteboard) return 'whiteboard';
  if (framingType === CalloutFramingType.Memo) return 'memo';
  if (framingType === CalloutFramingType.MediaGallery) return 'mediaGallery';
  return 'text';
}

/**
 * Maps a lightweight callout (from the list query) to PostCardData.
 * Only has title and type — no description, no content previews.
 */
export function mapCalloutLightToPostCard(callout: CalloutModelLightExtended, t: DateFormatter): PostCardData {
  const postType = mapFramingTypeToPostType(callout.framing.type);

  return {
    id: callout.id,
    type: postType,
    title: callout.framing.profile.displayName,
    snippet: undefined, // Not available in list query
    isDraft: callout.draft,
    timestamp: callout.publishedDate ? formatRelativeDate(callout.publishedDate, t) : undefined,
    author: callout.createdBy?.profile
      ? { name: callout.createdBy.profile.displayName, avatarUrl: callout.createdBy.profile.avatar?.uri }
      : undefined,
    commentCount: callout.activity ?? 0,
  };
}

/**
 * Maps a fully-loaded callout (from CalloutDetailsQuery) to PostCardData.
 * Has description, content previews, author details, contribution counts.
 */
export function mapCalloutDetailsToPostCard(callout: CalloutDetailsModelExtended, t: DateFormatter): PostCardData {
  const postType = mapFramingTypeToPostType(callout.framing.type);

  return {
    id: callout.id,
    type: postType,
    title: callout.framing.profile.displayName,
    snippet: callout.framing.profile.description ?? undefined,
    isDraft: callout.draft,
    timestamp: callout.publishedDate ? formatRelativeDate(callout.publishedDate, t) : undefined,
    author: callout.createdBy?.profile
      ? { name: callout.createdBy.profile.displayName, avatarUrl: callout.createdBy.profile.avatar?.uri }
      : undefined,
    commentCount: callout.comments?.messagesCount ?? callout.activity ?? 0,
    framingImageUrl:
      callout.framing.type === CalloutFramingType.Whiteboard
        ? callout.framing.whiteboard?.profile.preview?.uri
        : undefined,
    framingMemoMarkdown: callout.framing.type === CalloutFramingType.Memo ? callout.framing.memo?.markdown : undefined,
    framingMediaGallery:
      callout.framing.type === CalloutFramingType.MediaGallery
        ? (() => {
            const mapped = mapMediaGalleryToViewProps(callout.framing.mediaGallery);
            return { thumbnails: mapped.feedThumbnails, totalCount: mapped.totalCount };
          })()
        : undefined,
  };
}

export function mapCalloutsToPostCards(callouts: CalloutModelLightExtended[], t: DateFormatter): PostCardData[] {
  return [...callouts].sort((a, b) => a.sortOrder - b.sortOrder).map(callout => mapCalloutLightToPostCard(callout, t));
}

export type DateFormatter = (key: string, options?: Record<string, unknown>) => string;

export function getCalloutContributionType(callout: CalloutDetailsModelExtended): CalloutContributionType | undefined {
  const allowedTypes = callout.settings.contribution.allowedTypes;
  return allowedTypes.length > 0 ? allowedTypes[0] : undefined;
}

export function formatRelativeDate(date: Date, t: DateFormatter): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return t('dates.today');
  if (days === 1) return t('dates.yesterday');
  if (days < 7) return t('dates.daysAgo', { count: days });
  if (days < 30) return t('dates.weeksAgo', { count: Math.floor(days / 7) });
  return date.toLocaleDateString();
}

/**
 * Maps a fully-loaded callout to the shape required by CalloutDetailDialog.
 */
export function mapCalloutDetailsToDialogData(
  callout: CalloutDetailsModelExtended,
  t: DateFormatter
): CalloutDetailDialogData {
  return {
    id: callout.id,
    title: callout.framing.profile.displayName,
    description: callout.framing.profile.description ?? undefined,
    timestamp: callout.publishedDate ? formatRelativeDate(callout.publishedDate, t) : undefined,
    author: callout.createdBy?.profile
      ? { name: callout.createdBy.profile.displayName, avatarUrl: callout.createdBy.profile.avatar?.uri }
      : undefined,
    commentCount: callout.comments?.messagesCount ?? callout.activity ?? 0,
    reactionCount: 0,
  };
}
