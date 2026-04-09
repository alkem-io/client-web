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
