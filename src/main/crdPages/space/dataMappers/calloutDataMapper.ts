import { CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import type { PostCardData, PostType } from '@/crd/components/space/PostCard';
import type { CalloutModelLightExtended } from '@/domain/collaboration/callout/models/CalloutModelLight';

function mapFramingTypeToPostType(framingType: CalloutFramingType): PostType {
  switch (framingType) {
    case CalloutFramingType.Whiteboard:
      return 'whiteboard';
    default:
      return 'text';
  }
}

export function mapCalloutToPostCard(callout: CalloutModelLightExtended): PostCardData {
  const postType = mapFramingTypeToPostType(callout.framing.type);

  return {
    id: callout.id,
    type: postType,
    title: callout.framing.profile.displayName,
    snippet: callout.framing.profile.description ?? undefined,
    isDraft: callout.draft,
    timestamp: callout.publishedDate ? formatRelativeDate(callout.publishedDate) : undefined,
    author: callout.createdBy?.profile
      ? {
          name: callout.createdBy.profile.displayName,
          avatarUrl: undefined,
        }
      : undefined,
    commentCount: callout.activity ?? 0,
    contentPreview:
      postType === 'whiteboard' && callout.framing.whiteboard?.profile.preview?.uri
        ? { imageUrl: callout.framing.whiteboard.profile.preview.uri }
        : undefined,
  };
}

export function mapCalloutsToPostCards(callouts: CalloutModelLightExtended[]): PostCardData[] {
  return callouts.sort((a, b) => a.sortOrder - b.sortOrder).map(mapCalloutToPostCard);
}

type DateFormatter = (key: string, options?: Record<string, unknown>) => string;

/**
 * Formats a date relative to now using i18n keys from the 'crd-space' namespace.
 * Requires a `t` function from useTranslation('crd-space').
 * Falls back to locale date string for dates older than 30 days.
 */
export function formatRelativeDate(date: Date, t?: DateFormatter): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (!t) return date.toLocaleDateString();

  if (days === 0) return t('dates.today');
  if (days === 1) return t('dates.yesterday');
  if (days < 7) return t('dates.daysAgo', { count: days });
  if (days < 30) return t('dates.weeksAgo', { count: Math.floor(days / 7) });
  return date.toLocaleDateString();
}
