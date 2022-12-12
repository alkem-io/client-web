import React, { FC } from 'react';
import AboutPageContainer from '../../../context/ContextTabContainer/AboutPageContainer';
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
      <AboutPageContainer hubNameId={hubNameId}>
        {(entities, state) => (
          <HubAboutView
            name={displayName}
            tagline={entities.context?.tagline}
            tags={entities.tagset?.tags}
            who={entities.context?.who}
            impact={entities.context?.impact}
            background={entities.context?.background}
            vision={entities.context?.vision}
            communityReadAccess={entities.permissions.communityReadAccess}
            memberUsers={entities.memberUsers}
            memberUsersCount={entities.memberUsersCount}
            memberOrganizations={entities.memberOrganizations}
            memberOrganizationsCount={entities.memberOrganizationsCount}
            leadUsers={entities.leadUsers}
            hostOrganization={entities.hostOrganization}
            references={entities.references}
            metrics={entities.metrics}
            loading={state.loading}
            error={state.error}
          />
        )}
      </AboutPageContainer>
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
