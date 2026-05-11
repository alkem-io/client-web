import { format as formatDate, type Locale } from 'date-fns';
import type { TFunction } from 'i18next';
import { Building2, HelpCircle, MessageSquare, MoreHorizontal, Rocket, Settings, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  ForumDiscussionCategory,
  type PlatformDiscussionQuery,
  type PlatformDiscussionsQuery,
} from '@/core/apollo/generated/graphql-schema';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import type {
  ForumCategoryEntry,
  ForumDiscussionDetailData,
  ForumDiscussionListItemData,
} from '@/crd/components/forum/forumTypes';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import type { AuthorModel } from '@/domain/community/user/models/AuthorModel';
import { ALL_SLUG, slugFor } from '@/main/crdPages/topLevelPages/forum/useCategorySlug';

const renderCategoryIcon = (category: ForumDiscussionCategory | undefined): ReactNode => {
  switch (category) {
    case ForumDiscussionCategory.Releases:
      return <Rocket className="size-4" />;
    case ForumDiscussionCategory.PlatformFunctionalities:
      return <Settings className="size-4" />;
    case ForumDiscussionCategory.CommunityBuilding:
      return <Users className="size-4" />;
    case ForumDiscussionCategory.ChallengeCentric:
      return <Building2 className="size-4" />;
    case ForumDiscussionCategory.Help:
      return <HelpCircle className="size-4" />;
    case ForumDiscussionCategory.Other:
      return <MoreHorizontal className="size-4" />;
    default:
      return <MessageSquare className="size-4" />;
  }
};

type DiscussionDetailEntry = NonNullable<PlatformDiscussionQuery['platform']['forum']['discussion']>;

type MapperContext = {
  /** Bound `t` from `useTranslation('crd-forum')`. */
  t: TFunction<'crd-forum'>;
  /** Bound `t` from default `useTranslation()` namespace — used for category enum labels. */
  tDefault: TFunction;
  /** date-fns Locale for the active language. */
  locale: Locale;
  /** Author lookup resolved by `useAuthorsDetails` in the page component. */
  getAuthor: (id: string) => AuthorModel | undefined;
};

const formatDiscussionDate = (timestamp: number | undefined, locale: Locale): string =>
  timestamp ? formatDate(new Date(timestamp), 'EEE, dd/MM/yyyy', { locale }) : '';

export const buildCategoryEntries = (
  validCategories: ForumDiscussionCategory[],
  t: TFunction<'crd-forum'>,
  tDefault: TFunction
): ForumCategoryEntry[] => {
  return [
    {
      slug: ALL_SLUG,
      label: t('categories.all'),
      iconNode: renderCategoryIcon(undefined),
    },
    ...validCategories.map<ForumCategoryEntry>(category => ({
      slug: slugFor(category),
      label: tDefault(`common.enums.discussion-category.${category}` as never),
      iconNode: renderCategoryIcon(category),
    })),
  ];
};

export const mapDiscussionsToListData = (
  query: PlatformDiscussionsQuery | undefined,
  context: MapperContext
): ForumDiscussionListItemData[] => {
  const discussions = query?.platform.forum.discussions ?? [];

  return discussions
    .filter(discussion => Boolean(discussion.profile.url))
    .map<ForumDiscussionListItemData>(discussion => {
      const author = discussion.createdBy ? context.getAuthor(discussion.createdBy) : undefined;
      const authorDisplayName = author?.displayName ?? '';
      const formattedDate = formatDiscussionDate(discussion.timestamp, context.locale);
      const commentCount = discussion.comments.messagesCount ?? 0;

      const ariaLabel = context.t('list.itemAriaLabel', {
        title: discussion.profile.displayName,
        author: authorDisplayName,
        date: formattedDate,
        count: commentCount,
      });

      return {
        id: discussion.id,
        title: discussion.profile.displayName,
        iconNode: renderCategoryIcon(discussion.category),
        author: {
          id: author?.id ?? discussion.createdBy ?? discussion.id,
          displayName: authorDisplayName,
          avatarUrl: author?.avatarUrl,
        },
        formattedDate,
        // GraphQL returns the creation epoch in seconds (`Float`). Carry the
        // raw value through to the page so sorting is by real creation time,
        // not by lexical id order.
        timestamp: discussion.timestamp ?? 0,
        commentCount,
        href: discussion.profile.url,
        ariaLabel,
      };
    });
};

export const mapDiscussionToDetailData = (
  discussion: DiscussionDetailEntry | undefined,
  context: MapperContext,
  authorIdHint: string | undefined
): ForumDiscussionDetailData | undefined => {
  if (!discussion) return undefined;

  const author = authorIdHint ? context.getAuthor(authorIdHint) : undefined;
  const authorId = author?.id ?? authorIdHint ?? discussion.id;
  const authorDisplayName = author?.displayName ?? '';

  const description = discussion.profile.description ?? '';
  const bodyContent: ReactNode = description ? <MarkdownContent content={description} /> : null;

  return {
    id: discussion.id,
    iconNode: renderCategoryIcon(discussion.category),
    title: discussion.profile.displayName,
    categorySlug: slugFor(discussion.category),
    shareUrl: `${window.location.origin}${discussion.profile.url}`,
    body: { contentNode: bodyContent },
    author: {
      id: authorId,
      displayName: authorDisplayName,
      avatarUrl: author?.avatarUrl,
      avatarColor: pickColorFromId(authorId),
    },
    formattedDate: formatDiscussionDate(discussion.timestamp, context.locale),
  };
};

export const buildMetaLine = (item: ForumDiscussionListItemData, t: TFunction<'crd-forum'>): string =>
  t('list.metaLine', {
    author: item.author.displayName,
    date: item.formattedDate,
    count: item.commentCount,
  });
