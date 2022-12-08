import React, { FC } from 'react';
import ContextTabContainer from '../../../context/ContextTabContainer/ContextTabContainer';
import { PageProps } from '../../../shared/types/PageProps';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useHub } from '../HubContext/useHub';
import HubPageLayout from '../layout/HubPageLayout';
import { HubAboutView } from '../views/HubAboutView';

export interface HubContextPageProps extends PageProps {}

const HubAboutPage: FC<HubContextPageProps> = ({}) => {
  const {  hubNameId, displayName } = useHub();

  return (
    <HubPageLayout currentSection={EntityPageSection.About}>
      <ContextTabContainer hubNameId={hubNameId}>
        {(entities, state) => (
          <HubAboutView
            name={displayName}
            tagline={entities.context?.tagline}
            tags={entities.tagset?.tags}
            who={entities.context?.who}
            loading={state.loading}
            error={state.error}
          />
        )}
      </ContextTabContainer>
    </HubPageLayout>
  );
};
export default HubAboutPage;

{/*
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
  metrics={entities.metrics}
/>*/}
