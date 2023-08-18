import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';
import WhiteboardsView from '../EntityWhiteboardPage/WhiteboardsView';

export interface WhiteboardRouteProps {
  parentPagePath: string;
  journeyTypeName: JourneyTypeName;
}

const WhiteboardRoute: FC<WhiteboardRouteProps> = ({ parentPagePath, journeyTypeName }) => {
  const { calloutNameId, whiteboardNameId, spaceNameId, challengeNameId, opportunityNameId } = useUrlParams();

  if (!calloutNameId) {
    throw new Error('Must be within a Callout');
  }

  if (!whiteboardNameId) {
    throw new Error('Must be within a Whiteboard.');
  }

  if (!spaceNameId) {
    throw new Error('Must be within a Space.');
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <WhiteboardsView
            whiteboardNameId={whiteboardNameId}
            calloutNameId={calloutNameId}
            spaceNameId={spaceNameId}
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

export default WhiteboardRoute;
