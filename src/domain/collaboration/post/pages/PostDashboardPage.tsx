import PostDashboardView from '../views/PostDashboardView';
import { PostDialogSection } from '../views/PostDialogSection';
import { DialogFooter } from '@/core/ui/dialog/DialogWithGrid';
import { PostLayout } from '../views/PostLayout';

export interface PostDashboardPageProps {
  onClose: () => void;
  postId: string | undefined;
  calloutId: string | undefined;
}

const PostDashboardPage = ({ onClose, postId, calloutId }: PostDashboardPageProps) => (
  <PostLayout currentSection={PostDialogSection.Dashboard} onClose={onClose}>
    <PostDashboardView mode="messages" postId={postId} calloutId={calloutId} />
    <DialogFooter />
  </PostLayout>
);

export default PostDashboardPage;
