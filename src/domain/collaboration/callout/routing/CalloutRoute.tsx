import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import AspectProvider from '../../aspect/context/AspectProvider';
import AspectRoute from '../../aspect/views/AspectRoute';
import CanvasRoute from '../../canvas/views/CanvasRoute';
import { JourneyTypeName } from '../../../challenge/JourneyTypeName';
import { nameOfUrl } from '../../../../core/routing/urlParams';

export interface CalloutRouteProps {
  parentPagePath: string;
  journeyTypeName: JourneyTypeName;
}

const CalloutRoute: FC<CalloutRouteProps> = ({ parentPagePath, journeyTypeName }) => {
  return (
    <Routes>
      <Route
        path={`aspects/:${nameOfUrl.aspectNameId}/*`}
        element={
          <AspectProvider>
            <AspectRoute parentPagePath={parentPagePath} journeyTypeName={journeyTypeName} />
          </AspectProvider>
        }
      />
      <Route
        path={`canvases/:${nameOfUrl.whiteboardNameId}/*`}
        element={<CanvasRoute parentPagePath={parentPagePath} journeyTypeName={journeyTypeName} />}
      />
    </Routes>
  );
};

export default CalloutRoute;
