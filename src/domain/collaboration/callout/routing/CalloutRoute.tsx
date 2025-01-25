import { Route, Routes } from 'react-router-dom';
import PostProvider from '@/domain/collaboration/post/context/PostProvider';
import PostRoute from '@/domain/collaboration/post/views/PostRoute';
import WhiteboardRoute from '@/domain/collaboration/whiteboard/views/WhiteboardRoute';
import { nameOfUrl } from '@/main/routing/urlParams';

export interface CalloutRouteProps {
  parentPagePath: string;
}

const CalloutRoute = ({ parentPagePath }: CalloutRouteProps) => (
  <Routes>
    <Route
      path={`posts/:${nameOfUrl.postNameId}/*`}
      element={
        <PostProvider>
          <PostRoute parentPagePath={parentPagePath} />
        </PostProvider>
      }
    />
    <Route
      path={`whiteboards/:${nameOfUrl.whiteboardNameId}/*`}
      element={<WhiteboardRoute parentPagePath={parentPagePath} />}
    />
  </Routes>
);

export default CalloutRoute;
