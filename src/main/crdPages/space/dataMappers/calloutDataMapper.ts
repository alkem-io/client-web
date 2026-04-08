import { CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import type { PostCardData, PostType } from '@/crd/components/space/PostCard';

type CalloutLight = {
  id: string;
  framing: {
    profile: {
      displayName: string;
      description?: string | null;
      url?: string;
    };
    type: CalloutFramingType;
    whiteboard?: {
      profile: {
        preview?: { uri: string } | null;
      };
    } | null;
  };
  sortOrder: number;
  activity?: number;
  draft: boolean;
  editable: boolean;
  movable: boolean;
  canBeSavedAsTemplate: boolean;
  publishedDate?: Date;
  createdBy?: {
    id: string;
    profile?: { displayName: string } | null;
  } | null;
};

function mapFramingTypeToPostType(framingType: CalloutFramingType): PostType {
  switch (framingType) {
    case CalloutFramingType.Whiteboard:
      return 'whiteboard';
    default:
      return 'text';
  }
}

export function mapCalloutToPostCard(callout: CalloutLight): PostCardData {
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

export function mapCalloutsToPostCards(callouts: CalloutLight[]): PostCardData[] {
  return callouts.sort((a, b) => a.sortOrder - b.sortOrder).map(mapCalloutToPostCard);
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return date.toLocaleDateString();
}
