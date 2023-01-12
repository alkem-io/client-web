import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { EntityTypeName } from '../../../platform/constants/EntityTypeName';
import CanvasesView from '../EntityCanvasPage/CanvasesView';

export interface CanvasRouteProps {
  parentPagePath: string;
  entityTypeName: EntityTypeName;
}

const CanvasRoute: FC<CanvasRouteProps> = ({ parentPagePath, entityTypeName }) => {
  const { canvasNameId } = useUrlParams();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <CanvasesView canvasNameId={canvasNameId} parentUrl={parentPagePath} entityTypeName={entityTypeName} />
        }
      />
    </Routes>
  );
};

export default CanvasRoute;
