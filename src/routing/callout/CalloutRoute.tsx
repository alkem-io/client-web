import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import AspectProvider from '../../context/aspect/AspectProvider';
import AspectRoute from '../../domain/aspect/views/AspectRoute';
import CanvasRoute from '../../domain/canvas/views/CanvasRoute';
import { EntityTypeName } from '../../domain/shared/layout/PageLayout/SimplePageLayout';
import { nameOfUrl } from '../url-params';

export interface CalloutRouteProps {
  parentPagePath: string;
  entityTypeName: EntityTypeName;
}

const CalloutRoute: FC<CalloutRouteProps> = ({ parentPagePath, entityTypeName }) => {
  return (
    <Routes>
      <Route
        path={`aspects/:${nameOfUrl.aspectNameId}/*`}
        element={
          <AspectProvider>
            <AspectRoute parentPagePath={parentPagePath} />
          </AspectProvider>
        }
      />
      <Route
        path={`canvases/:${nameOfUrl.canvasNameId}/*`}
        element={<CanvasRoute parentPagePath={parentPagePath} entityTypeName={entityTypeName} />}
      />
    </Routes>
  );
};

export default CalloutRoute;
