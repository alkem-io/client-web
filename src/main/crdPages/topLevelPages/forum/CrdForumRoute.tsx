import { Navigate, Route, Routes } from 'react-router-dom';
import { CrdNotFoundView } from '@/main/crdPages/error/CrdNotFoundView';
import CrdDiscussionPage from '@/main/crdPages/topLevelPages/forum/CrdDiscussionPage';
import CrdForumPage from '@/main/crdPages/topLevelPages/forum/CrdForumPage';
import CrdLatestReleaseRedirect from '@/main/crdPages/topLevelPages/forum/CrdLatestReleaseRedirect';
import { ForumShell } from '@/main/crdPages/topLevelPages/forum/ForumShell';
import { nameOfUrl } from '@/main/routing/urlParams';

const CrdForumRoute = () => (
  <Routes>
    <Route path="releases/latest" element={<CrdLatestReleaseRedirect />} />
    {/* Legacy compatibility: `/forum/new` redirects to the canonical
        `?dialog=new` query-param entry point handled in CrdForumPage. */}
    <Route path="new" element={<Navigate to="/forum?dialog=new" replace={true} />} />
    <Route element={<ForumShell />}>
      <Route index={true} element={<CrdForumPage />} />
      <Route path={`discussion/:${nameOfUrl.discussionNameId}`} element={<CrdDiscussionPage />} />
      <Route path=":categorySlug" element={<CrdForumPage />} />
    </Route>
    <Route path="*" element={<CrdNotFoundView />} />
  </Routes>
);

export default CrdForumRoute;
