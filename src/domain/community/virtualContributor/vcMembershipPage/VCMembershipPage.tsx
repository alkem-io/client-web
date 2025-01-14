import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUrlParams } from '@/core/routing/useUrlParams';
import { ContributionsView } from '@/domain/community/profile/views/ProfileView';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import VCSettingsPageLayout from '../../virtualContributorAdmin/layout/VCSettingsPageLayout';
import { SpaceHostedItem } from '@/domain/journey/utils/SpaceHostedItem';
import { AuthorizationPrivilege, CommunityContributorType, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { useVcMembershipsQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  PendingMembershipsDialogType,
  usePendingMembershipsDialog,
} from '@/domain/community/pendingMembership/PendingMembershipsDialogContext';

const UserMembershipPage = () => {
  const { t } = useTranslation();
  const { vcNameId = '' } = useUrlParams();

  const { data, loading, refetch } = useVcMembershipsQuery({
    variables: {
      virtualContributorId: vcNameId!,
    },
    skip: !vcNameId,
  });
  const { setOpenDialog } = usePendingMembershipsDialog();

  const canLeaveCommunities = data?.virtualContributor.authorization?.myPrivileges?.includes(
    AuthorizationPrivilege.Grant
  );

  const memberships = useMemo(() => {
    if (!data?.rolesVirtualContributor.spaces) {
      return [];
    }

    return data.rolesVirtualContributor.spaces.reduce((acc, space) => {
      const currentSpace = {
        spaceID: space.id,
        id: space.id,
        spaceLevel: SpaceLevel.Space,
        contributorId: data.virtualContributor.id,
        contributorType: CommunityContributorType.Virtual,
      };
      acc.push(currentSpace);

      const subspaces = space.subspaces.map(subspace => ({
        id: subspace.id,
        spaceID: subspace.id,
        spaceLevel: subspace.level,
        contributorId: data.virtualContributor.id,
        contributorType: CommunityContributorType.Virtual,
      }));

      return acc.concat(subspaces);
    }, [] as SpaceHostedItem[]);
  }, [data]);

  const pendingInvitations = useMemo<SpaceHostedItem[] | undefined>(() => {
    return data?.me.communityInvitations
      .filter(
        invitation =>
          invitation.invitation.contributorType === CommunityContributorType.Virtual &&
          invitation.invitation.contributor.id === data.virtualContributor.id
      )
      .map(invitation => ({
        id: invitation.id,
        spaceID: invitation.spacePendingMembershipInfo.id,
        spaceLevel: invitation.spacePendingMembershipInfo.level,
        contributorId: data.virtualContributor.id,
        contributorType: CommunityContributorType.Virtual,
      }));
  }, [data]);

  return (
    <VCSettingsPageLayout currentTab={SettingsSection.Membership}>
      <ContributionsView
        title={t('pages.virtualContributorProfile.membership.title')}
        emptyCaption={t('pages.virtualContributorProfile.membership.noMemberships')}
        contributions={memberships}
        loading={loading}
        enableLeave={canLeaveCommunities}
        onLeave={refetch}
      />
      <ContributionsView
        title={t('pages.virtualContributorProfile.membership.pendingInvitations')}
        emptyCaption={t('pages.virtualContributorProfile.membership.noPendingInvitations')}
        contributions={pendingInvitations}
        loading={loading}
        onContributionClick={() => setOpenDialog({ type: PendingMembershipsDialogType.PendingMembershipsList })}
      />
    </VCSettingsPageLayout>
  );
};

export default UserMembershipPage;
