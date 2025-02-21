import PostDashboardView from '../views/PostDashboardView';
import { PostLayout } from '../views/PostLayoutWithOutlet';
import { PostDialogSection } from '../views/PostDialogSection';
import { DialogFooter } from '@/core/ui/dialog/DialogWithGrid';

export interface PostDashboardPageProps {
  onClose: () => void;
  postId: string | undefined;
}

const PostDashboardPage = ({ onClose, postId }: PostDashboardPageProps) => (
  <PostLayout currentSection={PostDialogSection.Dashboard} onClose={onClose}>
    <PostDashboardView mode="messages" postId={postId} />
    <DialogFooter />
  </PostLayout>
);

export default PostDashboardPage;
