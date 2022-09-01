import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import AspectProvider from '../../aspect/context/AspectProvider';
import AspectRoute from '../../aspect/views/AspectRoute';
import CanvasRoute from '../../canvas/views/CanvasRoute';
import { EntityTypeName } from '../../shared/layout/PageLayout/SimplePageLayout';
import { nameOfUrl } from '../../../routing/url-params';

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
