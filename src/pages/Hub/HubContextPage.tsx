import React, { FC, useMemo } from 'react';
import { PageProps } from '../common';
import { useHub, useUpdateNavigation } from '../../hooks';
import HubContextView from '../../views/Hub/HubContextView';
import ContextTabContainer from '../../containers/context/ContextTabContainer';
import { EntityPageSection } from '../../domain/shared/layout/EntityPageSection';
import HubPageLayout from '../../domain/hub/layout/HubPageLayout';

export interface HubContextPageProps extends PageProps {}

const HubContextPage: FC<HubContextPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/context', name: 'context', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  const { hubId, hubNameId, displayName } = useHub();

  return (
    <HubPageLayout currentSection={EntityPageSection.About}>
      <ContextTabContainer hubNameId={hubNameId}>
        {(entities, state) => (
          <HubContextView
            entities={{
              hubId: hubId,
              hubNameId: hubNameId,
              hubDisplayName: displayName,
              hubTagSet: entities.tagset,
              context: entities.context,
            }}
            state={{
              loading: state.loading,
              error: state.error,
            }}
            options={{}}
            actions={{}}
            activity={entities.activity}
          />
        )}
      </ContextTabContainer>
    </HubPageLayout>
  );
};
export default HubContextPage;
