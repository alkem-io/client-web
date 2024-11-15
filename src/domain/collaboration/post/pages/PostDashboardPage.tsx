import React, { FC } from 'react';
import { useUrlParams } from '@/core/routing/useUrlParams';
import PostDashboardView from '../views/PostDashboardView';
import PostDashboardContainer from '../containers/PostDashboardContainer/PostDashboardContainer';
import { PostLayout } from '../views/PostLayoutWithOutlet';
import { PostDialogSection } from '../views/PostDialogSection';
import { DialogFooter } from '@/core/ui/dialog/DialogWithGrid';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';

export interface PostDashboardPageProps {
  onClose: () => void;
}

const PostDashboardPage: FC<PostDashboardPageProps> = ({ onClose }) => {
  const { postNameId } = useUrlParams();

  const { calloutId } = useRouteResolver();

  return (
    <PostLayout currentSection={PostDialogSection.Dashboard} onClose={onClose}>
      <PostDashboardContainer postNameId={postNameId} calloutId={calloutId}>
        {({ post, messages, roomId, ...rest }) => (
          <PostDashboardView
            mode="messages"
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

export default PostDashboardPage;
