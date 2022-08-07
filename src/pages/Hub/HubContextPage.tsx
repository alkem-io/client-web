import React, { FC, useMemo } from 'react';
import { PageProps } from '../common';
import { useHub, useUpdateNavigation } from '../../hooks';
import HubContextView from '../../views/Hub/HubContextView';
import ContextTabContainer from '../../containers/context/ContextTabContainer';
import { AuthorizationPrivilege } from '../../models/graphql-schema';
import { EntityPageSection } from '../../domain/shared/layout/EntityPageSection';
import HubPageLayout from '../../domain/hub/layout/HubPageLayout';

export interface HubContextPageProps extends PageProps {}

const HubContextPage: FC<HubContextPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/context', name: 'context', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  const {
    hubId,
    hubNameId,
    displayName,
    permissions: { contextPrivileges },
  } = useHub();
  const loadAspectsAndReferences = contextPrivileges.includes(AuthorizationPrivilege.Read);

  return (
    <HubPageLayout currentSection={EntityPageSection.About} entityTypeName="hub">
      <ContextTabContainer hubNameId={hubNameId} loadReferences={loadAspectsAndReferences}>
        {(entities, state) => (
          <HubContextView
            entities={{
              hubId: hubId,
              hubNameId: hubNameId,
              hubDisplayName: displayName,
              hubTagSet: entities.tagset,
              context: entities.context,
              references: entities?.references,
            }}
            state={{
              loading: state.loading,
              error: state.error,
            }}
            options={{}}
            actions={{}}
            communityReadAccess={entities.permissions.communityReadAccess}
            community={entities.contributors}
            activity={entities.activity}
            hostOrganization={entities.hostOrganization}
          />
        )}
      </ContextTabContainer>
    </HubPageLayout>
  );
};
export default HubContextPage;
