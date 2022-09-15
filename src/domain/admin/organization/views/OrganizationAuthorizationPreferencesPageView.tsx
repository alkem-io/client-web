import React, { FC } from 'react';
import { useOrganization } from '../../../../hooks';
import OrganizationPreferenceContainer from '../../../../containers/preferences/organization/OrganizationPreferenceContainer';
import OrganizationAuthorizationPreferencesView from '../../../organization/views/OrganizationAuthorizationPreferencesView';

const OrganizationAuthorizationPreferencesPageView: FC = () => {
  const { organizationId } = useOrganization();

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
export default OrganizationAuthorizationPreferencesPageView;
