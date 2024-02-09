import React, { FC } from 'react';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { PostLayout } from '../views/PostLayoutWithOutlet';
import { PostDialogSection } from '../views/PostDialogSection';
import PostDashboardContainer from '../containers/PostDashboardContainer/PostDashboardContainer';
import PostDashboardView from '../views/PostDashboardView';
import { DialogFooter } from '../../../../core/ui/dialog/DialogWithGrid';

export interface PostSharePageProps {
  onClose: () => void;
}

const PostSharePage: FC<PostSharePageProps> = ({ onClose }) => {
  const { spaceNameId = '', challengeNameId, opportunityNameId, postNameId = '', calloutNameId = '' } = useUrlParams();

  return (
    <PostLayout currentSection={PostDialogSection.Share} onClose={onClose}>
      <PostDashboardContainer
        spaceNameId={spaceNameId}
        postNameId={postNameId}
        challengeNameId={challengeNameId}
        opportunityNameId={opportunityNameId}
        calloutNameId={calloutNameId}
      >
        {({ post, messages, roomId, ...rest }) => (
          <PostDashboardView
            mode="share"
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

export default PostSharePage;
