import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { DiscussionProvider } from '../../context/Discussions/DiscussionProvider';
import { useConfig } from '../../hooks';
import { FEATURE_COMMUNICATIONS_DISCUSSIONS } from '../../models/constants';
import { Error404, PageProps } from '../../pages';
import DiscussionListPage from '../../pages/Discussions/DiscussionListPage';
import DiscussionPage from '../../pages/Discussions/DiscussionPage';
import NewDiscussionPage from '../../pages/Discussions/NewDiscussionPage';
import { nameOfUrl } from '../url-params';

interface DiscussionsRouteProps extends PageProps {}

export const DiscussionsRoute: FC<DiscussionsRouteProps> = () => {
  const { isFeatureEnabled } = useConfig();

  if (!isFeatureEnabled(FEATURE_COMMUNICATIONS_DISCUSSIONS)) return <Error404 />;
  return (
    // DiscussionsProvider provided at EcoversePage
    <Routes>
      <Route path={'/'}>
        <Route index element={<DiscussionListPage />}></Route>
        <Route path={'new'} element={<NewDiscussionPage />}></Route>
        <Route
          path={`:${nameOfUrl.discussionId}`}
          element={
            <DiscussionProvider>
              <DiscussionPage />
            </DiscussionProvider>
          }
        >
          <Route path="*" element={<Error404 />}></Route>
        </Route>
      </Route>
    </Routes>
  );
};
export default DiscussionsRoute;
