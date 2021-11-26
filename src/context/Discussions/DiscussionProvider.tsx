import { sortBy, uniq } from 'lodash';
import React, { FC, useContext } from 'react';
import { useApolloErrorHandler, useEcoverse, useUrlParams } from '../../hooks';
import { useAuthorsDetails } from '../../hooks/communication/useAuthorsDetails';
import {
  MessageDetailsFragmentDoc,
  refetchCommunityDiscussionListQuery,
  useCommunityDiscussionQuery,
  usePostDiscussionCommentMutation,
  useRemoveMessageFromDiscussionMutation,
} from '../../hooks/generated/graphql';
import { Comment } from '../../models/discussion/comment';
import { Discussion } from '../../models/discussion/discussion';
import { Discussion as DiscussionGraphql, Message, MessageDetailsFragment } from '../../models/graphql-schema';
import { useCommunityContext } from '../CommunityProvider';
import { evictFromCache } from '../../utils/apollo-cache/removeFromCache';

interface DiscussionContextProps {
  discussion?: Discussion;
  handlePostComment: (discussionId: string, comment: string) => Promise<void> | void;
  handleDeleteComment: (ID: DiscussionGraphql['id'], msgID: Message['id']) => Promise<void> | void;
  loading: boolean;
  posting: boolean;
  deleting: boolean;
}

const DiscussionsContext = React.createContext<DiscussionContextProps>({
  discussion: undefined,
  handlePostComment: (_discussionId, _comment) => {},
  handleDeleteComment: (_ID, _msgID) => {},
  loading: false,
  posting: false,
  deleting: false,
});

interface DiscussionProviderProps {}

const sortMessages = (messages: MessageDetailsFragment[] = []) => sortBy(messages, item => item.timestamp);

const DiscussionProvider: FC<DiscussionProviderProps> = ({ children }) => {
  const handleError = useApolloErrorHandler();
  const { discussionId } = useUrlParams();
  const { ecoverseNameId, loading: loadingEcoverse } = useEcoverse();
  const { communityId, loading: loadingCommunity } = useCommunityContext();

  const { data, loading } = useCommunityDiscussionQuery({
    variables: { ecoverseId: ecoverseNameId, communityId, discussionId },
    skip: !communityId || !ecoverseNameId || !discussionId,
  });

  const discussionData = data?.ecoverse.community?.communication?.discussion;

  const senders = uniq(discussionData?.messages?.map(m => m.sender) || []);
  const { getAuthor, authors, loading: loadingAuthors } = useAuthorsDetails(senders);

  const sortedMessages = sortMessages(discussionData?.messages || []);

  const discussion =
    discussionData &&
    ({
      id: discussionData.id,
      title: discussionData.title,
      category: discussionData.category,
      myPrivileges: discussionData.authorization?.myPrivileges ?? [],
      author: getAuthor(discussionData.createdBy || ''),
      authors: authors,
      description: discussionData.description,
      createdAt: discussionData.timestamp ? new Date(discussionData.timestamp) : new Date(),
      totalComments: sortedMessages.length,
      comments: sortedMessages.map<Comment>(m => ({
        id: m.id,
        body: m.message,
        author: getAuthor(m.sender),
        createdAt: new Date(m.timestamp),
      })),
    } as Discussion);

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

  const [deleteMessage, { loading: deletingComment }] = useRemoveMessageFromDiscussionMutation({
    update: (cache, { data }) =>
      data?.removeMessageFromDiscussion && evictFromCache(cache, String(data.removeMessageFromDiscussion), 'Message'),
    onError: handleError,
    refetchQueries: [
      refetchCommunityDiscussionListQuery({
        communityId: communityId,
        ecoverseId: ecoverseNameId,
      }),
    ],
  });

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
        discussion,
        handlePostComment,
        handleDeleteComment,
        loading: loadingEcoverse || loadingCommunity || loadingAuthors || loading,
        posting: postingComment,
        deleting: deletingComment,
      }}
    >
      {children}
    </DiscussionsContext.Provider>
  );
};

const useDiscussionContext = () => {
  return useContext(DiscussionsContext);
};

export { DiscussionProvider, DiscussionsContext, useDiscussionContext };
