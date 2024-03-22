import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';
import WhiteboardPage from '../EntityWhiteboardPage/WhiteboardPage';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';

export interface WhiteboardRouteProps {
  parentPagePath: string;
  journeyTypeName: JourneyTypeName;
}

const WhiteboardRoute: FC<WhiteboardRouteProps> = ({ parentPagePath, journeyTypeName }) => {
  const { calloutNameId, whiteboardNameId } = useUrlParams();

  const { journeyId } = useRouteResolver();

  if (!calloutNameId) {
    throw new Error('Must be within a Callout');
  }

  if (!whiteboardNameId) {
    throw new Error('Must be within a Whiteboard.');
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <WhiteboardPage
            journeyId={journeyId}
            whiteboardNameId={whiteboardNameId}
            calloutNameId={calloutNameId}
            parentUrl={parentPagePath}
            journeyTypeName={journeyTypeName}
          />
        }
      />
    </Routes>
  );
};

export default WhiteboardRoute;
