import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardContributorsSection, {
  DashboardContributorsSectionSectionProps,
} from '../../components/composite/common/sections/DashboardContributorsSection';
import { useUserContext } from '../../hooks';
import { useOrganizationsListQuery, useUsersQuery } from '../../hooks/generated/graphql';
import useServerMetadata from '../../hooks/useServerMetadata';
import { COUNTRIES_BY_CODE } from '../../models/constants';
import getActivityCount from '../../utils/get-activity-count';
import { buildOrganizationUrl, buildUserProfileUrl } from '../../utils/urlBuilders';
import { getVisualAvatar } from '../../utils/visuals.utils';

const MAX_USERS_TO_SHOW = 12;
const MAX_ORGANIZATIONS_TO_SHOW = 12;

const ContributorsSection = () => {
  const { t } = useTranslation();
  // move this to a container
  const { user } = useUserContext();
  const { data: usersData, loading } = useUsersQuery({
    fetchPolicy: 'cache-and-network',
    variables: {
      limit: MAX_USERS_TO_SHOW,
      shuffle: true,
    },
  });
  const { data: organizationsData, loading: loadingOrganizations } = useOrganizationsListQuery({
    fetchPolicy: 'cache-and-network',
    variables: {
      limit: MAX_ORGANIZATIONS_TO_SHOW,
      shuffle: true,
    },
  });
  const users = useMemo(() => usersData?.users || [], [usersData]);
  const organizations = useMemo(() => organizationsData?.organizations || [], [organizationsData]);

  const usersDTO: DashboardContributorsSectionSectionProps['entities']['users'] = useMemo(
    () =>
      users.map(u => ({
        avatar: u.profile?.avatar?.uri || '',
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
        avatar: getVisualAvatar(o?.profile?.avatar) || '',
        displayName: o.displayName,
        url: buildOrganizationUrl(o.nameID),
      })),
    [organizations]
  );

  const { activity } = useServerMetadata();
  const [userCount, orgCount] = [
    getActivityCount(activity, 'users') || 0,
    getActivityCount(activity, 'organizations') || 0,
  ];

  return (
    <DashboardContributorsSection
      headerText={t('contributors-section.title')}
      subHeaderText={t('contributors-section.subheader')}
      userTitle={t('contributors-section.users-title')}
      organizationTitle={t('contributors-section.organizations-title')}
      navText={'See more...'}
      navLink={'contributors'}
      entities={{
        usersCount: userCount,
        users: usersDTO,
        user,
        organizationsCount: orgCount,
        organizations: organizationsDTO,
      }}
      loading={{ users: loading, organizations: loadingOrganizations }}
    />
  );
};

export default ContributorsSection;
