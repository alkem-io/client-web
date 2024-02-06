import React, { FC } from 'react';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import PostDashboardView from '../views/PostDashboardView';
import PostDashboardContainer from '../containers/PostDashboardContainer/PostDashboardContainer';
import { PostLayout } from '../views/PostLayoutWithOutlet';
import { PostDialogSection } from '../views/PostDialogSection';
import { DialogFooter } from '../../../../core/ui/dialog/DialogWithGrid';

export interface PostDashboardPageProps {
  onClose: () => void;
}

const PostDashboardPage: FC<PostDashboardPageProps> = ({ onClose }) => {
  const { spaceNameId = '', challengeNameId, opportunityNameId, postNameId = '', calloutNameId = '' } = useUrlParams();

  return (
    <PostLayout currentSection={PostDialogSection.Dashboard} onClose={onClose}>
      <PostDashboardContainer
        spaceNameId={spaceNameId}
        postNameId={postNameId}
        challengeNameId={challengeNameId}
        opportunityNameId={opportunityNameId}
        calloutNameId={calloutNameId}
      >
        {({ post, messages, roomId, ...rest }) => (
          <PostDashboardView
            mode="messages"
            banner={post?.profile.visual?.uri}
            displayName={post?.profile.displayName}
            description={post?.profile.description}
            type={post?.type}
            tags={post?.profile.tagset?.tags}
            references={post?.profile.references}
            messages={messages}
            roomId={roomId}
            {...rest}
          />
        )}
      </PostDashboardContainer>
      <DialogFooter />
    </PostLayout>
  );
};

export default PostDashboardPage;
