import React, { FC } from 'react';
import OpportunitySettingsLayout from './OpportunitySettingsLayout';
import { SettingsSection } from '../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../layout/EntitySettingsLayout/types';
import { useSpace } from '../../../journey/space/SpaceContext/useSpace';
import { useOpportunity } from '../../../journey/opportunity/hooks/useOpportunity';
import { SectionSpacer } from '../../../shared/components/Section/Section';
import Loading from '../../../../core/ui/loading/Loading';
import CommunityGroupListPage from '../community/CommunityListPage';
import EditOrganizationsWithPopup from '../community/views/EditOrganizationsWithPopup';
import useOpportunityLeadOrganizationAssignment from '../../../community/community/useCommunityAssignment/useOpportunityLeadOrganizationAssignment';
import useOpportunityMemberOrganizationAssignment from '../../../community/community/useCommunityAssignment/useOpportunityMemberOrganizationAssignment';
import {
  refetchOpportunityAvailableLeadUsersQuery,
  refetchOpportunityAvailableMemberUsersQuery,
  refetchOpportunityCommunityMembersQuery,
  useOpportunityAvailableLeadUsersLazyQuery,
  useOpportunityAvailableMemberUsersLazyQuery,
  useOpportunityCommunityMembersQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import useCommunityUserAssignment from '../community/useCommunityUserAssignment';
import EditCommunityMembersSection from '../community/views/EditCommunityMembersSection';
import EditMemberUsersWithPopup from '../components/Community/EditMemberUsersWithPopup';

const OpportunityCommunityAdminPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  const { spaceNameId } = useSpace();
  const { opportunity } = useOpportunity();

  const communityId = opportunity?.community?.id;

  const leadingOrganizationsProps = useOpportunityLeadOrganizationAssignment({
    spaceId: spaceNameId,
    opportunityId: opportunity?.nameID,
  });

  const memberOrganizationsProps = useOpportunityMemberOrganizationAssignment({
    spaceId: spaceNameId,
    opportunityId: opportunity?.nameID,
  });

  const memberUsersProps = useCommunityUserAssignment({
    memberType: 'member',
    variables: {
      spaceId: spaceNameId,
      opportunityId: opportunity?.nameID,
    },
    existingUsersOptions: {
      useQuery: useOpportunityCommunityMembersQuery,
      readCommunity: data => data?.space.opportunity.community,
      refetchQuery: refetchOpportunityCommunityMembersQuery,
    },
    availableUsersOptions: {
      useLazyQuery: useOpportunityAvailableMemberUsersLazyQuery,
      readUsers: data => data.space.opportunity.community?.availableMemberUsers,
      refetchQuery: refetchOpportunityAvailableMemberUsersQuery,
    },
  });

  const leadUsersProps = useCommunityUserAssignment({
    memberType: 'lead',
    variables: {
      spaceId: spaceNameId,
      opportunityId: opportunity?.nameID,
    },
    existingUsersOptions: {
      useQuery: useOpportunityCommunityMembersQuery,
      readCommunity: data => data?.space.opportunity.community,
      refetchQuery: refetchOpportunityCommunityMembersQuery,
    },
    availableUsersOptions: {
      useLazyQuery: useOpportunityAvailableLeadUsersLazyQuery,
      readUsers: data => data.space.opportunity.community?.availableLeadUsers,
      refetchQuery: refetchOpportunityAvailableLeadUsersQuery,
    },
  });

  return (
    <OpportunitySettingsLayout currentTab={SettingsSection.Community} tabRoutePrefix={routePrefix}>
      <EditCommunityMembersSection memberType="leads">
        <EditMemberUsersWithPopup {...leadUsersProps} />
        <EditOrganizationsWithPopup {...leadingOrganizationsProps} />
      </EditCommunityMembersSection>
      <SectionSpacer />
      <EditCommunityMembersSection memberType="members">
        <EditMemberUsersWithPopup {...memberUsersProps} />
        <EditOrganizationsWithPopup {...memberOrganizationsProps} />
      </EditCommunityMembersSection>
      <SectionSpacer />
      {!communityId ? <Loading /> : <CommunityGroupListPage communityId={communityId} />}
    </OpportunitySettingsLayout>
  );
};

export default OpportunityCommunityAdminPage;
