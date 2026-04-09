import {
  type SearchResultCalloutFragment,
  type SearchResultMemoFragment,
  type SearchResultOrganizationFragment,
  type SearchResultPostFragment,
  type SearchResultSpaceFragment,
  SearchResultType,
  type SearchResultUserFragment,
  type SearchResultWhiteboardFragment,
  VisualType,
} from '@/core/apollo/generated/graphql-schema';
import type { SpaceCardData } from '@/crd/components/space/SpaceCard';
import { getAvatarColor, getInitials } from '@/main/crdPages/spaces/spaceCardDataMapper';
import type { SearchResultMetaType, TypedSearchResult } from './SearchView';

type SpaceResult = TypedSearchResult<SearchResultType.Space | SearchResultType.Subspace, SearchResultSpaceFragment>;
type CalloutResult = TypedSearchResult<SearchResultType.Callout, SearchResultCalloutFragment>;
type PostResult = TypedSearchResult<SearchResultType.Post, SearchResultPostFragment>;
type WhiteboardResult = TypedSearchResult<SearchResultType.Whiteboard, SearchResultWhiteboardFragment>;
type MemoResult = TypedSearchResult<SearchResultType.Memo, SearchResultMemoFragment>;
type UserResult = TypedSearchResult<SearchResultType.User, SearchResultUserFragment>;
type OrgResult = TypedSearchResult<SearchResultType.Organization, SearchResultOrganizationFragment>;

export type PostType = 'post' | 'whiteboard' | 'memo';

export type PostResultCardData = {
  id: string;
  title: string;
  snippet: string;
  type: PostType;
  bannerUrl?: string;
  author: { name: string; avatarUrl?: string };
  date: string;
  spaceName: string;
  spaceUrl: string;
  href: string;
};

export type ResponseResultCardData = {
  id: string;
  title: string;
  snippet: string;
  type: PostType;
  author: { name: string; avatarUrl?: string };
  date: string;
  parentPostTitle: string;
  spaceName: string;
  spaceUrl: string;
  href: string;
};

export type UserResultCardData = {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: string;
  email?: string;
  href: string;
};

export type OrgResultCardData = {
  id: string;
  name: string;
  logoUrl?: string;
  type: string;
  tagline?: string;
  href: string;
};

function formatDate(date: Date | string | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function truncate(text: string, maxLength = 200): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
}

function interlaceArrays<T>(a: T[], b: T[], chunkSize = 4): T[] {
  const result: T[] = [];
  const maxLength = Math.max(a.length, b.length);

  for (let i = 0; i < maxLength; i += chunkSize) {
    result.push(...a.slice(i, i + chunkSize));
    result.push(...b.slice(i, i + chunkSize));
  }

  return result;
}

export function mapSpaceResults(results: SearchResultMetaType[]): SpaceCardData[] {
  return results
    .filter((r): r is SpaceResult => r.type === SearchResultType.Space || r.type === SearchResultType.Subspace)
    .map(result => {
      const { space } = result;
      const name = space.about.profile.displayName;
      const cardVisual = space.about.profile.visuals.find(v => v.name === VisualType.Card);

      const { parentSpace } = result;

      const parent = parentSpace
        ? {
            name: parentSpace.about.profile.displayName,
            href: parentSpace.about.profile.url,
            avatarUrl: parentSpace.about.profile.avatar?.uri,
            initials: getInitials(parentSpace.about.profile.displayName),
            avatarColor: getAvatarColor(parentSpace.id),
          }
        : undefined;

      return {
        id: space.id,
        name,
        description: space.about.profile.tagline ?? '',
        bannerImageUrl: cardVisual?.uri,
        initials: getInitials(name),
        avatarColor: getAvatarColor(space.id),
        isPrivate: !space.about.isContentPublic,
        tags: space.about.profile.tagset?.tags ?? [],
        leads: [],
        href: space.about.profile.url,
        matchedTerms: result.terms.length > 0,
        parent,
      };
    });
}

export function mapPostResults(
  calloutResults: SearchResultMetaType[],
  framingResults: SearchResultMetaType[]
): PostResultCardData[] {
  const mappedCallouts: PostResultCardData[] = calloutResults
    .filter((r): r is CalloutResult => r.type === SearchResultType.Callout)
    .map(r => ({
      id: r.id,
      title: r.callout.framing.profile.displayName,
      snippet: '',
      type: 'post' as PostType,
      bannerUrl: undefined,
      author: { name: 'Unknown' },
      date: '',
      spaceName: r.space.about.profile.displayName,
      spaceUrl: r.space.about.profile.url,
      href: r.callout.framing.profile.url,
    }));

  const mappedFraming: PostResultCardData[] = framingResults
    .filter(
      (r): r is WhiteboardResult | MemoResult =>
        r.type === SearchResultType.Whiteboard || r.type === SearchResultType.Memo
    )
    .map(result => {
      if (result.type === SearchResultType.Whiteboard) {
        const r = result as WhiteboardResult;
        return {
          id: r.id,
          title: r.whiteboard.profile.displayName,
          snippet: r.whiteboard.profile.description ?? '',
          type: 'whiteboard' as PostType,
          bannerUrl: r.whiteboard.profile.preview?.uri,
          author: { name: r.whiteboard.createdBy?.profile?.displayName ?? 'Unknown' },
          date: formatDate(r.whiteboard.createdDate),
          spaceName: r.space.about.profile.displayName,
          spaceUrl: r.space.about.profile.url,
          href: r.whiteboard.profile.url,
        };
      }

      const r = result as MemoResult;
      return {
        id: r.id,
        title: r.memo.profile.displayName,
        snippet: truncate(r.memo.markdown ?? r.memo.profile.description ?? ''),
        type: 'memo' as PostType,
        bannerUrl: undefined,
        author: { name: r.memo.createdBy?.profile?.displayName ?? 'Unknown' },
        date: formatDate(r.memo.createdDate),
        spaceName: r.space.about.profile.displayName,
        spaceUrl: r.space.about.profile.url,
        href: r.memo.profile.url,
      };
    });

  return interlaceArrays(mappedCallouts, mappedFraming);
}

export function mapResponseResults(contributionResults: SearchResultMetaType[]): ResponseResultCardData[] {
  return contributionResults
    .filter(
      (r): r is PostResult | MemoResult | WhiteboardResult =>
        r.type === SearchResultType.Post || r.type === SearchResultType.Memo || r.type === SearchResultType.Whiteboard
    )
    .map(result => {
      const spaceName = result.space.about.profile.displayName;
      const spaceUrl = result.space.about.profile.url;
      const parentPostTitle = result.callout.framing.profile.displayName;

      if (result.type === SearchResultType.Post) {
        const r = result as PostResult;
        return {
          id: r.id,
          title: r.post.profile.displayName,
          snippet: r.post.profile.description ?? '',
          type: 'post' as PostType,
          author: { name: r.post.createdBy?.profile?.displayName ?? 'Unknown' },
          date: formatDate(r.post.createdDate),
          parentPostTitle,
          spaceName,
          spaceUrl,
          href: r.post.profile.url,
        };
      }

      if (result.type === SearchResultType.Memo) {
        const r = result as MemoResult;
        return {
          id: r.id,
          title: r.memo.profile.displayName,
          snippet: truncate(r.memo.markdown ?? r.memo.profile.description ?? ''),
          type: 'memo' as PostType,
          author: { name: r.memo.createdBy?.profile?.displayName ?? 'Unknown' },
          date: formatDate(r.memo.createdDate),
          parentPostTitle,
          spaceName,
          spaceUrl,
          href: r.memo.profile.url,
        };
      }

      // Whiteboard
      const r = result as WhiteboardResult;
      return {
        id: r.id,
        title: r.whiteboard.profile.displayName,
        snippet: r.whiteboard.profile.description ?? '',
        type: 'whiteboard' as PostType,
        author: { name: r.whiteboard.createdBy?.profile?.displayName ?? 'Unknown' },
        date: formatDate(r.whiteboard.createdDate),
        parentPostTitle,
        spaceName,
        spaceUrl,
        href: r.whiteboard.profile.url,
      };
    });
}

export function mapUserResults(actorResults: SearchResultMetaType[]): UserResultCardData[] {
  return actorResults
    .filter((r): r is UserResult => r.type === SearchResultType.User)
    .map(r => ({
      id: r.user.id,
      name: r.user.profile?.displayName ?? '',
      avatarUrl: r.user.profile?.visual?.uri,
      role: r.user.profile?.tagsets?.[0]?.tags[0],
      email: undefined,
      href: r.user.profile?.url ?? '',
    }));
}

export function mapOrgResults(actorResults: SearchResultMetaType[]): OrgResultCardData[] {
  return actorResults
    .filter((r): r is OrgResult => r.type === SearchResultType.Organization)
    .map(r => ({
      id: r.organization.id,
      name: r.organization.profile?.displayName ?? '',
      logoUrl: r.organization.profile?.visual?.uri,
      type: 'Organization',
      tagline: r.organization.profile?.description,
      href: r.organization.profile?.url ?? '',
    }));
}
