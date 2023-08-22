import { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import { nameOfUrl } from '../../../../main/routing/urlParams';
import DiscussionPage from '../pages/DiscussionPage';
import ForumPage from '../pages/ForumPage';

interface ForumRouteProps {}

export const ForumRoute: FC<ForumRouteProps> = () => {
  return (
    <Routes>
      <Route path={'/'}>
        <Route index element={<ForumPage />} />
        <Route path="/new" element={<ForumPage dialog="new" />} />
        <Route path={`discussion/:${nameOfUrl.discussionNameId}`} element={<DiscussionPage />} />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};

export default ForumRoute;
