import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { ContributionsView } from '../../profile/views/ProfileView';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/constants';
import VCSettingsPageLayout from '../layout/VCSettingsPageLayout';
import { SpaceHostedItem } from '../../../journey/utils/SpaceHostedItem';
import { CommunityContributorType, SpaceType } from '../../../../core/apollo/generated/graphql-schema';
import { useVcMembershipsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { JourneyLevel } from '../../../../main/routing/resolvers/RouteResolver';

export interface UserMembershipPageProps {}

const UserMembershipPage: FC<UserMembershipPageProps> = () => {
  const { t } = useTranslation();
  const { vcNameId = '' } = useUrlParams();

  const { data, loading, refetch } = useVcMembershipsQuery({
    variables: {
      virtualContributorId: vcNameId!,
    },
    skip: !vcNameId,
  });

  const memberships = useMemo(() => {
    if (!data?.rolesVirtualContributor.spaces) {
      return [];
    }

    return data.rolesVirtualContributor.spaces.reduce((acc, space) => {
      const currentSpace = {
        spaceID: space.id,
        id: space.id,
        spaceLevel: 0 as JourneyLevel,
        contributorId: data.virtualContributor.id,
        contributorType: CommunityContributorType.Virtual,
      };
      acc.push(currentSpace);

      const subspaces = space.subspaces.map(subspace => ({
        id: subspace.id,
        spaceID: subspace.id,
        spaceLevel:
          subspace.type === SpaceType.Challenge
            ? (1 as JourneyLevel)
            : subspace.type === SpaceType.Opportunity
            ? (2 as JourneyLevel)
            : (1 as JourneyLevel),
        contributorId: data.virtualContributor.id,
        contributorType: CommunityContributorType.Virtual,
      }));

      return acc.concat(subspaces);
    }, [] as SpaceHostedItem[]);
  }, [data]);

  const pendingInvitations = [];

  return (
    <VCSettingsPageLayout currentTab={SettingsSection.Membership}>
      <ContributionsView
        title={t('pages.virtualContributorProfile.membership.title')}
        contributions={memberships}
        loading={loading}
        enableLeave
        onLeave={refetch}
      />
      <ContributionsView
        title={t('pages.virtualContributorProfile.membership.pendingInvitations')}
        contributions={pendingInvitations}
        loading={loading}
      />
    </VCSettingsPageLayout>
  );
};

export default UserMembershipPage;
