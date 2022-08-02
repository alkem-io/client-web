import React, { FC, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { PageProps } from '../../../pages/common';
import { useUpdateNavigation } from '../../../hooks';
import CanvasesManagementViewWrapper from '../CanvasesManagement/CanvasesManagementViewWrapper';
import useBackToParentPage from '../../shared/utils/useBackToParentPage';
import { EntityTypeName } from '../../shared/layout/PageLayout/SimplePageLayout';
import { CanvasProvider } from '../../../containers/canvas/CanvasProvider';

export interface CanvasesPageProps extends PageProps {
  parentUrl: string;
  entityTypeName: EntityTypeName;
}

// TODO use for the Canvases Dialog
const CanvasesPage: FC<CanvasesPageProps> = ({ paths, entityTypeName, parentUrl }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/canvases', name: 'canvases', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  const { canvasId } = useParams();

  const [backToCanvases, buildLinkToCanvas] = useBackToParentPage(`${parentUrl}/canvases`);

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
export default CanvasesPage;
