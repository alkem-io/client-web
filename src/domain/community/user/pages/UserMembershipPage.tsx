import { Grid } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUrlParams } from '@core/routing/useUrlParams';
import { ContributionsView } from '../../profile/views/ProfileView';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/constants';
import UserSettingsLayout from '../../../platform/admin/user/layout/UserSettingsLayout';
import { useUserMetadata } from '../hooks/useUserMetadata';
import GridProvider from '@core/ui/grid/GridProvider';
import SectionSpacer from '../../../shared/components/Section/SectionSpacer';
import { SpaceHostedItem } from '../../../journey/utils/SpaceHostedItem';
import { CommunityContributorType, SpaceLevel } from '@core/apollo/generated/graphql-schema';
import { useUserContributionsQuery, useUserPendingMembershipsQuery } from '@core/apollo/generated/apollo-hooks';

export interface UserMembershipPageProps {}

const UserMembershipPage: FC<UserMembershipPageProps> = () => {
  const { t } = useTranslation();
  const { userNameId = '' } = useUrlParams();
  const { user: userMetadata } = useUserMetadata(userNameId);

  const { data, loading, refetch } = useUserContributionsQuery({
    variables: {
      userId: userMetadata?.user.id!,
    },
    skip: !userMetadata?.user.id,
  });

  const memberships = useMemo(() => {
    if (!data?.rolesUser.spaces) {
      return [];
    }

    return data.rolesUser.spaces.reduce((acc, space) => {
      const currentSpace = {
        spaceID: space.id,
        id: space.id,
        spaceLevel: SpaceLevel.Space,
        contributorId: userMetadata?.user.id!,
        contributorType: CommunityContributorType.User,
      };
      acc.push(currentSpace);

      const subspaces = space.subspaces.map(subspace => ({
        id: subspace.id,
        spaceID: subspace.id,
        spaceLevel: subspace.level,
        contributorId: userMetadata?.user.id!,
        contributorType: CommunityContributorType.User,
      }));

      return acc.concat(subspaces);
    }, [] as SpaceHostedItem[]);
  }, [data]);

  // TODO: I think this is wrong, we are seeing the memberships of certain user, not ours.
  const { data: pendingMembershipsData } = useUserPendingMembershipsQuery();
  const applications = useMemo<SpaceHostedItem[] | undefined>(() => {
    if (!pendingMembershipsData || !userMetadata) {
      return undefined;
    } else {
      return pendingMembershipsData.me.communityApplications.map(application => ({
        id: application.id,
        spaceID: application.spacePendingMembershipInfo.id,
        spaceLevel: application.spacePendingMembershipInfo.level,
        contributorId: userMetadata.user.id,
        contributorType: CommunityContributorType.User,
      }));
    }
  }, [userMetadata, pendingMembershipsData]);

  return (
    <UserSettingsLayout currentTab={SettingsSection.Membership}>
      <GridProvider columns={12}>
        <ContributionsView
          title={t('common.my-memberships')}
          contributions={memberships}
          loading={loading}
          enableLeave
          onLeave={refetch}
        />
      </GridProvider>
      <SectionSpacer />
      <Grid container rowSpacing={4}>
        <Grid item xs={12}>
          <ContributionsView
            title={t('pages.user-profile.pending-applications.title')}
            contributions={applications}
            loading={loading}
          />
        </Grid>
      </Grid>
    </UserSettingsLayout>
  );
};

export default UserMembershipPage;
