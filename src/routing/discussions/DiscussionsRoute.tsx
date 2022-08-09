import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { DiscussionProvider } from '../../context/Discussions/DiscussionProvider';
import { useConfig } from '../../hooks';
import { FEATURE_COMMUNICATIONS_DISCUSSIONS } from '../../models/constants';
import { Error404, PageProps } from '../../pages';
import DiscussionListPage from '../../pages/Discussions/DiscussionListPage';
import DiscussionPage from '../../pages/Discussions/DiscussionPage';
import NewDiscussionPage from '../../pages/Discussions/NewDiscussionPage';
import { nameOfUrl } from '../url-params';
import { DiscussionsProvider } from '../../context/Discussions/DiscussionsProvider';

interface DiscussionsRouteProps extends PageProps {}

export const DiscussionsRoute: FC<DiscussionsRouteProps> = ({ paths }) => {
  const { isFeatureEnabled } = useConfig();
  const { pathname } = useResolvedPath('.');

  const currentPaths = useMemo(() => [...paths, { value: pathname, name: 'discussions', real: true }], [paths]);

  if (!isFeatureEnabled(FEATURE_COMMUNICATIONS_DISCUSSIONS)) return <Error404 />;
  return (
    <Routes>
      <Route path={'/'}>
        <Route
          index
          element={
            <DiscussionsProvider>
              <DiscussionListPage paths={currentPaths} />
            </DiscussionsProvider>
          }
        />
        <Route
          path={'new'}
          element={
            <DiscussionsProvider>
              <NewDiscussionPage paths={currentPaths} />
            </DiscussionsProvider>
          }
        />
        <Route
          path={`:${nameOfUrl.discussionId}`}
          element={
            <DiscussionsProvider>
              <DiscussionProvider>
                <DiscussionPage paths={currentPaths} />
              </DiscussionProvider>
            </DiscussionsProvider>
          }
        >
          <Route path="*" element={<Error404 />} />
        </Route>
      </Route>
    </Routes>
  );
};
export default DiscussionsRoute;
