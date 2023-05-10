import React, { FC } from 'react';
import CanvasesManagementViewWrapper from '../CanvasesManagement/CanvasesManagementViewWrapper';
import useBackToParentPage from '../../../shared/utils/useBackToParentPage';
import { JourneyTypeName } from '../../../challenge/JourneyTypeName';
import { CanvasProvider } from '../containers/CanvasProvider';
import { buildCanvasUrl, JourneyLocation } from '../../../../common/utils/urlBuilders';

export interface CanvasesPageProps extends JourneyLocation {
  whiteboardNameId: string;
  calloutNameId: string;
  parentUrl: string;
  journeyTypeName: JourneyTypeName;
}

const CanvasesView: FC<CanvasesPageProps> = ({
  whiteboardNameId,
  parentUrl,
  calloutNameId,
  hubNameId,
  challengeNameId,
  opportunityNameId,
  ...props
}) => {
  const [backToExplore] = useBackToParentPage(parentUrl, { keepScroll: true });
  const backToCanvases = () => backToExplore();

  const canvasShareUrl = buildCanvasUrl(calloutNameId, whiteboardNameId, {
    hubNameId,
    challengeNameId,
    opportunityNameId,
  });

  return (
    <CanvasProvider
      whiteboardNameId={whiteboardNameId}
      calloutNameId={calloutNameId}
      hubNameId={hubNameId}
      challengeNameId={challengeNameId}
      opportunityNameId={opportunityNameId}
    >
      {(entities, state) => (
        <CanvasesManagementViewWrapper
          canvasNameId={whiteboardNameId}
          backToCanvases={backToCanvases}
          canvasShareUrl={canvasShareUrl}
          {...entities}
          {...state}
          {...props}
        />
      )}
    </CanvasProvider>
  );
};

export default CanvasesView;
