import React, { FC, useMemo } from 'react';
import CanvasesManagementViewWrapper from '../CanvasesManagement/CanvasesManagementViewWrapper';
import useBackToParentPage from '../../shared/utils/useBackToParentPage';
import { EntityTypeName } from '../../shared/layout/PageLayout/SimplePageLayout';
import { CanvasProvider } from '../../../containers/canvas/CanvasProvider';

export interface CanvasesPageProps {
  canvasId?: string;
  parentUrl: string;
  entityTypeName: EntityTypeName;
}

const CanvasesView: FC<CanvasesPageProps> = ({ canvasId, entityTypeName, parentUrl }) => {
  const [backToCanvases, buildLinkToCanvasRaw] = useBackToParentPage(parentUrl);

  const buildLinkToCanvas = useMemo(
    () => (url: string) => buildLinkToCanvasRaw(`${parentUrl}/${url}`),
    [parentUrl, buildLinkToCanvasRaw]
  );

  return (
    <CanvasProvider>
      {(entities, state) => (
        <CanvasesManagementViewWrapper
          canvasId={canvasId}
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
