import React, { FC, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { capitalize } from 'lodash';
import { PageProps } from '../../../pages/common';
import { useUpdateNavigation } from '../../../hooks';
import CanvasesManagementViewWrapper from '../CanvasesManagement/CanvasesManagementViewWrapper';
import PageLayout from '../../shared/layout/PageLayout';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import useBackToParentPage from '../../shared/utils/useBackToParentPage';
import { EntityTypeName } from '../../shared/layout/PageLayout/PageLayout';
import { CanvasProvider } from '../../../containers/canvas/CanvasProvider';

export interface CanvasesPageProps extends PageProps {
  parentUrl: string;
  entityTypeName: EntityTypeName;
}

const CanvasesPage: FC<CanvasesPageProps> = ({ paths, entityTypeName, parentUrl }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/canvases', name: 'canvases', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  const { canvasId } = useParams();

  const pageKey = `${capitalize(entityTypeName)}Canvases`;

  const [backToCanvases, buildLinkToCanvas] = useBackToParentPage(pageKey, `${parentUrl}/canvases`);

  return (
    <PageLayout currentSection={EntityPageSection.Canvases} entityTypeName="challenge">
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
    </PageLayout>
  );
};
export default CanvasesPage;
