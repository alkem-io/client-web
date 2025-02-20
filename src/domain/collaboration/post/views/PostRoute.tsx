import { Navigate, Route, Routes } from 'react-router-dom';
import useBackToParentPage from '@/core/routing/deprecated/useBackToParentPage';
import PostDashboardPage from '../pages/PostDashboardPage';
import PostSettingsPage from '../pages/PostSettingsPage';
import PostSharePage from '../pages/PostSharePage';
import { PostDialogSection } from './PostDialogSection';
import { PostLayoutHolder } from './PostLayoutWithOutlet';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import withUrlResolverParams from '@/main/routing/urlResolver/withUrlResolverParams';

export interface PostRouteProps {
  parentPagePath: string;
}

const PostRoute = ({ parentPagePath }: PostRouteProps) => {
  const [backToExplore] = useBackToParentPage(parentPagePath, { keepScroll: true });
  const onClose = () => backToExplore();

  const { postId, calloutsSetId, calloutId } = useUrlResolver();

  return (
    <Routes>
      <Route path="/" element={<PostLayoutHolder />}>
        <Route index element={<Navigate replace to={PostDialogSection.Dashboard} state={{ keepScroll: true }} />} />
        <Route path={PostDialogSection.Dashboard} element={<PostDashboardPage postId={postId} onClose={onClose} />} />
        <Route
          path={PostDialogSection.Share}
          element={<PostSharePage calloutId={calloutId} postId={postId} onClose={onClose} />}
        />
        <Route
          path={PostDialogSection.Settings}
          element={
            <PostSettingsPage calloutsSetId={calloutsSetId} calloutId={calloutId} postId={postId} onClose={onClose} />
          }
        />
      </Route>
    </Routes>
  );
};

export default withUrlResolverParams(PostRoute);
