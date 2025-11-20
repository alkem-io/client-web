import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionableContributionsView } from '@/domain/community/profile/views';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import VCSettingsPageLayout from '../../virtualContributorAdmin/layout/VCSettingsPageLayout';
import { SpaceHostedItem } from '@/domain/space/models/SpaceHostedItem.model';
import { AuthorizationPrivilege, RoleSetContributorType, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { useVcMembershipsQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  PendingMembershipsDialogType,
  usePendingMembershipsDialog,
} from '@/domain/community/pendingMembership/PendingMembershipsDialogContext';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

const VCMembershipPage = () => {
  const { t } = useTranslation();

  const { vcId, loading: resolving } = useUrlResolver();
  const {
    data,
    loading: loadingVc,
    refetch,
  } = useVcMembershipsQuery({
    variables: {
      virtualContributorId: vcId!,
    },
    skip: !vcId,
  });
  const { setOpenDialog } = usePendingMembershipsDialog();

  const canLeaveCommunities = data?.lookup.virtualContributor?.authorization?.myPrivileges?.includes(
    AuthorizationPrivilege.Grant
  );

  const memberships = useMemo(() => {
    if (!data?.rolesVirtualContributor.spaces) {
      return [];
    }

    return data.rolesVirtualContributor.spaces.reduce((acc, space) => {
      const vcId = data.lookup.virtualContributor?.id;
      if (!vcId) {
        return acc;
      }
      const currentSpace = {
        spaceID: space.id,
        id: space.id,
        spaceLevel: SpaceLevel.L0,
        contributorId: vcId,
        contributorType: RoleSetContributorType.Virtual,
      };
      acc.push(currentSpace);

      const subspaces = space.subspaces.map(subspace => ({
        id: subspace.id,
        spaceID: subspace.id,
        spaceLevel: subspace.level,
        contributorId: vcId,
        contributorType: RoleSetContributorType.Virtual,
        parentSpaceId: space.id, // Track parent space for subspaces
      }));

      return acc.concat(subspaces);
    }, [] as SpaceHostedItem[]);
  }, [data]);

  const pendingInvitations = useMemo<SpaceHostedItem[] | undefined>(() => {
    const vcId = data?.lookup.virtualContributor?.id;
    if (!vcId) {
      return [];
    }
    return data?.me.communityInvitations
      .filter(
        invitation =>
          invitation.invitation.contributorType === RoleSetContributorType.Virtual &&
          invitation.invitation.contributor.id === data.lookup.virtualContributor?.id
      )
      .map(invitation => ({
        id: invitation.id,
        spaceID: invitation.spacePendingMembershipInfo.id,
        spaceLevel: invitation.spacePendingMembershipInfo.level,
        contributorId: vcId,
        contributorType: RoleSetContributorType.Virtual,
      }));
  }, [data]);

  const loading = resolving || loadingVc;

  return (
    <VCSettingsPageLayout currentTab={SettingsSection.Membership}>
      <ActionableContributionsView
        title={t('pages.virtualContributorProfile.membership.title')}
        emptyCaption={t('pages.virtualContributorProfile.membership.noMemberships')}
        contributions={memberships}
        loading={loading}
        enableLeave={canLeaveCommunities}
        onLeave={refetch}
      />
      <ActionableContributionsView
        title={t('pages.virtualContributorProfile.membership.pendingInvitations')}
        emptyCaption={t('pages.virtualContributorProfile.membership.noPendingInvitations')}
        contributions={pendingInvitations}
        loading={loading}
        onContributionClick={() => setOpenDialog({ type: PendingMembershipsDialogType.PendingMembershipsList })}
      />
    </VCSettingsPageLayout>
  );
};

export default VCMembershipPage;
