import React, { FC, useMemo } from 'react';
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
  const [, buildLinkToCanvasRaw] = useBackToParentPage(parentUrl);
  const [backToExplore] = useBackToParentPage(parentUrl, { keepScroll: true });
  const backToCanvases = () => backToExplore();

  const buildLinkToCanvas = useMemo(
    () => (url: string) => buildLinkToCanvasRaw(`${parentUrl}/${url}`),
    [parentUrl, buildLinkToCanvasRaw]
  );

  return (
    <CanvasProvider>
      {(entities, state) => (
        <CanvasesManagementViewWrapper
          canvasNameId={canvasNameId}
          backToCanvases={backToCanvases}
          buildLinkToCanvas={buildLinkToCanvas}
          journeyTypeName={journeyTypeName}
          {...entities}
          {...state}
        />
      )}
    </CanvasProvider>
  );
};

export default CanvasesView;
