import { Navigate, Route, Routes } from 'react-router-dom';
import PostDashboardPage from '../pages/PostDashboardPage';
import PostSettingsPage from '../pages/PostSettingsPage';
import PostSharePage from '../pages/PostSharePage';
import { PostDialogSection } from './PostDialogSection';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import useBackToPath from '@/core/routing/useBackToPath';

export interface PostRouteProps {
  parentPagePath: string;
}

const PostRoute = ({ parentPagePath }: PostRouteProps) => {
  const backToExplore = useBackToPath();
  const onClose = () => backToExplore(parentPagePath);

  const { postId, calloutsSetId, calloutId } = useUrlResolver();

  return (
    <Routes>
      {/* post layout is used directly into the pages here - the settings page needs to add a confirmation to the close behaviour */}
      {/* in order to achieve that we need a context with a callback to be used in this specific page that would register the extra step */}
      {/* so the layout will know about it... */}
      <Route path="/">
        <Route index element={<Navigate to={PostDialogSection.Dashboard} state={{ keepScroll: true }} />} />
        <Route
          path={PostDialogSection.Dashboard}
          element={<PostDashboardPage calloutId={calloutId} postId={postId} onClose={onClose} />}
        />
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

export default PostRoute;
