import React, { FC, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CanvasesManagementViewWrapper from '../CanvasesManagement/CanvasesManagementViewWrapper';
import useBackToParentPage from '../../../shared/utils/useBackToParentPage';
import { EntityTypeName } from '../../../shared/layout/PageLayout/SimplePageLayout';
import { CanvasProvider } from '../../../../containers/canvas/CanvasProvider';

export interface CanvasesPageProps {
  canvasNameId?: string;
  calloutNameId?: string;
  parentUrl: string;
  entityTypeName: EntityTypeName;
}

const CanvasesView: FC<CanvasesPageProps> = ({ canvasNameId, entityTypeName, parentUrl }) => {
  const [, buildLinkToCanvasRaw] = useBackToParentPage(parentUrl);
  // todo: do the back nagivation properly
  const navigate = useNavigate();
  const backToCanvases = () => navigate(-1);

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
          entityTypeName={entityTypeName}
          {...entities}
          {...state}
        />
      )}
    </CanvasProvider>
  );
};

export default CanvasesView;
