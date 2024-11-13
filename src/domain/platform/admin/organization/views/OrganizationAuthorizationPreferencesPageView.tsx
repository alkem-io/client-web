import React, { FC } from 'react';
import { useOrganization } from '../../../../community/contributor/organization/hooks/useOrganization';
import OrganizationPreferenceContainer from '../../../../common/preference/organization/OrganizationPreferenceContainer';
import OrganizationAuthorizationPreferencesView from '../../../../community/contributor/organization/views/OrganizationAuthorizationPreferencesView';
import Loading from '@core/ui/loading/Loading';

const OrganizationAuthorizationPreferencesPageView: FC = () => {
  const { organizationId, loading } = useOrganization();

  if (loading) {
    return <Loading />;
  }

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
