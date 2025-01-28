import { PostLayout } from '../views/PostLayoutWithOutlet';
import { PostDialogSection } from '../views/PostDialogSection';
import PostDashboardContainer from '../containers/PostDashboardContainer/PostDashboardContainer';
import PostDashboardView from '../views/PostDashboardView';
import { DialogFooter } from '@/core/ui/dialog/DialogWithGrid';

export interface PostSharePageProps {
  onClose: () => void;
  calloutId: string | undefined;
  postId: string | undefined;
}

const PostSharePage = ({ onClose, postId, calloutId }: PostSharePageProps) => {
  if (!postId) {
    throw new Error('Must be within a Post route');
  }

  return (
    <PostLayout currentSection={PostDialogSection.Share} onClose={onClose}>
      <PostDashboardContainer calloutId={calloutId} postId={postId}>
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
