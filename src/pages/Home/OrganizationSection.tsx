import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useOrganizationsListQuery } from '../../hooks/generated/graphql';
import AssociatedOrganizationsView from '../../views/ProfileView/AssociatedOrganizationsView';

const OrganizationSection = () => {
  const { t } = useTranslation();
  // move this to a container
  const { data: organizationsData } = useOrganizationsListQuery({ fetchPolicy: 'cache-and-network' });
  const organizations = useMemo(() => organizationsData?.organizations.map(o => o.nameID) || [], [organizationsData]);

  return (
    <AssociatedOrganizationsView
      organizationNameIDs={organizations}
      title={t('pages.home.sections.organizations.header')}
    />
  );
};

export default OrganizationSection;
