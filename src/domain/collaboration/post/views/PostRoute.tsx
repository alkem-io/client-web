import React, { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';
import useBackToParentPage from '../../../../core/routing/deprecated/useBackToParentPage';
import PostDashboardPage from '../pages/PostDashboardPage';
import PostSettingsPage from '../pages/PostSettingsPage';
import PostSharePage from '../pages/PostSharePage';
import { PostDialogSection } from './PostDialogSection';
import { PostLayoutHolder } from './PostLayoutWithOutlet';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';

export interface PostRouteProps {
  parentPagePath: string;
  journeyTypeName: JourneyTypeName;
}

const PostRoute: FC<PostRouteProps> = ({ parentPagePath, journeyTypeName }) => {
  const [backToExplore] = useBackToParentPage(parentPagePath, { keepScroll: true });
  const onClose = () => backToExplore();

  const { postNameId } = useUrlParams();
  const { calloutId, collaborationId } = useRouteResolver();

  return (
    <Routes>
      <Route path="/" element={<PostLayoutHolder />}>
        <Route index element={<Navigate replace to={PostDialogSection.Dashboard} state={{ keepScroll: true }} />} />
        <Route
          path={PostDialogSection.Dashboard}
          element={<PostDashboardPage calloutId={calloutId} postNameId={postNameId} onClose={onClose} />}
        />
        <Route
          path={PostDialogSection.Share}
          element={<PostSharePage calloutId={calloutId} postNameId={postNameId} onClose={onClose} />}
        />
        <Route
          path={PostDialogSection.Settings}
          element={
            <PostSettingsPage
              collaborationId={collaborationId}
              calloutId={calloutId}
              postNameId={postNameId}
              onClose={onClose}
              journeyTypeName={journeyTypeName}
            />
          }
        />
      </Route>
    </Routes>
  );
};

export default PostRoute;
