import React, { FC } from 'react';
import OpportunitySettingsLayout from './OpportunitySettingsLayout';
import { SettingsSection } from '../layout/EntitySettings/constants';
import { useAppendBreadcrumb } from '../../../hooks/usePathUtils';
import { SettingsPageProps } from '../layout/EntitySettings/types';
import { useHub, useOpportunity } from '../../../hooks';
import CommunityAdminView from '../community/views/CommunityAdminView';
import { SectionSpacer } from '../../../components/core/Section/Section';
import { Loading } from '../../../components/core';
import CommunityGroupListPage from '../../../pages/Admin/Community/CommunityListPage';
import AdminCommunityOrganizationsView from '../challenge/views/AdminCommunityOrganizationsView';
import { useTranslation } from 'react-i18next';
import useOpportunityLeadOrganizationAssignment from '../../community/useCommunityAssignment/useOpportunityLeadOrganizationAssignment';
import useOpportunityMemberOrganizationAssignment from '../../community/useCommunityAssignment/useOpportunityMemberOrganizationAssignment';
import useMemberUserAssignment from '../../community/useCommunityAssignment/useMemberUserAssignment';
import {
  refetchOpportunityCommunityMembersQuery,
  useOpportunityCommunityAvailableLeadUsersQuery,
  useOpportunityCommunityAvailableMemberUsersQuery,
  useOpportunityCommunityMembersQuery,
} from '../../../hooks/generated/graphql';
import useLeadUserAssignment from '../../community/useCommunityAssignment/useLeadUserAssignment';

const OpportunityCommunityAdminPage: FC<SettingsPageProps> = ({ paths, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'community' });

  const { t } = useTranslation();

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

  const memberUsersProps = useMemberUserAssignment({
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
    useAvailableLeadUsersOptions: {
      useQuery: useOpportunityCommunityAvailableMemberUsersQuery,
      variables: {
        hubId: hubNameId,
        opportunityId: opportunity?.nameID,
      },
      getResult: data => data.hub.opportunity.community?.availableMemberUsers,
    },
  });

  const leadUsersProps = useLeadUserAssignment({
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
    useAvailableLeadUsersOptions: {
      useQuery: useOpportunityCommunityAvailableLeadUsersQuery,
      variables: {
        hubId: hubNameId,
        opportunityId: opportunity?.nameID,
      },
      getResult: data => data.hub.opportunity.community?.availableLeadUsers,
    },
  });

  return (
    <OpportunitySettingsLayout currentTab={SettingsSection.Community} tabRoutePrefix={routePrefix}>
      <CommunityAdminView headerText={t('community.leading-users')} {...leadUsersProps} />
      <SectionSpacer />
      <CommunityAdminView headerText={t('community.member-users')} {...memberUsersProps} />
      <SectionSpacer />
      <AdminCommunityOrganizationsView
        headerText={t('community.leading-organizations')}
        {...leadingOrganizationsProps}
      />
      <SectionSpacer />
      <AdminCommunityOrganizationsView headerText={t('community.member-organizations')} {...memberOrganizationsProps} />
      <SectionSpacer />
      {!communityId ? <Loading /> : <CommunityGroupListPage communityId={communityId} />}
    </OpportunitySettingsLayout>
  );
};

export default OpportunityCommunityAdminPage;
