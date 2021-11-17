import React, { FC, useMemo, useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
import DiscussionsLayout from '../../components/composite/layout/Discussions/DiscussionsLayout';
import { Loading } from '../../components/core';
import { useCommunityContext } from '../../context/CommunityProvider';
import { useDiscussionsContext } from '../../context/Discussions/DiscussionsProvider';
import { ThemeProviderV2 } from '../../context/ThemeProvider';
import { useUpdateNavigation, useUrlParams, useUserContext } from '../../hooks';
import DiscussionView from '../../views/Discussions/DiscussionView';
import { PageProps } from '../common';
import { getDiscussionCategoryIcon } from '../../utils/discussions/get-discussion-category-icon';
import RemoveModal from '../../components/core/RemoveModal';
import { useTranslation } from 'react-i18next';

interface DiscussionPageProps extends PageProps {}

export const DiscussionPage: FC<DiscussionPageProps> = ({ paths }) => {
  const { t } = useTranslation();
  const { url } = useRouteMatch();
  const { discussionId } = useUrlParams();
  const { loading: loadingCommunity } = useCommunityContext();
  const { user } = useUserContext();

  const [showDeleteDiscModal, setShowDeleteDiscModal] = useState<boolean>(false);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<string | undefined>(undefined);

  const {
    getDiscussion,
    handlePostComment,
    handleDeleteDiscussion,
    handleDeleteComment,
    loading: loadingDiscussions,
  } = useDiscussionsContext();

  const discussion = getDiscussion(discussionId);

  const currentPaths = useMemo(
    () => [...paths, { value: url, name: discussion?.title, real: false }],
    [paths, discussion]
  );

  useUpdateNavigation({ currentPaths });

  if (loadingDiscussions || loadingCommunity) return <Loading />;

  if (!discussion) return null;

  const Icon = getDiscussionCategoryIcon(discussion.category);
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

  return (
    <ThemeProviderV2>
      <DiscussionsLayout title={discussion.title} icon={<Icon />} enablePaper={false}>
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
        onConfirm={() => itemToDelete && handleDeleteDiscussion(itemToDelete)}
        text={t('components.discussion.delete-discussion')}
      />
      <RemoveModal
        show={showDeleteCommentModal}
        onCancel={onCancelModal}
        onConfirm={() => itemToDelete && handleDeleteComment(itemToDelete)}
        text={t('components.discussion.delete-comment')}
      />
    </ThemeProviderV2>
  );
};
export default DiscussionPage;
