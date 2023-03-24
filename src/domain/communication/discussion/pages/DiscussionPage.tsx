import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DiscussionsLayout from '../layout/DiscussionsLayout';
import { Loading } from '../../../../common/components/core';
import RemoveModal from '../../../../common/components/core/RemoveModal';
import { useCommunityContext } from '../../../community/community/CommunityContext';
import { useDiscussionContext } from '../providers/DiscussionProvider';
import { useDiscussionsContext } from '../providers/DiscussionsProvider';
import { useUserContext } from '../../../community/contributor/user';
import { useUpdateNavigation } from '../../../../core/routing/useNavigation';
import DiscussionView from '../views/DiscussionView';
import { PageProps } from '../../../shared/types/PageProps';

interface DiscussionPageProps extends PageProps {}
/**
 * @deprecated
 */
export const DiscussionPage: FC<DiscussionPageProps> = ({ paths }) => {
  const { t } = useTranslation();
  const { loading: loadingCommunity } = useCommunityContext();
  const { user } = useUserContext();

  const [showDeleteDiscModal, setShowDeleteDiscModal] = useState<boolean>(false);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState<boolean>(false);
  // holds the ID of discussion or comment for deletion after the dialog is confirmed
  const [itemToDelete, setItemToDelete] = useState<string | undefined>(undefined);

  const { discussion, handlePostComment, handleDeleteComment, loading: loadingDiscussions } = useDiscussionContext();
  const { handleDeleteDiscussion } = useDiscussionsContext();

  const currentPaths = useMemo(
    () => [...paths, { value: '', name: discussion?.title ?? '', real: false }],
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
      <DiscussionsLayout>
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
