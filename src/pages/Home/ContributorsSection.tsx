import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardContributorsSection, {
  DashboardContributorsSectionSectionProps,
} from '../../components/composite/common/sections/DashboardContributorsSection';
import { useUserContext } from '../../hooks';
import { useOrganizationsListQuery, useUsersQuery } from '../../hooks/generated/graphql';
import { COUNTRIES_BY_CODE } from '../../models/constants';
import { buildOrganizationUrl, buildUserProfileUrl } from '../../utils/urlBuilders';
import { getVisualAvatar } from '../../utils/visuals.utils';

const ContributorsSection = () => {
  const { t } = useTranslation();
  // move this to a container
  const { user } = useUserContext();
  const { data: usersData, loading } = useUsersQuery({ fetchPolicy: 'cache-and-network' });
  const { data: organizationsData, loading: loadingOrganizations } = useOrganizationsListQuery({
    fetchPolicy: 'cache-and-network',
  });
  const users = useMemo(() => usersData?.users || [], [usersData]);
  const organizations = useMemo(() => organizationsData?.organizations || [], [organizationsData]);

  const usersDTO: DashboardContributorsSectionSectionProps['entities']['users'] = useMemo(
    () =>
      users.map(u => ({
        avatar: u.profile?.avatar2?.uri || '',
        displayName: u.displayName,
        url: buildUserProfileUrl(u.nameID),
        tooltip: {
          tags: u.profile?.tagsets?.flatMap(x => x.tags.map(t => t)) || [],
          city: u.city,
          country: COUNTRIES_BY_CODE[u.country],
        },
      })),
    [users]
  );

  const organizationsDTO: DashboardContributorsSectionSectionProps['entities']['organizations'] = useMemo(
    () =>
      organizations.map(o => ({
        avatar: getVisualAvatar(o?.profile?.avatar2) || '',
        displayName: o.displayName,
        url: buildOrganizationUrl(o.nameID),
      })),
    [organizations]
  );

  return (
    <DashboardContributorsSection
      headerText={t('contributors-section.title')}
      subHeaderText={t('contributors-section.subheader')}
      userTitle={t('contributors-section.users-title')}
      organizationTitle={t('contributors-section.organizations-title')}
      navText={'See more...'}
      navLink={'contributors'}
      entities={{
        users: usersDTO,
        user,
        organizations: organizationsDTO,
      }}
      loading={{ users: loading, organizations: loadingOrganizations }}
    />
  );
};

export default ContributorsSection;
