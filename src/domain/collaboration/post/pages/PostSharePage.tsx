import { PostDialogSection } from '../views/PostDialogSection';
import PostDashboardView from '../views/PostDashboardView';
import { DialogFooter } from '@/core/ui/dialog/DialogWithGrid';
import { PostLayout } from '../views/PostLayout';

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
      <PostDashboardView mode="share" postId={postId} calloutId={calloutId} />
      <DialogFooter />
    </PostLayout>
  );
};

export default PostSharePage;
