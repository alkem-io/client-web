import React, { FC, useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';
import DiscussionsLayout from '../../components/composite/layout/Discussions/DiscussionsLayout';
import { useCommunityContext } from '../../context/CommunityProvider';
import { useDiscussionsContext } from '../../context/Discussions/DiscussionsProvider';
import { ThemeProviderV2 } from '../../context/ThemeProvider';
import { useUpdateNavigation, useUrlParams } from '../../hooks';
import { usePostDiscussionCommentMutation } from '../../hooks/generated/graphql';
import DiscussionView from '../../views/Discussions/DiscussionView';
import { PageProps } from '../common';

interface DiscussionPageProps extends PageProps {}

export const DiscussionPage: FC<DiscussionPageProps> = ({ paths }) => {
  const { url } = useRouteMatch();

  const { discussionId } = useUrlParams();

  const { communityName } = useCommunityContext();

  const { getDiscussion } = useDiscussionsContext();

  const discussion = getDiscussion(discussionId);

  const currentPaths = useMemo(
    () => [...paths, { value: url, name: discussion?.title, real: false }],
    [paths, discussion]
  );

  const [postComment] = usePostDiscussionCommentMutation();

  const handlePost = async (post: string) => {
    await postComment({
      variables: {
        input: {
          discussionID: discussionId,
          message: post,
        },
      },
    });
  };

  useUpdateNavigation({ currentPaths });

  if (!discussion) return null;

  return (
    <ThemeProviderV2>
      <DiscussionsLayout title={`${communityName}`}>
        <DiscussionView discussion={discussion} onPostComment={handlePost} />
      </DiscussionsLayout>
    </ThemeProviderV2>
  );
};
export default DiscussionPage;
