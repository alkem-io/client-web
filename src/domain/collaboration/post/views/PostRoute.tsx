import React, { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';
import useBackToParentPage from '@core/routing/deprecated/useBackToParentPage';
import PostDashboardPage from '../pages/PostDashboardPage';
import PostSettingsPage from '../pages/PostSettingsPage';
import PostSharePage from '../pages/PostSharePage';
import { PostDialogSection } from './PostDialogSection';
import { PostLayoutHolder } from './PostLayoutWithOutlet';

export interface PostRouteProps {
  parentPagePath: string;
  journeyTypeName: JourneyTypeName;
}

const PostRoute: FC<PostRouteProps> = ({ parentPagePath, journeyTypeName }) => {
  const [backToExplore] = useBackToParentPage(parentPagePath, { keepScroll: true });
  const onClose = () => backToExplore();

  return (
    <Routes>
      <Route path="/" element={<PostLayoutHolder />}>
        <Route index element={<Navigate replace to={PostDialogSection.Dashboard} state={{ keepScroll: true }} />} />
        <Route path={PostDialogSection.Dashboard} element={<PostDashboardPage onClose={onClose} />} />
        <Route path={PostDialogSection.Share} element={<PostSharePage onClose={onClose} />} />
        <Route
          path={PostDialogSection.Settings}
          element={<PostSettingsPage onClose={onClose} journeyTypeName={journeyTypeName} />}
        />
      </Route>
    </Routes>
  );
};

export default PostRoute;
