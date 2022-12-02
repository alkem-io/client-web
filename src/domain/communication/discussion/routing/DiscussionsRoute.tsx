import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { DiscussionProvider } from '../providers/DiscussionProvider';
import { useConfig } from '../../../../hooks';
import { FEATURE_COMMUNICATIONS_DISCUSSIONS } from '../../../platform/config/features.constants';
import { PageProps } from '../../../shared/types/PageProps';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import DiscussionListPage from '../pages/DiscussionListPage';
import DiscussionPage from '../pages/DiscussionPage';
import NewDiscussionPage from '../pages/NewDiscussionPage';
import { nameOfUrl } from '../../../../core/routing/url-params';
import { DiscussionsProvider } from '../providers/DiscussionsProvider';

interface DiscussionsRouteProps extends PageProps {}

export const DiscussionsRoute: FC<DiscussionsRouteProps> = ({ paths }) => {
  const { isFeatureEnabled } = useConfig();
  const { pathname } = useResolvedPath('.');

  const currentPaths = useMemo(
    () => [...paths, { value: pathname, name: 'discussions', real: true }],
    [paths, pathname]
  );

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
