import React, { FC, useMemo } from 'react';
import { PageProps } from '../../common';
import { useOrganization, useUpdateNavigation } from '../../../hooks';
import OrganizationPreferenceContainer from '../../../containers/preferences/organization/OrganizationPreferenceContainer';
import OrganizationAuthorizationPreferencesView from '../../../views/Organization/OrganizationAuthorizationPreferencesView';

const OrganizationAuthorizationPreferencesPage: FC<PageProps> = ({ paths }) => {
  const { organizationId } = useOrganization();
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'preferences', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <OrganizationPreferenceContainer orgId={organizationId}>
      {(entities, state, actions) => {
        const authPrefs = entities.preferences.filter(x => x.definition.group === 'AuthorizationOrganization');
        return (
          <OrganizationAuthorizationPreferencesView
            entities={{ preferences: authPrefs }}
            state={{ loading: state.loading, error: state.error }}
            actions={{ onUpdate: actions.onUpdate }}
            options={{}}
          />
        );
      }}
    </OrganizationPreferenceContainer>
  );
};
export default OrganizationAuthorizationPreferencesPage;
