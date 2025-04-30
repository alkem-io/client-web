import { useMemo } from 'react';
import {
  AuthorizationPrivilege,
  DiscussionCardFragment,
  ForumDiscussionCategory,
} from '@/core/apollo/generated/graphql-schema';
import { AuthorModel } from '@/domain/community/user/models/AuthorModel';
import { useAuthorsDetails } from '@/domain/community/user/hooks/useAuthorsDetails';
import { Room } from '@/domain/communication/room/models/Room';

export interface Discussion {
  id: string;
  url: string;
  title: string;
  category: ForumDiscussionCategory;
  myPrivileges: AuthorizationPrivilege[] | undefined;
  author?: AuthorModel;
  authors: AuthorModel[];
  description?: string;
  createdAt: Date | undefined;
  comments: Room;
}

type DiscussionMapper = {
  /**
   * Maps any compatible discussion fragment to a Discussion object.
   * Needs to be a hook to look into the authors details
   * @param discussion
   * @returns
   */
  discussionMapper: (discussion: DiscussionCardFragment) => Discussion;
  loading: boolean;
};

export const useDiscussionMapper = (allAuthorsIds: string[]): DiscussionMapper => {
  const { authors, getAuthor, loading: loadingAuthors } = useAuthorsDetails(allAuthorsIds);

  return useMemo(
    () => ({
      discussionMapper: (discussion: DiscussionCardFragment) => ({
        id: discussion.id,
        url: discussion.profile.url,
        title: discussion.profile.displayName,
        category: discussion.category,
        myPrivileges: discussion.authorization?.myPrivileges,
        author: discussion.createdBy ? getAuthor(discussion.createdBy) : undefined,
        authors: authors ?? [],
        description: discussion.profile.description,
        createdAt: discussion.timestamp ? new Date(discussion.timestamp) : undefined,
        comments: {
          id: discussion.comments.id,
          messagesCount: discussion.comments.messagesCount,
          messages: [],
          myPrivileges: discussion.comments.authorization?.myPrivileges,
        },
      }),
      loading: loadingAuthors,
    }),
    [allAuthorsIds, authors, getAuthor, loadingAuthors]
  );
};
