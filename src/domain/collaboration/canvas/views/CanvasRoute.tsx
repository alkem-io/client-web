import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { JourneyTypeName } from '../../../challenge/JourneyTypeName';
import CanvasesView from '../EntityCanvasPage/CanvasesView';

export interface CanvasRouteProps {
  parentPagePath: string;
  journeyTypeName: JourneyTypeName;
}

const CanvasRoute: FC<CanvasRouteProps> = ({ parentPagePath, journeyTypeName }) => {
  const { whiteboardNameId: canvasNameId } = useUrlParams();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <CanvasesView canvasNameId={canvasNameId} parentUrl={parentPagePath} entityTypeName={journeyTypeName} />
        }
      />
    </Routes>
  );
};

export default CanvasRoute;
