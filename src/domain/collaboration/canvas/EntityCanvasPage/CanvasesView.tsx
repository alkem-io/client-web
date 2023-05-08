import React, { FC } from 'react';
import CanvasesManagementViewWrapper from '../CanvasesManagement/CanvasesManagementViewWrapper';
import useBackToParentPage from '../../../shared/utils/useBackToParentPage';
import { JourneyTypeName } from '../../../challenge/JourneyTypeName';
import { CanvasProvider } from '../containers/CanvasProvider';

export interface CanvasesPageProps {
  canvasNameId?: string;
  calloutNameId?: string;
  parentUrl: string;
  journeyTypeName: JourneyTypeName;
}

const CanvasesView: FC<CanvasesPageProps> = ({ canvasNameId, journeyTypeName, parentUrl }) => {
  const [backToExplore] = useBackToParentPage(parentUrl, { keepScroll: true });
  const backToCanvases = () => backToExplore();

  return (
    <CanvasProvider>
      {(entities, state) => (
        <CanvasesManagementViewWrapper
          canvasNameId={canvasNameId}
          backToCanvases={backToCanvases}
          journeyTypeName={journeyTypeName}
          {...entities}
          {...state}
        />
      )}
    </CanvasProvider>
  );
};

export default CanvasesView;
