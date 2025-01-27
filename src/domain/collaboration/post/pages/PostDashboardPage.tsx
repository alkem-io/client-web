import PostDashboardView from '../views/PostDashboardView';
import PostDashboardContainer from '../containers/PostDashboardContainer/PostDashboardContainer';
import { PostLayout } from '../views/PostLayoutWithOutlet';
import { PostDialogSection } from '../views/PostDialogSection';
import { DialogFooter } from '@/core/ui/dialog/DialogWithGrid';

export interface PostDashboardPageProps {
  onClose: () => void;
  calloutId: string | undefined;
  postId: string | undefined;
}

const PostDashboardPage = ({ onClose, postId, calloutId }: PostDashboardPageProps) => (
  <PostLayout currentSection={PostDialogSection.Dashboard} onClose={onClose}>
    <PostDashboardContainer postId={postId} calloutId={calloutId}>
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

export default PostDashboardPage;
