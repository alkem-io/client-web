import React, { FC } from 'react';
import { PostLayout } from '../views/PostLayoutWithOutlet';
import { PostDialogSection } from '../views/PostDialogSection';
import PostDashboardContainer from '../containers/PostDashboardContainer/PostDashboardContainer';
import PostDashboardView from '../views/PostDashboardView';
import { DialogFooter } from '../../../../core/ui/dialog/DialogWithGrid';

export interface PostSharePageProps {
  onClose: () => void;
  calloutId: string | undefined;
  postNameId: string | undefined;
}

const PostSharePage: FC<PostSharePageProps> = ({ onClose, postNameId, calloutId }) => {
  if (!postNameId) {
    throw new Error('Must be within a Post route');
  }

  return (
    <PostLayout currentSection={PostDialogSection.Share} onClose={onClose}>
      <PostDashboardContainer calloutId={calloutId} postNameId={postNameId}>
        {({ post, messages, roomId, ...rest }) => (
          <PostDashboardView
            mode="share"
            banner={post?.profile.visual?.uri}
            displayName={post?.profile.displayName}
            description={post?.profile.description}
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
