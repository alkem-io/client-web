import { Grid } from '@mui/material';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useUrlResolver from '@/main/urlResolver/useUrlResolver';
import { ContributionsView } from '@/domain/community/profile/views/ProfileView';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import UserAdminLayout from '@/domain/community/userAdmin/layout/UserAdminLayout';
import { useUserMetadata } from '../../user/hooks/useUserMetadata';
import GridProvider from '@/core/ui/grid/GridProvider';
import SectionSpacer from '@/domain/shared/components/Section/SectionSpacer';
import { SpaceHostedItem } from '@/domain/journey/utils/SpaceHostedItem';
import { RoleSetContributorType, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { useUserContributionsQuery, useUserPendingMembershipsQuery } from '@/core/apollo/generated/apollo-hooks';

const UserAdminMembershipPage = () => {
  const { t } = useTranslation();
  const { userId } = useUrlResolver();
  const { user: userMetadata } = useUserMetadata(userId);

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
        contributorType: RoleSetContributorType.User,
      };
      acc.push(currentSpace);

      const subspaces = space.subspaces.map(subspace => ({
        id: subspace.id,
        spaceID: subspace.id,
        spaceLevel: subspace.level,
        contributorId: userMetadata?.user.id!,
        contributorType: RoleSetContributorType.User,
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
        contributorType: RoleSetContributorType.User,
      }));
    }
  }, [userMetadata, pendingMembershipsData]);

  return (
    <UserAdminLayout currentTab={SettingsSection.Membership}>
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
    </UserAdminLayout>
  );
};

export default UserAdminMembershipPage;
