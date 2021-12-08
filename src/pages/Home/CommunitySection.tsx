import Typography from '@mui/material/Typography/Typography';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardCommunitySection, {
  DashboardCommunitySectionProps,
} from '../../components/composite/common/sections/DashboardCommunitySection';
import { useUserContext } from '../../hooks';
import { useUsersQuery } from '../../hooks/generated/graphql';
import { COUNTRIES_BY_CODE } from '../../models/constants';
import { buildUserProfileUrl } from '../../utils/urlBuilders';

const CommunitySection = () => {
  const { t } = useTranslation();
  // move this to a container
  const { user } = useUserContext();
  const { data: usersData, loading } = useUsersQuery({ fetchPolicy: 'cache-and-network' });
  const users = useMemo(() => usersData?.users || [], [usersData]);
  const usersDTO: DashboardCommunitySectionProps['entities']['users'] = useMemo(
    () =>
      users
        .map(u => ({
          avatarSrc: u.profile?.avatar || '',
          displayName: u.displayName,
          tags: u.profile?.tagsets?.flatMap(x => x.tags.map(t => t)) || [],
          url: buildUserProfileUrl(u.nameID),
          city: u.city,
          country: COUNTRIES_BY_CODE[u.country],
        }))
        .slice(0, 12), // take only the first 12 elements - 2 rows
    [users]
  );

  return (
    <DashboardCommunitySection
      headerText={t('pages.home.sections.community.header')}
      subHeaderText={user && t('pages.home.sections.community.subheader', { count: users.length })}
      helpText={t('pages.home.sections.community.helpText')}
      entities={{
        users: usersDTO,
        user,
      }}
      loading={{ users: loading }}
    >
      {!user && (
        <Typography variant="body1">{t('components.backdrop.authentication', { blockName: 'community' })}</Typography>
      )}
    </DashboardCommunitySection>
  );
};

export default CommunitySection;
