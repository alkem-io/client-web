import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import PostProvider from '../../post/context/PostProvider';
import PostRoute from '../../post/views/PostRoute';
import WhiteboardRoute from '../../whiteboard/views/WhiteboardRoute';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';
import { nameOfUrl } from '@/main/routing/urlParams';

export interface CalloutRouteProps {
  parentPagePath: string;
  journeyTypeName: JourneyTypeName;
}

const CalloutRoute: FC<CalloutRouteProps> = ({ parentPagePath, journeyTypeName }) => {
  return (
    <Routes>
      <Route
        path={`posts/:${nameOfUrl.postNameId}/*`}
        element={
          <PostProvider>
            <PostRoute parentPagePath={parentPagePath} journeyTypeName={journeyTypeName} />
          </PostProvider>
        }
      />
      <Route
        path={`whiteboards/:${nameOfUrl.whiteboardNameId}/*`}
        element={<WhiteboardRoute parentPagePath={parentPagePath} journeyTypeName={journeyTypeName} />}
      />
    </Routes>
  );
};

export default CalloutRoute;
