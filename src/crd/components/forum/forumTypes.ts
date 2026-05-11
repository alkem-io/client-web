import type { ReactNode } from 'react';

export type ForumSortOrder = 'newest' | 'oldest';

export type ForumCategoryEntry = {
  slug: string;
  label: string;
  iconNode: ReactNode;
};

export type ForumDiscussionListItemData = {
  id: string;
  title: string;
  iconNode: ReactNode;
  author: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  /** Localised display string (e.g. `Wed, 25/06/2025`). */
  formattedDate: string;
  /** Raw numeric epoch-ms used for sorting (so newest/oldest sort by actual
   *  creation time, not by lexical id order). */
  timestamp: number;
  commentCount: number;
  href: string;
  ariaLabel: string;
};

export type ForumDiscussionDetailData = {
  id: string;
  iconNode: ReactNode;
  title: string;
  categorySlug: string | undefined;
  shareUrl: string;
  body: {
    contentNode: ReactNode;
  };
  author: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    avatarColor: string;
  };
  formattedDate: string;
  onEdit?: () => void;
  onDelete?: () => void;
};
