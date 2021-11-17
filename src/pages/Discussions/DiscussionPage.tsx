import React, { FC, useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';
import DiscussionsLayout from '../../components/composite/layout/Discussions/DiscussionsLayout';
import { Loading } from '../../components/core';
import { useCommunityContext } from '../../context/CommunityProvider';
import { useDiscussionsContext } from '../../context/Discussions/DiscussionsProvider';
import { ThemeProviderV2 } from '../../context/ThemeProvider';
import { useUpdateNavigation, useUrlParams } from '../../hooks';
import DiscussionView from '../../views/Discussions/DiscussionView';
import { PageProps } from '../common';
import { getDiscussionCategoryIcon } from '../../utils/discussions/get-discussion-category-icon';

interface DiscussionPageProps extends PageProps {}

export const DiscussionPage: FC<DiscussionPageProps> = ({ paths }) => {
  const { url } = useRouteMatch();

  const { discussionId } = useUrlParams();

  const { loading: loadingCommunity } = useCommunityContext();

  const { getDiscussion, handlePostComment, loading: loadingDiscussions } = useDiscussionsContext();

  const discussion = getDiscussion(discussionId);

  const currentPaths = useMemo(
    () => [...paths, { value: url, name: discussion?.title, real: false }],
    [paths, discussion]
  );

  useUpdateNavigation({ currentPaths });

  if (loadingDiscussions || loadingCommunity) return <Loading />;

  if (!discussion) return null;

  const Icon = getDiscussionCategoryIcon(discussion.category);

  return (
    <ThemeProviderV2>
      <DiscussionsLayout title={discussion.title} icon={<Icon />} enablePaper={false}>
        <DiscussionView discussion={discussion} onPostComment={handlePostComment} />
      </DiscussionsLayout>
    </ThemeProviderV2>
  );
};
export default DiscussionPage;
