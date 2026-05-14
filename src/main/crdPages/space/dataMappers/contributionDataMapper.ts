import type { Locale } from 'date-fns';
import { formatShortDate } from '@/crd/lib/dateTimeFormat';

type ContributionCardData = {
  id: string;
  type: 'post' | 'memo' | 'whiteboard' | 'link';
  title: string;
  author?: { name: string; avatarUrl?: string };
  createdDate?: string;
  href?: string;
  description?: string;
  commentCount?: number;
  tags?: string[];
  previewUrl?: string;
  markdownContent?: string;
  /** For memo contributions: the underlying memo id (different from the contribution wrapper id). */
  memoId?: string;
  /** For post contributions: the underlying post id (different from the contribution wrapper id). */
  postId?: string;
  linkUrl?: string;
  linkDescription?: string;
  /** For link contributions: the underlying link id (different from the contribution wrapper id). Used by update/delete mutations. */
  linkId?: string;
  /** For link contributions: whether the current user can update this specific link. */
  canEditLink?: boolean;
  /** For link contributions: whether the current user can delete this specific link. */
  canDeleteLink?: boolean;
};

export type { ContributionCardData };

type ContributionQueryData = {
  id: string;
  profile: {
    displayName: string;
    description?: string | null;
    url?: string;
    tagset?: { tags: string[] } | null;
    visual?: { uri: string } | null;
  };
  createdBy?: {
    profile?: {
      displayName: string;
      avatar?: { uri: string } | null;
    } | null;
  } | null;
  createdDate?: string;
  link?: {
    uri: string;
    profile?: {
      description?: string | null;
    };
  } | null;
};

export function mapContributionToCardData(
  contribution: ContributionQueryData,
  type: 'post' | 'memo' | 'whiteboard' | 'link'
): ContributionCardData {
  return {
    id: contribution.id,
    type,
    title: contribution.profile.displayName,
    description: contribution.profile.description ?? undefined,
    href: contribution.profile.url,
    tags: contribution.profile.tagset?.tags ?? [],
    previewUrl: contribution.profile.visual?.uri,
    author: contribution.createdBy?.profile
      ? {
          name: contribution.createdBy.profile.displayName,
          avatarUrl: contribution.createdBy.profile.avatar?.uri,
        }
      : undefined,
    createdDate: contribution.createdDate,
    linkUrl: contribution.link?.uri,
    linkDescription: contribution.link?.profile?.description ?? undefined,
  };
}

/**
 * Maps a contribution from the CalloutContributions query (union of post/whiteboard/memo/link)
 * to ContributionCardData. Extracts the correct sub-object from the union.
 */
type ContributionProfileBase = {
  id?: string;
  url?: string;
  displayName: string;
  description?: string | null;
  tagset?: { tags: string[] } | null;
  visual?: { uri: string } | null;
};

type ContributionAuthorBase = {
  id?: string;
  profile?: {
    displayName: string;
    avatar?: { uri: string } | null;
  } | null;
};

type AnyContributionItem = {
  id: string;
  sortOrder?: number;
  post?: {
    id: string;
    createdDate?: Date | string;
    createdBy?: ContributionAuthorBase | null;
    profile: ContributionProfileBase;
    comments?: { id: string; messagesCount: number };
  } | null;
  whiteboard?: {
    id: string;
    createdDate?: Date | string;
    createdBy?: ContributionAuthorBase | null;
    profile: ContributionProfileBase;
  } | null;
  memo?: {
    id: string;
    createdDate?: Date | string;
    createdBy?: ContributionAuthorBase | null;
    profile: { id?: string; url?: string; displayName: string };
    markdown?: string;
  } | null;
  link?: {
    id: string;
    uri: string;
    profile: { id?: string; displayName: string; description?: string | null };
    authorization?: { myPrivileges?: string[] };
  } | null;
};

function toDateString(date: Date | string | undefined, locale?: Locale): string | undefined {
  // Short localized date (e.g. `05/13/2026` in en-US) — the contribution-card
  // surface only needs the day, not the precise timestamp the server returns.
  return formatShortDate(date, locale);
}

function extractAuthor(createdBy: ContributionAuthorBase | null | undefined) {
  if (!createdBy?.profile) return undefined;
  return {
    name: createdBy.profile.displayName,
    avatarUrl: createdBy.profile.avatar?.uri,
  };
}

export function mapAnyContributionToCardData(
  item: AnyContributionItem,
  locale?: Locale
): ContributionCardData | undefined {
  // Use `item.id` (contribution wrapper ID) — this is the ID the backend uses
  // to look up a contribution inside a callout (e.g. WhiteboardFromCallout query).
  if (item.post) {
    const post = item.post;
    return {
      id: item.id,
      type: 'post',
      title: post.profile.displayName,
      description: post.profile.description ?? undefined,
      href: post.profile.url,
      tags: post.profile.tagset?.tags ?? [],
      previewUrl: post.profile.visual?.uri,
      author: extractAuthor(post.createdBy),
      createdDate: toDateString(post.createdDate, locale),
      commentCount: post.comments?.messagesCount,
      postId: post.id,
    };
  }

  if (item.whiteboard) {
    const wb = item.whiteboard;
    return {
      id: item.id,
      type: 'whiteboard',
      title: wb.profile.displayName,
      href: wb.profile.url,
      previewUrl: wb.profile.visual?.uri,
      author: extractAuthor(wb.createdBy),
      createdDate: toDateString(wb.createdDate, locale),
    };
  }

  if (item.memo) {
    const memo = item.memo;
    return {
      id: item.id,
      type: 'memo',
      title: memo.profile.displayName,
      href: memo.profile.url,
      markdownContent: memo.markdown,
      memoId: memo.id,
      author: extractAuthor(memo.createdBy),
      createdDate: toDateString(memo.createdDate, locale),
    };
  }

  if (item.link) {
    const link = item.link;
    const privileges = link.authorization?.myPrivileges ?? [];
    return {
      id: item.id,
      type: 'link',
      title: link.profile.displayName,
      linkUrl: link.uri,
      linkDescription: link.profile.description ?? undefined,
      linkId: link.id,
      canEditLink: privileges.includes('UPDATE'),
      canDeleteLink: privileges.includes('DELETE'),
    };
  }

  return undefined;
}
