import React, { FC } from 'react';
import OpportunitySettingsLayout from './OpportunitySettingsLayout';
import { SettingsSection } from '../layout/EntitySettings/constants';
import { useAppendBreadcrumb } from '../../../hooks/usePathUtils';
import { SettingsPageProps } from '../layout/EntitySettings/types';
import { useHub, useOpportunity } from '../../../hooks';
import { SectionSpacer } from '../../shared/components/Section/Section';
import { Loading } from '../../../common/components/core';
import CommunityGroupListPage from '../../../pages/Admin/Community/CommunityListPage';
import EditOrganizationsWithPopup from '../community/views/EditOrganizationsWithPopup';
import useOpportunityLeadOrganizationAssignment from '../../community/useCommunityAssignment/useOpportunityLeadOrganizationAssignment';
import useOpportunityMemberOrganizationAssignment from '../../community/useCommunityAssignment/useOpportunityMemberOrganizationAssignment';
import {
  refetchOpportunityAvailableLeadUsersQuery,
  refetchOpportunityAvailableMemberUsersQuery,
  refetchOpportunityCommunityMembersQuery,
  useOpportunityAvailableLeadUsersLazyQuery,
  useOpportunityAvailableMemberUsersLazyQuery,
  useOpportunityCommunityMembersQuery,
} from '../../../hooks/generated/graphql';
import useCommunityUserAssignment from '../community/useCommunityUserAssignment';
import EditCommunityMembersSection from '../community/views/EditCommunityMembersSection';
import EditMemberUsersWithPopup from '../components/Community/EditMemberUsersWithPopup';

const OpportunityCommunityAdminPage: FC<SettingsPageProps> = ({ paths, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'community' });

  const { hubNameId } = useHub();
  const { opportunity } = useOpportunity();

  const communityId = opportunity?.community?.id;

  const leadingOrganizationsProps = useOpportunityLeadOrganizationAssignment({
    hubId: hubNameId,
    opportunityId: opportunity?.nameID,
  });

  const memberOrganizationsProps = useOpportunityMemberOrganizationAssignment({
    hubId: hubNameId,
    opportunityId: opportunity?.nameID,
  });

  const memberUsersProps = useCommunityUserAssignment({
    memberType: 'member',
    variables: {
      hubId: hubNameId,
      opportunityId: opportunity?.nameID,
    },
    existingUsersOptions: {
      useQuery: useOpportunityCommunityMembersQuery,
      readCommunity: data => data?.hub.opportunity.community,
      refetchQuery: refetchOpportunityCommunityMembersQuery,
    },
    availableUsersOptions: {
      useLazyQuery: useOpportunityAvailableMemberUsersLazyQuery,
      readUsers: data => data.hub.opportunity.community?.availableMemberUsers,
      refetchQuery: refetchOpportunityAvailableMemberUsersQuery,
    },
  });

  const leadUsersProps = useCommunityUserAssignment({
    memberType: 'lead',
    variables: {
      hubId: hubNameId,
      opportunityId: opportunity?.nameID,
    },
    existingUsersOptions: {
      useQuery: useOpportunityCommunityMembersQuery,
      readCommunity: data => data?.hub.opportunity.community,
      refetchQuery: refetchOpportunityCommunityMembersQuery,
    },
    availableUsersOptions: {
      useLazyQuery: useOpportunityAvailableLeadUsersLazyQuery,
      readUsers: data => data.hub.opportunity.community?.availableLeadUsers,
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
