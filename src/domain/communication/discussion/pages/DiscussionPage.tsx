import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DiscussionsLayout from '../layout/DiscussionsLayout';
import RemoveModal from '@/core/ui/dialogs/RemoveModal';
import { useCurrentUserContext } from '@/domain/community/user';
import DiscussionView from '../views/DiscussionView';
import {
  refetchPlatformDiscussionQuery,
  refetchPlatformDiscussionsQuery,
  useDeleteDiscussionMutation,
  usePlatformDiscussionQuery,
  useRemoveMessageOnRoomMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { Discussion } from '../models/Discussion';
import { compact } from 'lodash';
import { useAuthorsDetails } from '@/domain/communication/communication/useAuthorsDetails';
import { Message } from '@/domain/communication/room/models/Message';
import { Skeleton } from '@mui/material';
import TopLevelPageLayout from '@/main/ui/layout/topLevelPageLayout/TopLevelPageLayout';
import RouterLink from '@/core/ui/link/RouterLink';
import BackButton from '@/core/ui/actions/BackButton';
import usePostMessageMutations from '@/domain/communication/room/Comments/usePostMessageMutations';
import useSubscribeOnRoomEvents from '@/domain/collaboration/callout/useSubscribeOnRoomEvents';
import { ForumOutlined } from '@mui/icons-material';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import TopLevelPageBreadcrumbs from '@/main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import UpdateDiscussionDialog from '../views/UpdateDiscussionDialog';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import useNavigate from '@/core/routing/useNavigate';

export const DiscussionPage = ({ discussionId, loading }: { discussionId: string | undefined; loading: boolean }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userModel } = useCurrentUserContext();

  const { data, loading: loadingDiscussion } = usePlatformDiscussionQuery({
    variables: {
      discussionId: discussionId!,
    },
    skip: !discussionId,
  });

  const isSubscribedToMessages = useSubscribeOnRoomEvents(data?.platform.forum.discussion?.comments.id);

  const rawDiscussion = data?.platform.forum.discussion;

  const authors = useAuthorsDetails(
    compact([rawDiscussion?.createdBy, ...compact(rawDiscussion?.comments.messages?.map(c => c.sender?.id))])
  );

  const discussion = useMemo<Discussion | undefined>(
    () =>
      rawDiscussion
        ? {
            id: rawDiscussion.id,
            url: rawDiscussion.profile.url,
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
                  message: m.message,
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

  const [updateDiscussionId, setUpdateDiscussionId] = useState<string>();
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
        discussionId: discussionId!,
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
    <StorageConfigContextProvider locationType="platform">
      <TopLevelPageLayout
        title={t('pages.forum.title')}
        subtitle={t('pages.forum.subtitle')}
        iconComponent={ForumOutlined}
        breadcrumbs={
          <TopLevelPageBreadcrumbs>
            <BreadcrumbsItem uri="/forum" iconComponent={ForumOutlined}>
              {t('pages.forum.shortName')}
            </BreadcrumbsItem>
            <BreadcrumbsItem iconComponent={ForumOutlined}>{discussion?.title}</BreadcrumbsItem>
          </TopLevelPageBreadcrumbs>
        }
      >
        <DiscussionsLayout
          backButton={
            <BackButton component={RouterLink} to="/forum">
              {t('pages.forum.back')}
            </BackButton>
          }
        >
          {loading || loadingDiscussion || !discussion ? (
            <Skeleton />
          ) : (
            <DiscussionView
              currentUserId={userModel?.id}
              discussion={discussion}
              postMessage={postMessage}
              postReply={postReply}
              onUpdateDiscussion={() => setUpdateDiscussionId(discussion.id)}
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
        {discussion && (
          <UpdateDiscussionDialog
            open={Boolean(updateDiscussionId)}
            onClose={() => setUpdateDiscussionId(undefined)}
            discussion={discussion}
          />
        )}
      </TopLevelPageLayout>
    </StorageConfigContextProvider>
  );
};

export default DiscussionPage;
