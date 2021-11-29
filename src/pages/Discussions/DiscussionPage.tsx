import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouteMatch } from 'react-router-dom';
import DiscussionIcon from '../../components/composite/entities/Communication/DiscussionIcon';
import DiscussionsLayout from '../../components/composite/layout/Discussions/DiscussionsLayout';
import { Loading } from '../../components/core';
import RemoveModal from '../../components/core/RemoveModal';
import { useCommunityContext } from '../../context/CommunityProvider';
import { useDiscussionContext } from '../../context/Discussions/DiscussionProvider';
import { useDiscussionsContext } from '../../context/Discussions/DiscussionsProvider';
import { useUpdateNavigation, useUserContext } from '../../hooks';
import DiscussionView from '../../views/Discussions/DiscussionView';
import { PageProps } from '../common';

interface DiscussionPageProps extends PageProps {}

export const DiscussionPage: FC<DiscussionPageProps> = ({ paths }) => {
  const { t } = useTranslation();
  const { url } = useRouteMatch();
  const { loading: loadingCommunity } = useCommunityContext();
  const { user } = useUserContext();

  const [showDeleteDiscModal, setShowDeleteDiscModal] = useState<boolean>(false);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState<boolean>(false);
  // holds the ID of discussion or comment for deletion after the dialog is confirmed
  const [itemToDelete, setItemToDelete] = useState<string | undefined>(undefined);

  const { discussion, handlePostComment, handleDeleteComment, loading: loadingDiscussions } = useDiscussionContext();
  const { handleDeleteDiscussion } = useDiscussionsContext();

  const currentPaths = useMemo(
    () => [...paths, { value: url, name: discussion?.title, real: false }],
    [paths, discussion]
  );

  useUpdateNavigation({ currentPaths });

  if (loadingDiscussions || loadingCommunity) return <Loading />;

  if (!discussion) return null;

  const currentUserId = user?.user.id;

  const deleteDiscussionHandler = (id: string) => {
    setItemToDelete(id);
    setShowDeleteDiscModal(true);
  };

  const deleteCommentHandler = (id: string) => {
    setItemToDelete(id);
    setShowDeleteCommentModal(true);
  };

  const onCancelModal = () => {
    setShowDeleteDiscModal(false);
    setShowDeleteCommentModal(false);
    setItemToDelete(undefined);
  };

  const onConfirmDiscDialog = () => {
    if (itemToDelete) {
      handleDeleteDiscussion(itemToDelete);
      setShowDeleteDiscModal(false);
    }
  };

  const onConfirmCommentDialog = () => {
    if (itemToDelete) {
      handleDeleteComment(discussion.id, itemToDelete);
      setShowDeleteCommentModal(false);
    }
  };

  return (
    <>
      <DiscussionsLayout
        title={discussion.title}
        icon={<DiscussionIcon category={discussion.category} />}
        enablePaper={false}
      >
        <DiscussionView
          currentUserId={currentUserId}
          discussion={discussion}
          onPostComment={handlePostComment}
          onDeleteDiscussion={deleteDiscussionHandler}
          onDeleteComment={deleteCommentHandler}
        />
      </DiscussionsLayout>
      <RemoveModal
        show={showDeleteDiscModal}
        onCancel={onCancelModal}
        onConfirm={onConfirmDiscDialog}
        text={t('components.discussion.delete-discussion')}
      />
      <RemoveModal
        show={showDeleteCommentModal}
        onCancel={onCancelModal}
        onConfirm={onConfirmCommentDialog}
        text={t('components.discussion.delete-comment')}
      />
    </>
  );
};
export default DiscussionPage;
