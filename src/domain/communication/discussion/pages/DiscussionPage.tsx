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
  useRemoveMessageFromDiscussionMutation,
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
  updateSubEntity: (discussion, subscriptionData) => {
    discussion?.messages?.push(subscriptionData.communicationDiscussionMessageReceived.message);
  },
});

interface DiscussionPageProps {}

export const DiscussionPage: FC<DiscussionPageProps> = () => {
  const { t } = useTranslation();
  const { discussionId } = useUrlParams();
  const { user } = useUserContext();
  const { isFeatureEnabled } = useConfig();
  const navigate = useNavigate();

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

  const [showDeleteDiscussionModal, setShowDeleteDiscussionModal] = useState<boolean>(false);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState<boolean>(false);
  // holds the ID of discussion or comment for deletion after the dialog is confirmed
  const [itemToDelete, setItemToDelete] = useState<string | undefined>(undefined);

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

  const [deleteMessage] = useRemoveMessageFromDiscussionMutation({
    update: (cache, { data }) =>
      data?.removeMessageFromDiscussion && evictFromCache(cache, String(data.removeMessageFromDiscussion), 'Message'),
    refetchQueries: [
      refetchPlatformDiscussionQuery({
        discussionId: discussionId!,
      }),
    ],
  });

  const handleDeleteComment = async (msgID: string) => {
    if (!discussionId) {
      return;
    }
    await deleteMessage({
      variables: {
        messageData: {
          discussionID: discussionId,
          messageID: msgID,
        },
      },
    });
  };

  const [deleteDiscussion] = useDeleteDiscussionMutation({
    onCompleted: () => navigate('/forum'),
    refetchQueries: [refetchPlatformDiscussionsQuery()],
  });

  const handleDeleteDiscussion = async () => {
    if (!discussionId) {
      return;
    }
    await deleteDiscussion({
      variables: {
        deleteData: {
          ID: discussionId,
        },
      },
    });
  };

  const currentUserId = user?.user.id;

  const deleteDiscussionHandler = (id: string) => {
    setItemToDelete(id);
    setShowDeleteDiscussionModal(true);
  };

  const deleteCommentHandler = (id: string) => {
    setItemToDelete(id);
    setShowDeleteCommentModal(true);
  };

  const onCancelModal = () => {
    setShowDeleteDiscussionModal(false);
    setShowDeleteCommentModal(false);
    setItemToDelete(undefined);
  };

  const onConfirmDiscussionDialog = () => {
    handleDeleteDiscussion();
    setShowDeleteDiscussionModal(false);
  };

  const onConfirmCommentDialog = () => {
    if (itemToDelete) {
      handleDeleteComment(itemToDelete);
      setShowDeleteCommentModal(false);
    }
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
            currentUserId={currentUserId}
            discussion={discussion}
            onPostComment={handlePostComment}
            onDeleteDiscussion={deleteDiscussionHandler}
            onDeleteComment={deleteCommentHandler}
          />
        )}
      </DiscussionsLayout>
      <RemoveModal
        show={showDeleteDiscussionModal}
        onCancel={onCancelModal}
        onConfirm={onConfirmDiscussionDialog}
        text={t('components.discussion.delete-discussion')}
      />
      <RemoveModal
        show={showDeleteCommentModal}
        onCancel={onCancelModal}
        onConfirm={onConfirmCommentDialog}
        text={t('components.discussion.delete-comment')}
      />
    </TopLevelDesktopLayout>
  );
};

export default DiscussionPage;
