import { Route, Routes } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import { nameOfUrl } from '@/main/routing/urlParams';
import ForumPage from '../pages/ForumPage';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import LastReleaseDiscussion from '../pages/LastReleaseDiscussion';
import Discussion from '../pages/Discussion';
import { ForumDiscussionCategory } from '@/core/apollo/generated/graphql-schema';
import withUrlResolverParams from '@/main/routing/urlResolver/withUrlResolverParams';

export const ForumRoute = () => (
  <Routes>
    <Route path={'/'}>
      <Route index element={<ForumPage />} />
      <Route path="/new" element={<ForumPage dialog="new" />} />
      <Route path={`discussion/:${nameOfUrl.discussionNameId}`} element={<Discussion />} />
      <Route path={'/releases'} element={<ForumPage categorySelected={ForumDiscussionCategory.Releases} />} />
      <Route path={'/releases/latest'} element={<LastReleaseDiscussion />} />
      <Route
        path={'/platform-functionalities'}
        element={<ForumPage categorySelected={ForumDiscussionCategory.PlatformFunctionalities} />}
      />
      <Route
        path={'/community-building'}
        element={<ForumPage categorySelected={ForumDiscussionCategory.CommunityBuilding} />}
      />
      <Route
        path={'/challenge-centric'}
        element={<ForumPage categorySelected={ForumDiscussionCategory.ChallengeCentric} />}
      />
      <Route path={'/help'} element={<ForumPage categorySelected={ForumDiscussionCategory.Help} />} />
      <Route path={'/other'} element={<ForumPage categorySelected={ForumDiscussionCategory.Other} />} />
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

export default withUrlResolverParams(ForumRoute);
