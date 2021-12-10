import Typography from '@mui/material/Typography/Typography';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardContributorsSection, {
  DashboardContributorsSectionSectionProps,
} from '../../components/composite/common/sections/DashboardContributorsSection';
import { useUserContext } from '../../hooks';
import { useOrganizationsListQuery, useUsersQuery } from '../../hooks/generated/graphql';
import { COUNTRIES_BY_CODE } from '../../models/constants';
import { buildOrganizationUrl, buildUserProfileUrl } from '../../utils/urlBuilders';

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
      users
        .map(u => ({
          avatar: u.profile?.avatar || '',
          displayName: u.displayName,
          url: buildUserProfileUrl(u.nameID),
          tooltip: {
            tags: u.profile?.tagsets?.flatMap(x => x.tags.map(t => t)) || [],
            city: u.city,
            country: COUNTRIES_BY_CODE[u.country],
          },
        }))
        .slice(0, 12), // take only the first 12 elements - 2 rows
    [users]
  );

  const organizationsDTO: DashboardContributorsSectionSectionProps['entities']['organizations'] = useMemo(
    () =>
      organizations
        .map(o => ({
          avatar: o?.profile?.avatar || '',
          displayName: o.displayName,
          url: buildOrganizationUrl(o.nameID),
        }))
        .slice(0, 6), // take only the first 6 elements - 1 row
    [users]
  );

  return (
    <DashboardContributorsSection
      headerText={t('contributors-section.title')}
      userTitle={t('contributors-section.users-title')}
      organizationTitle={t('contributors-section.organizations-title')}
      entities={{
        users: usersDTO,
        usersCount: users.length,
        user,
        organizations: organizationsDTO,
        organizationsCount: organizations.length,
      }}
      loading={{ users: loading, organizations: loadingOrganizations }}
    >
      {!user && (
        <Typography variant="body1">{t('components.backdrop.authentication', { blockName: 'community' })}</Typography>
      )}
    </DashboardContributorsSection>
  );
};

export default ContributorsSection;
