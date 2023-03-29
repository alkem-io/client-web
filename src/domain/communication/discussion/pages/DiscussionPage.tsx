import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DiscussionsLayout from '../layout/DiscussionsLayout';
import RemoveModal from '../../../../common/components/core/RemoveModal';
import { useUserContext } from '../../../community/contributor/user';
import DiscussionView from '../views/DiscussionView';
import {
  CommunicationDiscussionMessageReceivedDocument,
  MessageDetailsFragmentDoc,
  refetchPlatformDiscussionQuery,
  refetchPlatformDiscussionsQuery,
  useDeleteDiscussionMutation,
  usePlatformDiscussionQuery,
  usePostDiscussionCommentMutation,
  useDeleteCommentMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { Discussion } from '../models/Discussion';
import { compact } from 'lodash';
import { useAuthorsDetails } from '../../communication/useAuthorsDetails';
import { Message } from '../../../shared/components/Comments/models/message';
import { Skeleton } from '@mui/material';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import TopLevelDesktopLayout from '../../../platform/ui/PageLayout/TopLevelDesktopLayout';
import RouterLink from '../../../../core/ui/link/RouterLink';
import BackButton from '../../../../core/ui/actions/BackButton';
import { FEATURE_SUBSCRIPTIONS } from '../../../platform/config/features.constants';
import { evictFromCache } from '../../../shared/utils/apollo-cache/removeFromCache';
import { useConfig } from '../../../platform/config/useConfig';
import { useNavigate } from 'react-router-dom';
import UseSubscriptionToSubEntity from '../../../shared/subscriptions/useSubscriptionToSubEntity';
import {
  CommunicationDiscussionMessageReceivedSubscription,
  CommunicationDiscussionMessageReceivedSubscriptionVariables,
  DiscussionDetailsFragment,
  MessageDetailsFragment,
} from '../../../../core/apollo/generated/graphql-schema';

const useDiscussionMessagesSubscription = UseSubscriptionToSubEntity<
  DiscussionDetailsFragment & {
    messages?: MessageDetailsFragment[];
  },
  CommunicationDiscussionMessageReceivedSubscription,
  CommunicationDiscussionMessageReceivedSubscriptionVariables
>({
  subscriptionDocument: CommunicationDiscussionMessageReceivedDocument,
  getSubscriptionVariables: discussion => ({ discussionID: discussion.id }),
  updateSubEntity: (discussion, subscriptionData, previousSubEntity) => {
    console.log('updateSubEntity:', previousSubEntity);
    console.log('discussion:', discussion, discussion?.messages, discussion?.messages?.length);
    console.log('messageReceived:', subscriptionData.communicationDiscussionMessageReceived.message);
    discussion?.messages?.push(subscriptionData.communicationDiscussionMessageReceived.message);
  },
  onUpdate: subEntity => {
    console.log('onSubEntityUpdate', subEntity);
  },
});

interface DiscussionPageProps {}

export const DiscussionPage: FC<DiscussionPageProps> = () => {
  const { discussionId } = useUrlParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { isFeatureEnabled } = useConfig();

  const {
    data,
    loading: loadingDiscussion,
    subscribeToMore,
  } = usePlatformDiscussionQuery({
    variables: {
      discussionId: discussionId!,
    },
    skip: !discussionId,
  });
  useDiscussionMessagesSubscription(data, data => data?.platform.communication.discussion, subscribeToMore);
  console.log('render', data?.platform.communication.discussion);

  const rawDiscussion = data?.platform.communication.discussion;
  const authors = useAuthorsDetails(
    compact([rawDiscussion?.createdBy, ...compact(rawDiscussion?.messages?.map(c => c.sender?.id))])
  );

  const discussion = useMemo<Discussion | undefined>(
    () =>
      rawDiscussion
        ? {
            id: rawDiscussion.id,
            title: rawDiscussion.title,
            description: rawDiscussion.description,
            category: rawDiscussion.category,
            myPrivileges: rawDiscussion.authorization?.myPrivileges,
            author: rawDiscussion.createdBy ? authors.getAuthor(rawDiscussion.createdBy) : undefined,
            authors: authors.authors ?? [],
            createdAt: rawDiscussion.timestamp ? new Date(rawDiscussion.timestamp) : undefined,
            commentsCount: rawDiscussion.commentsCount,
            comments:
              rawDiscussion.messages?.map<Message>(m => ({
                id: m.id,
                body: m.message,
                author: m.sender ? authors.getAuthor(m.sender?.id) : undefined,
                createdAt: new Date(m.timestamp),
              })) ?? [],
          }
        : undefined,
    [rawDiscussion, authors]
  );

  console.log('discussion', discussion);

  const [postComment] = usePostDiscussionCommentMutation();

  const handlePostComment = (post: string) => {
    if (!discussionId) {
      return;
    }

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
      refetchQueries: [
        refetchPlatformDiscussionQuery({
          discussionId,
        }),
      ],
      variables: {
        input: {
          discussionID: discussionId,
          message: post,
        },
      },
    });
  };

  const [deleteDiscussionId, setDeleteDiscussionId] = useState<string>();
  const [deleteCommentId, setDeleteCommentId] = useState<string>();

  const [deleteDiscussion] = useDeleteDiscussionMutation({
    refetchQueries: [refetchPlatformDiscussionsQuery()],
  });

  const handleDeleteDiscussion = async () => {
    if (!deleteDiscussionId) {
      return;
    }
    await deleteDiscussion({
      variables: {
        deleteData: {
          ID: deleteDiscussionId,
        },
      },
    });
    setDeleteDiscussionId(undefined);
    navigate('/forum');
  };

  const [deleteComment] = useDeleteCommentMutation({
    update: (cache, { data }) =>
      data?.removeMessageFromDiscussion && evictFromCache(cache, String(data.removeMessageFromDiscussion), 'Message'),
    refetchQueries: [
      refetchPlatformDiscussionQuery({
        discussionId: discussionId!,
      }),
    ],
  });

  const handleDeleteComment = async () => {
    if (!discussionId || !deleteCommentId) {
      return;
    }
    await deleteComment({
      variables: {
        messageData: {
          discussionID: discussionId,
          messageID: deleteCommentId,
        },
      },
    });
    setDeleteCommentId(undefined);
  };

  const onCancelDeleteModal = () => {
    setDeleteCommentId(undefined);
    setDeleteDiscussionId(undefined);
  };

  return (
    <TopLevelDesktopLayout>
      <DiscussionsLayout
        backButton={
          <BackButton component={RouterLink} to="/forum">
            {t('pages.forum.back')}
          </BackButton>
        }
      >
        {loadingDiscussion || !discussion ? (
          <Skeleton />
        ) : (
          <DiscussionView
            currentUserId={user?.user.id}
            discussion={discussion}
            onPostComment={handlePostComment}
            onDeleteDiscussion={() => setDeleteDiscussionId(discussionId)}
            onDeleteComment={(id: string) => setDeleteCommentId(id)}
          />
        )}
      </DiscussionsLayout>
      <RemoveModal
        show={Boolean(deleteDiscussionId)}
        onCancel={onCancelDeleteModal}
        onConfirm={handleDeleteDiscussion}
        text={t('components.discussion.delete-discussion')}
      />
      <RemoveModal
        show={Boolean(deleteCommentId)}
        onCancel={onCancelDeleteModal}
        onConfirm={handleDeleteComment}
        text={t('components.discussion.delete-comment')}
      />
    </TopLevelDesktopLayout>
  );
};

export default DiscussionPage;
