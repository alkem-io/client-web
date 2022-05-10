import React, { FC, useMemo } from 'react';
import { PageProps } from '../../pages';
import HubPageContainer from '../../containers/hub/HubPageContainer';
import HubCanvasManagementView from '../../views/Hub/HubCanvasManagementView';
import { useUpdateNavigation } from '../../hooks';
import PageLayout from '../../domain/shared/layout/PageLayout';
import { EntityPageSection } from '../../domain/shared/layout/EntityPageSection';

export interface HubCanvasPageProps extends PageProps {}

const HubCanvasPage: FC<HubCanvasPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/canvases', name: 'canvases', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <PageLayout currentSection={EntityPageSection.Canvases} entityTypeName="hub">
      <HubPageContainer>
        {(e, s) => {
          if (!e.hub) {
            return <></>;
          }

          return (
            <HubCanvasManagementView
              entities={{ hub: e.hub }}
              state={{ loading: s.loading, error: s.error }}
              actions={undefined}
              options={undefined}
            />
          );
        }}
      </HubPageContainer>
    </PageLayout>
  );
};
export default HubCanvasPage;
