import { sortBy, uniq } from 'lodash';
import React, { FC, useContext, useMemo } from 'react';
import { useApolloErrorHandler } from '../../../../core/apollo/hooks/useApolloErrorHandler';
import { useConfig } from '../../../platform/config/useConfig';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { useHub } from '../../../challenge/hub/HubContext/useHub';
import { useAuthorsDetails } from '../../communication/useAuthorsDetails';
import {
  CommunicationDiscussionMessageReceivedDocument,
  MessageDetailsFragmentDoc,
  refetchCommunityDiscussionListQuery,
  useCommunityDiscussionQuery,
  usePostDiscussionCommentMutation,
  useRemoveMessageFromDiscussionMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { Message as Comment } from '../../../shared/components/Comments/models/message';
import { Discussion } from '../models/discussion';
import {
  CommunicationDiscussionMessageReceivedSubscription,
  CommunicationDiscussionMessageReceivedSubscriptionVariables,
  Discussion as DiscussionGraphql,
  DiscussionDetailsFragment,
  Message,
  MessageDetailsFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { evictFromCache } from '../../../shared/utils/apollo-cache/removeFromCache';
import { useCommunityContext } from '../../../community/community/CommunityContext';
import { FEATURE_SUBSCRIPTIONS } from '../../../platform/config/features.constants';
import UseSubscriptionToSubEntity from '../../../shared/subscriptions/useSubscriptionToSubEntity';
import { FetchResult } from '@apollo/client';

interface DiscussionContextProps {
  discussion?: Discussion;
  handlePostComment: (discussionId: string, comment: string) => Promise<FetchResult<unknown>> | void;
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

const sortMessages = (messages: MessageDetailsFragment[] = []) =>
  sortBy(messages, item => item.date.getUTCMilliseconds());

const useDiscussionMessagesSubscription = UseSubscriptionToSubEntity<
  DiscussionDetailsFragment & {
    messages?: MessageDetailsFragment[];
  },
  CommunicationDiscussionMessageReceivedSubscription,
  CommunicationDiscussionMessageReceivedSubscriptionVariables
>({
  subscriptionDocument: CommunicationDiscussionMessageReceivedDocument,
  getSubscriptionVariables: discussion => ({ discussionID: discussion.id }),
  updateSubEntity: (discussion, subscriptionData) => {
    discussion?.messages?.push(subscriptionData.communicationDiscussionMessageReceived.message);
  },
});

const DiscussionProvider: FC<DiscussionProviderProps> = ({ children }) => {
  const handleError = useApolloErrorHandler();
  const { isFeatureEnabled } = useConfig();
  const { discussionId = '' } = useUrlParams();
  const { hubNameId, loading: loadingHub } = useHub();
  const { communityId, loading: loadingCommunity } = useCommunityContext();

  const { data, loading, subscribeToMore } = useCommunityDiscussionQuery({
    variables: { hubId: hubNameId, communityId: communityId, discussionId: discussionId },
    skip: !communityId || !hubNameId || !discussionId,
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    onError: handleError,
  });

  useDiscussionMessagesSubscription(data, data1 => data1?.hub.community?.communication?.discussion, subscribeToMore);

  const discussionData = data?.hub.community?.communication?.discussion;

  const senders = useMemo(() => {
    if (!discussionData) return [];
    return uniq([...(discussionData.messages?.map(m => m.sender.id) || []), discussionData.createdBy]);
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
      createdAt: discussionData.date ? discussionData.date : new Date(),
      totalComments: sortedMessages.length,
      comments: sortedMessages.map<Comment>(m => ({
        id: m.id,
        body: m.message,
        author: getAuthor(m.sender.id),
        createdAt: m.date,
      })),
    } as Discussion);

  const [postComment, { loading: postingComment }] = usePostDiscussionCommentMutation();

  const handlePostComment = (discussionId: string, post: string) => {
    return postComment({
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
      onError: handleError,
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
        loading: loadingHub || loadingCommunity || loadingAuthors || loading,
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
