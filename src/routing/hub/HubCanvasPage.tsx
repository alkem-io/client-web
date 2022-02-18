import React, { FC, useMemo } from 'react';
import { PageProps } from '../../pages';
import EcoversePageContainer from '../../containers/hub/HubPageContainer';
import HubCanvasManagementView from '../../views/Hub/HubCanvasManagementView';
import { useUpdateNavigation } from '../../hooks';

export interface HubCanvasPageProps extends PageProps {}

const HubCanvasPage: FC<HubCanvasPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/canvases', name: 'canvases', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <EcoversePageContainer>
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
    </EcoversePageContainer>
  );
};
export default HubCanvasPage;
