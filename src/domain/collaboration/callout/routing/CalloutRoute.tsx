import { Route, Routes } from 'react-router-dom';
import WhiteboardRoute from '@/domain/collaboration/whiteboard/views/WhiteboardRoute';
import { nameOfUrl } from '@/main/routing/urlParams';

export interface CalloutRouteProps {
  parentPagePath: string;
}

const CalloutRoute = ({ parentPagePath }: CalloutRouteProps) => {
  return (
    <Routes>
      <Route
        path={`whiteboards/:${nameOfUrl.whiteboardNameId}/*`}
        element={<WhiteboardRoute parentPagePath={parentPagePath} />}
      />
    </Routes>
  );
};

export default CalloutRoute;
