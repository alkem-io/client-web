import { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import { nameOfUrl } from '../../../../main/routing/urlParams';
import ForumPage from '../pages/ForumPage';
import TopLevelLayout from '../../../../main/ui/layout/TopLevelLayout';
import LastReleaseDiscussion from '../pages/LastReleaseDiscussion';
import Discussion from '../pages/Discussion';

interface ForumRouteProps {}

export const ForumRoute: FC<ForumRouteProps> = () => {
  return (
    <Routes>
      <Route path={'/'}>
        <Route index element={<ForumPage />} />
        <Route path="/new" element={<ForumPage dialog="new" />} />
        <Route path={`discussion/:${nameOfUrl.discussionNameId}`} element={<Discussion />} />
        <Route path={'/releases'} element={<ForumPage />} />
        <Route path={'/releases/latest'} element={<LastReleaseDiscussion />} />
        <Route path={'/platform-functionalities'} element={<ForumPage />} />
        <Route path={'/community-building'} element={<ForumPage />} />
        <Route path={'/challenge-centric'} element={<ForumPage />} />
        <Route path={'/help'} element={<ForumPage />} />
        <Route path={'/other'} element={<ForumPage />} />
        <Route
          path="*"
          element={
            <TopLevelLayout>
              <Error404 />
            </TopLevelLayout>
          }
        />
      </Route>
    </Routes>
  );
};

export default ForumRoute;
