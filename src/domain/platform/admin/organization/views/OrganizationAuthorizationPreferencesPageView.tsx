import React, { FC } from 'react';
import { useOrganization } from '@/domain/community/contributor/organization/hooks/useOrganization';
import OrganizationPreferenceContainer from '@/domain/common/preference/organization/OrganizationPreferenceContainer';
import OrganizationAuthorizationPreferencesView from '@/domain/community/contributor/organization/views/OrganizationAuthorizationPreferencesView';
import Loading from '@/core/ui/loading/Loading';

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
