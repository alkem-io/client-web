import PostDashboardView from '../views/PostDashboardView';
import { PostDialogSection } from '../views/PostDialogSection';
import { DialogFooter } from '@/core/ui/dialog/DialogWithGrid';
import { PostLayout } from '../views/PostLayout';

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
