import React, { FC, useMemo } from 'react';
import { PageProps } from '../common';
import { useHub, useUpdateNavigation } from '../../hooks';
import HubContextView from '../../views/Hub/HubContextView';
import ContextTabContainer from '../../containers/context/ContextTabContainer';
import { AuthorizationPrivilege } from '../../models/graphql-schema';
import { EntityPageSection } from '../../domain/shared/layout/EntityPageSection';
import PageLayout from '../../domain/shared/layout/PageLayout';

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
    <PageLayout currentSection={EntityPageSection.Context} entityTypeName="hub">
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
          />
        )}
      </ContextTabContainer>
    </PageLayout>
  );
};
export default HubContextPage;
