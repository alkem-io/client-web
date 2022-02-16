import { sortBy, uniq, merge } from 'lodash';
import React, { FC, useContext, useEffect, useMemo } from 'react';
import { ApolloError } from '@apollo/client';
import { useApolloErrorHandler, useConfig, useEcoverse, useUrlParams } from '../../hooks';
import { useAuthorsDetails } from '../../hooks/communication/useAuthorsDetails';
import {
  CommunicationDiscussionMessageReceivedDocument,
  MessageDetailsFragmentDoc,
  refetchCommunityDiscussionListQuery,
  useCommunityDiscussionQuery,
  usePostDiscussionCommentMutation,
  useRemoveMessageFromDiscussionMutation,
} from '../../hooks/generated/graphql';
import { Comment } from '../../models/discussion/comment';
import { Discussion } from '../../models/discussion/discussion';
import {
  Discussion as DiscussionGraphql,
  Message,
  MessageDetailsFragment,
  CommunicationDiscussionMessageReceivedSubscription,
  SubscriptionCommunicationDiscussionMessageReceivedArgs,
} from '../../models/graphql-schema';
import { evictFromCache } from '../../utils/apollo-cache/removeFromCache';
import { useCommunityContext } from '../CommunityProvider';
import { FEATURE_SUBSCRIPTIONS } from '../../models/constants';

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
  const { isFeatureEnabled } = useConfig();
  const { discussionId = '' } = useUrlParams();
  const { hubNameId, loading: loadingEcoverse } = useEcoverse();
  const { communityId, loading: loadingCommunity } = useCommunityContext();

  const { data, loading, subscribeToMore } = useCommunityDiscussionQuery({
    variables: { hubId: hubNameId, communityId: communityId, discussionId: discussionId },
    skip: !communityId || !hubNameId || !discussionId,
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    onError: handleError,
  });

  useEffect(() => {
    if (!isFeatureEnabled(FEATURE_SUBSCRIPTIONS) || !discussionId) {
      return;
    }

    const unSubscribe = subscribeToMore<
      CommunicationDiscussionMessageReceivedSubscription,
      SubscriptionCommunicationDiscussionMessageReceivedArgs
    >({
      document: CommunicationDiscussionMessageReceivedDocument,
      variables: { discussionID: discussionId },
      onError: err => handleError(new ApolloError({ errorMessage: err.message })),
      updateQuery: (prev, { subscriptionData }) => {
        const discussion = prev?.hub?.community?.communication?.discussion;

        if (!discussion) {
          return prev;
        }

        const currentMessages = discussion.messages ?? [];
        const newMessage = subscriptionData.data.communicationDiscussionMessageReceived.message;

        return merge({}, prev, {
          hub: {
            community: {
              communication: {
                discussion: {
                  messages: [...currentMessages, newMessage],
                },
              },
            },
          },
        });
      },
    });
    return () => unSubscribe && unSubscribe();
  }, [isFeatureEnabled, subscribeToMore, discussionId]);

  const discussionData = data?.hub.community?.communication?.discussion;

  const senders = useMemo(() => {
    if (!discussionData) return [];
    return uniq([...(discussionData.messages?.map(m => m.sender) || []), discussionData.createdBy]);
  }, [discussionData]);
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
      update: (cache, { data }) => {
        if (isFeatureEnabled(FEATURE_SUBSCRIPTIONS)) {
          return;
        }
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
        hubId: hubNameId,
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
