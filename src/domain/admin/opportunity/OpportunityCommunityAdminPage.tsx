import React, { FC } from 'react';
import OpportunitySettingsLayout from './OpportunitySettingsLayout';
import { SettingsSection } from '../layout/EntitySettings/constants';
import { useAppendBreadcrumb } from '../../../hooks/usePathUtils';
import { SettingsPageProps } from '../layout/EntitySettings/types';
import { useHub, useOpportunity } from '../../../hooks';
import { SectionSpacer } from '../../shared/components/Section/Section';
import { Loading } from '../../../components/core';
import CommunityGroupListPage from '../../../pages/Admin/Community/CommunityListPage';
import EditOrganizationsWithPopup from '../community/views/EditOrganizationsWithPopup';
import useOpportunityLeadOrganizationAssignment from '../../community/useCommunityAssignment/useOpportunityLeadOrganizationAssignment';
import useOpportunityMemberOrganizationAssignment from '../../community/useCommunityAssignment/useOpportunityMemberOrganizationAssignment';
import {
  refetchOpportunityCommunityMembersQuery,
  useOpportunityAvailableLeadUsersLazyQuery,
  useOpportunityAvailableMemberUsersLazyQuery,
  useOpportunityCommunityMembersQuery,
} from '../../../hooks/generated/graphql';
import useCommunityUserAssignment from '../community/useCommunityUserAssignment';
import EditCommunityMembersSection from '../community/views/EditCommunityMembersSection';
import EditMemberUsersWithPopup from '../../../components/Admin/Community/EditMemberUsersWithPopup';

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
    useExistingMembersQuery: options => {
      const { data } = useOpportunityCommunityMembersQuery(options);

      return {
        communityId: data?.hub.opportunity.community?.id,
        existingMembers: data?.hub.opportunity.community?.memberUsers,
      };
    },
    refetchMembersQuery: refetchOpportunityCommunityMembersQuery,
    availableUsers: {
      useLazyQuery: useOpportunityAvailableMemberUsersLazyQuery,
      getResult: data => data.hub.opportunity.community?.availableMemberUsers,
    },
  });

  const leadUsersProps = useCommunityUserAssignment({
    memberType: 'lead',
    variables: {
      hubId: hubNameId,
      opportunityId: opportunity?.nameID,
    },
    useExistingMembersQuery: options => {
      const { data } = useOpportunityCommunityMembersQuery(options);

      return {
        communityId: data?.hub.opportunity.community?.id,
        existingMembers: data?.hub.opportunity.community?.leadUsers,
      };
    },
    refetchMembersQuery: refetchOpportunityCommunityMembersQuery,
    availableUsers: {
      useLazyQuery: useOpportunityAvailableLeadUsersLazyQuery,
      getResult: data => data.hub.opportunity.community?.availableLeadUsers,
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
