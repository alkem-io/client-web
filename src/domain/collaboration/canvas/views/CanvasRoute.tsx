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
  const { calloutNameId, whiteboardNameId, hubNameId, challengeNameId, opportunityNameId } = useUrlParams();

  if (!calloutNameId) {
    throw new Error('Must be within a Callout');
  }

  if (!whiteboardNameId) {
    throw new Error('Must be within a Whiteboard.');
  }

  if (!hubNameId) {
    throw new Error('Must be within a Hub.');
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <CanvasesView
            whiteboardNameId={whiteboardNameId}
            calloutNameId={calloutNameId}
            hubNameId={hubNameId}
            challengeNameId={challengeNameId}
            opportunityNameId={opportunityNameId}
            parentUrl={parentPagePath}
            journeyTypeName={journeyTypeName}
          />
        }
      />
    </Routes>
  );
};

export default CanvasRoute;
