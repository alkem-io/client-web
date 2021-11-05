import React, { FC, useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';
import DiscussionsLayout from '../../components/composite/layout/Discussions/DiscussionsLayout';
import { useCommunityContext } from '../../context/CommunityProvider';
import { useDiscussionsContext } from '../../context/Discussions/DiscussionsProvider';
import { ThemeProviderV2 } from '../../context/ThemeProvider';
import { useUpdateNavigation, useUrlParams } from '../../hooks';
import DiscussionView from '../../views/Discussions/DiscussionView';
import { PageProps } from '../common';

interface DiscussionPageProps extends PageProps {}

export const DiscussionPage: FC<DiscussionPageProps> = ({ paths }) => {
  const { url } = useRouteMatch();

  const { discussionId } = useUrlParams();

  const { communityName } = useCommunityContext();

  const { getDiscussion, handlePostComment } = useDiscussionsContext();

  const discussion = getDiscussion(discussionId);

  const currentPaths = useMemo(
    () => [...paths, { value: url, name: discussion?.title, real: false }],
    [paths, discussion]
  );

  useUpdateNavigation({ currentPaths });

  if (!discussion) return null;

  return (
    <ThemeProviderV2>
      <DiscussionsLayout title={`${communityName}`}>
        <DiscussionView discussion={discussion} onPostComment={handlePostComment} />
      </DiscussionsLayout>
    </ThemeProviderV2>
  );
};
export default DiscussionPage;
