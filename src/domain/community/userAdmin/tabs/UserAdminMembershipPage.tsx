import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { ActionableContributionsView } from '@/domain/community/profile/views';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import UserAdminLayout from '@/domain/community/userAdmin/layout/UserAdminLayout';
import { SpaceHostedItem } from '@/domain/space/models/SpaceHostedItem.model';
import { RoleSetContributorType, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { useUserContributionsQuery, useUserPendingMembershipsQuery } from '@/core/apollo/generated/apollo-hooks';
import Gutters from '@/core/ui/grid/Gutters';

const UserAdminMembershipPage = () => {
  const { t } = useTranslation();
  const { userId } = useUrlResolver();

  const { data, loading, refetch } = useUserContributionsQuery({
    variables: {
      userId: userId!,
    },
    skip: !userId,
  });

  const memberships = useMemo(() => {
    if (!data?.rolesUser.spaces) {
      return [];
    }

    return data.rolesUser.spaces.reduce((acc, space) => {
      const currentSpace = {
        spaceID: space.id,
        id: space.id,
        spaceLevel: SpaceLevel.L0,
        contributorId: userId!,
        contributorType: RoleSetContributorType.User,
      };
      acc.push(currentSpace);

      const subspaces = space.subspaces.map(subspace => ({
        id: subspace.id,
        spaceID: subspace.id,
        spaceLevel: subspace.level,
        contributorId: userId!,
        contributorType: RoleSetContributorType.User,
        parentSpaceId: space.id,
      }));

      return acc.concat(subspaces);
    }, [] as SpaceHostedItem[]);
  }, [data]);

  // TODO: I think this is wrong, we are seeing the memberships of certain user, not ours.
  const { data: pendingMembershipsData } = useUserPendingMembershipsQuery();
  const applications = useMemo<SpaceHostedItem[] | undefined>(() => {
    if (!pendingMembershipsData || !userId) {
      return undefined;
    } else {
      return pendingMembershipsData.me.communityApplications.map(application => ({
        id: application.id,
        spaceID: application.spacePendingMembershipInfo.id,
        spaceLevel: application.spacePendingMembershipInfo.level,
        contributorId: userId,
        contributorType: RoleSetContributorType.User,
      }));
    }
  }, [userId, pendingMembershipsData]);

  return (
    <UserAdminLayout currentTab={SettingsSection.Membership}>
      <Gutters>
        <ActionableContributionsView
          title={t('common.my-memberships')}
          contributions={memberships}
          loading={loading}
          enableLeave
          onLeave={refetch}
        />
        <ActionableContributionsView
          title={t('pages.user-profile.pending-applications.title')}
          contributions={applications}
          loading={loading}
        />
      </Gutters>
    </UserAdminLayout>
  );
};

export default UserAdminMembershipPage;
