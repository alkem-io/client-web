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
  linkUrl?: string;
  linkDescription?: string;
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

function toDateString(date: Date | string | undefined): string | undefined {
  if (!date) return undefined;
  return date instanceof Date ? date.toISOString() : date;
}

function extractAuthor(createdBy: ContributionAuthorBase | null | undefined) {
  if (!createdBy?.profile) return undefined;
  return {
    name: createdBy.profile.displayName,
    avatarUrl: createdBy.profile.avatar?.uri,
  };
}

export function mapAnyContributionToCardData(item: AnyContributionItem): ContributionCardData | undefined {
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
      createdDate: toDateString(post.createdDate),
      commentCount: post.comments?.messagesCount,
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
      createdDate: toDateString(wb.createdDate),
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
      createdDate: toDateString(memo.createdDate),
    };
  }

  if (item.link) {
    const link = item.link;
    return {
      id: item.id,
      type: 'link',
      title: link.profile.displayName,
      linkUrl: link.uri,
      linkDescription: link.profile.description ?? undefined,
    };
  }

  return undefined;
}
