import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DiscussionsLayout from '../layout/DiscussionsLayout';
import RemoveModal from '../../../../core/ui/dialogs/RemoveModal';
import { useUserContext } from '../../../community/contributor/user';
import DiscussionView from '../views/DiscussionView';
import {
  refetchPlatformDiscussionQuery,
  refetchPlatformDiscussionsQuery,
  useDeleteDiscussionMutation,
  usePlatformDiscussionQuery,
  useRemoveMessageOnRoomMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { Discussion } from '../models/Discussion';
import { compact } from 'lodash';
import { useAuthorsDetails } from '../../communication/useAuthorsDetails';
import { Message } from '../../room/models/Message';
import { Skeleton } from '@mui/material';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import TopLevelDesktopLayout from '../../../../main/ui/layout/TopLevelDesktopLayout';
import RouterLink from '../../../../core/ui/link/RouterLink';
import BackButton from '../../../../core/ui/actions/BackButton';
import { useNavigate } from 'react-router-dom';
import usePostMessageMutations from '../../room/Comments/usePostMessageMutations';
import useSubscribeOnRoomEvents from '../../../collaboration/callout/useSubscribeOnRoomEvents';

interface DiscussionPageProps {}

export const DiscussionPage: FC<DiscussionPageProps> = () => {
  const { discussionNameId } = useUrlParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserContext();

  const { data, loading: loadingDiscussion } = usePlatformDiscussionQuery({
    variables: {
      discussionId: discussionNameId!,
    },
    skip: !discussionNameId,
  });

  const isSubscribedToMessages = useSubscribeOnRoomEvents(data?.platform.communication.discussion?.comments.id);

  const rawDiscussion = data?.platform.communication.discussion;
  const authors = useAuthorsDetails(
    compact([rawDiscussion?.createdBy, ...compact(rawDiscussion?.comments.messages?.map(c => c.sender?.id))])
  );

  const discussion = useMemo<Discussion | undefined>(
    () =>
      rawDiscussion
        ? {
            id: rawDiscussion.id,
            nameID: rawDiscussion.nameID,
            title: rawDiscussion.profile.displayName,
            description: rawDiscussion.profile.description,
            category: rawDiscussion.category,
            myPrivileges: rawDiscussion.authorization?.myPrivileges,
            author: rawDiscussion.createdBy ? authors.getAuthor(rawDiscussion.createdBy) : undefined,
            authors: authors.authors ?? [],
            createdAt: rawDiscussion.timestamp ? new Date(rawDiscussion.timestamp) : undefined,
            comments: {
              id: rawDiscussion.comments.id,
              messages:
                rawDiscussion.comments.messages?.map<Message>(m => ({
                  id: m.id,
                  body: m.message,
                  author: m.sender ? authors.getAuthor(m.sender?.id) : undefined,
                  createdAt: new Date(m.timestamp),
                  threadID: m.threadID,
                  reactions: m.reactions,
                })) ?? [],
              messagesCount: rawDiscussion.comments.messagesCount,
              myPrivileges: rawDiscussion.comments.authorization?.myPrivileges,
            },
          }
        : undefined,
    [rawDiscussion, authors]
  );

  const { postMessage, postReply } = usePostMessageMutations({
    roomId: discussion?.comments.id,
    isSubscribedToMessages: isSubscribedToMessages,
  });

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

  const [deleteComment] = useRemoveMessageOnRoomMutation({
    refetchQueries: [
      refetchPlatformDiscussionQuery({
        discussionId: discussionNameId!,
      }),
    ],
  });

  const handleDeleteComment = async () => {
    if (!deleteCommentId || !discussion) {
      return;
    }
    await deleteComment({
      variables: {
        messageData: {
          roomID: discussion.comments.id,
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
            postMessage={postMessage}
            postReply={postReply}
            onDeleteDiscussion={() => setDeleteDiscussionId(discussion.id)}
            onDeleteComment={setDeleteCommentId}
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
