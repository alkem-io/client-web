import { sortBy, uniq } from 'lodash';
import React, { FC, useCallback, useContext, useMemo, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useApolloErrorHandler, useEcoverse } from '../../hooks';
import {
  MessageDetailsFragmentDoc,
  refetchCommunityDiscussionListQuery,
  useAuthorDetailsQuery,
  useCommunityDiscussionListQuery,
  useCreateDiscussionMutation,
  useDeleteDiscussionMutation,
  usePostDiscussionCommentMutation,
  useRemoveMessageFromDiscussionMutation,
} from '../../hooks/generated/graphql';
import { Author } from '../../models/discussion/author';
import { Comment } from '../../models/discussion/comment';
import { Discussion } from '../../models/discussion/discussion';
import { DiscussionCategoryExt, DiscussionCategoryExtEnum } from '../../models/enums/DiscussionCategoriesExt';
import {
  AuthorizationPrivilege,
  Discussion as DiscussionGraphql,
  DiscussionCategory,
  Message,
  MessageDetailsFragment,
} from '../../models/graphql-schema';
import { buildUserProfileUrl } from '../../utils/urlBuilders';
import { useCommunityContext } from '../CommunityProvider';

interface Permissions {
  canCreateDiscussion: boolean;
}

interface DiscussionContextProps {
  discussionList: Discussion[];
  getDiscussion: (id: string) => Discussion | undefined;
  handlePostComment: (discussionId: string, comment: string) => Promise<void> | void;
  handleCreateDiscussion: (title: string, category: DiscussionCategory, description: string) => Promise<void> | void;
  handleDeleteDiscussion: (ID: DiscussionGraphql['id']) => Promise<void> | void;
  handleDeleteComment: (ID: DiscussionGraphql['id'], msgID: Message['id']) => Promise<void> | void;
  permissions: Permissions;
  loading: boolean;
  posting: boolean;
  deleting: boolean;
}

const DiscussionsContext = React.createContext<DiscussionContextProps>({
  discussionList: [],
  getDiscussion: (_id: string) => undefined, // might be handled better;
  handlePostComment: (_discussionId, _comment) => {},
  handleCreateDiscussion: (_title, _category, _description) => {},
  handleDeleteDiscussion: _ID => {},
  handleDeleteComment: (_ID, _msgID) => {},
  permissions: {
    canCreateDiscussion: false,
  },
  loading: false,
  posting: false,
  deleting: false,
});

interface DiscussionProviderProps {}

const sortMessages = (messages: MessageDetailsFragment[] = []) => sortBy(messages, item => item.timestamp);

const DiscussionsProvider: FC<DiscussionProviderProps> = ({ children }) => {
  const history = useHistory();
  const handleError = useApolloErrorHandler();
  const { ecoverseNameId, loading: loadingEcoverse } = useEcoverse();
  const { communityId, communicationId, loading: loadingCommunity } = useCommunityContext();
  const { url } = useRouteMatch();
  const { data, loading: loadingDiscussionList } = useCommunityDiscussionListQuery({
    variables: {
      ecoverseId: ecoverseNameId,
      communityId: communityId || '',
    },
    skip: !ecoverseNameId || !communityId,
  });

  const discussions = data?.ecoverse.community?.communication?.discussions || [];

  const senders = uniq(discussions.flatMap(d => d.messages?.map(m => m.sender) || []));

  const { data: authorData, loading: loadingAvatars } = useAuthorDetailsQuery({
    variables: { ids: senders },
    skip: senders.length === 0,
  });

  const authors = useMemo(
    () =>
      authorData?.usersById.map<Author>(a => ({
        id: a.id,
        displayName: a.displayName,
        firstName: a.firstName,
        lastName: a.lastName,
        avatarUrl: a.profile?.avatar || '',
        url: buildUserProfileUrl(a.nameID),
      })),
    [authorData]
  );

  const getAuthor = useCallback((senderId: string) => authors?.find(a => a.id === senderId), [authors]);
  const getAuthors = useCallback(
    (senderIds: string[]) => authors?.filter(a => senderIds.includes(a.id)) || [],
    [authors]
  );

  const discussionList = discussions.map<Discussion>(x => {
    const sortedMessages = sortMessages(x.messages);
    const firstMessage = sortedMessages[0];

    return {
      id: x.id,
      title: x.title,
      category: x.category,
      myPrivileges: x.authorization?.myPrivileges ?? [],
      author: getAuthor(firstMessage?.sender || ''),
      authors: getAuthors(sortedMessages.map(m => m.sender)),
      description: firstMessage?.message || '',
      createdAt: firstMessage ? new Date(firstMessage.timestamp) : new Date(),
      totalComments: sortedMessages.slice(1).length,
      comments: sortedMessages.slice(1).map<Comment>(m => ({
        id: m.id,
        body: m.message,
        author: getAuthor(m.sender),
        createdAt: new Date(m.timestamp),
      })),
    };
  });

  const getDiscussion = useCallback((id: string) => discussionList.find(x => x.id === id), [discussionList]);

  const [postComment, { loading: postingComment }] = usePostDiscussionCommentMutation();

  const handlePostComment = async (discussionId: string, post: string) => {
    await postComment({
      update(cache, { data }) {
        cache.modify({
          id: cache.identify({
            id: discussionId,
            __typename: 'Discussion',
          }),
          fields: {
            messages(existingMessages = []) {
              if (data) {
                const newMessage = cache.writeFragment({
                  data: data?.sendMessageToDiscussion,
                  fragment: MessageDetailsFragmentDoc,
                });
                return [...existingMessages, newMessage];
              }
              return existingMessages;
            },
          },
        });
      },
      variables: {
        input: {
          discussionID: discussionId,
          message: post,
        },
      },
    });
  };

  const permissions: Permissions = useMemo(
    () => ({
      canCreateDiscussion:
        data?.ecoverse.community?.communication?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Create) ||
        false,
    }),
    [data]
  );

  const [createDiscussion, { loading: creatingDiscussion }] = useCreateDiscussionMutation({
    onCompleted: data => {
      history.replace(`${url}/${data.createDiscussion.id}`);
    },
    onError: handleError,
    refetchQueries: [
      refetchCommunityDiscussionListQuery({
        communityId: communityId,
        ecoverseId: ecoverseNameId,
      }),
    ],
  });

  const [deleteDiscussion, { loading: deletingDiscussion }] = useDeleteDiscussionMutation({
    onCompleted: () => {
      history.replace(`${url}`);
    },
    onError: handleError,
    refetchQueries: [
      refetchCommunityDiscussionListQuery({
        communityId: communityId,
        ecoverseId: ecoverseNameId,
      }),
    ],
  });

  const [deleteMessage, { loading: deletingComment }] = useRemoveMessageFromDiscussionMutation({
    onError: handleError,
    refetchQueries: [
      refetchCommunityDiscussionListQuery({
        communityId: communityId,
        ecoverseId: ecoverseNameId,
      }),
    ],
  });

  const handleCreateDiscussion = async (title: string, category: DiscussionCategory, description: string) => {
    await createDiscussion({
      variables: {
        input: {
          communicationID: communicationId,
          description: description,
          title: title,
          category: category,
        },
      },
    });
  };

  const handleDeleteDiscussion = async (ID: string) => {
    await deleteDiscussion({
      variables: {
        deleteData: {
          ID,
        },
      },
    });
  };

  const handleDeleteComment = async (ID: string, msgID: string) => {
    await deleteMessage({
      variables: {
        messageData: {
          discussionID: ID,
          messageID: msgID,
        },
      },
    });
  };

  return (
    <DiscussionsContext.Provider
      value={{
        discussionList,
        getDiscussion,
        handlePostComment,
        handleCreateDiscussion,
        permissions,
        handleDeleteDiscussion,
        handleDeleteComment,
        loading: loadingEcoverse || loadingCommunity || loadingDiscussionList || loadingAvatars,
        posting: postingComment || creatingDiscussion,
        deleting: deletingDiscussion || deletingComment,
      }}
    >
      {children}
    </DiscussionsContext.Provider>
  );
};

const useDiscussionsContext = () => {
  return useContext(DiscussionsContext);
};

const useDiscussionCategoryFilter = (discussions: Discussion[]) => {
  const [categoryFilter, setCategoryFilter] = useState<DiscussionCategoryExt>(DiscussionCategoryExtEnum.All);
  const filtered = useMemo(() => {
    return discussions.filter(d => categoryFilter === DiscussionCategoryExtEnum.All || d.category === categoryFilter);
  }, [discussions, categoryFilter]);
  return { filtered, categoryFilter, setCategoryFilter };
};

export { DiscussionsProvider, DiscussionsContext, useDiscussionsContext, useDiscussionCategoryFilter };
