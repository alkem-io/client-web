import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ContributionsView } from '@/domain/community/profile/views';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import VCSettingsPageLayout from '../../virtualContributorAdmin/layout/VCSettingsPageLayout';
import { SpaceHostedItem } from '@/domain/space/models/SpaceHostedItem.model.';
import { AuthorizationPrivilege, RoleSetContributorType, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { useVcMembershipsQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  PendingMembershipsDialogType,
  usePendingMembershipsDialog,
} from '@/domain/community/pendingMembership/PendingMembershipsDialogContext';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import useNavigate from '@/core/routing/useNavigate';

const VCMembershipPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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

  type ProfileUrl = {
    about?: {
      profile?: {
        url?: string;
      };
    };
  };

  const onContributionClick = (_, details: ProfileUrl) => {
    if (details?.about?.profile?.url) {
      navigate(details.about.profile.url);
    }
  };

  const loading = resolving || loadingVc;

  return (
    <VCSettingsPageLayout currentTab={SettingsSection.Membership}>
      <ContributionsView
        title={t('pages.virtualContributorProfile.membership.title')}
        emptyCaption={t('pages.virtualContributorProfile.membership.noMemberships')}
        contributions={memberships}
        loading={loading}
        enableLeave={canLeaveCommunities}
        onLeave={refetch}
        onContributionClick={onContributionClick}
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

export default VCMembershipPage;
