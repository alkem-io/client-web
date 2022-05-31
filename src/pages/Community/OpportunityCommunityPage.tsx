import React, { FC } from 'react';
import { PageProps } from '../common';
import { useOpportunity } from '../../hooks';
import CommunityPage from './CommunityPage';
import CommunityContributors from '../../domain/community/CommunityContributors/CommunityContributors';
import useOrganizationCardProps from '../../domain/community/utils/useOrganizationCardProps';
import useUserCardProps from '../../domain/community/utils/useUserCardProps';
import { useOpportunityCommunityPageCommunityMembersQuery } from '../../hooks/generated/graphql';
import { useTranslation } from 'react-i18next';

const OpportunityCommunityPage: FC<PageProps> = ({ paths }) => {
  const { opportunity, hubId } = useOpportunity();
  const communityId = opportunity?.community?.id;
  const opportunityId = opportunity?.id;

  const { data } = useOpportunityCommunityPageCommunityMembersQuery({
    variables: {
      hubId,
      opportunityId: opportunityId!,
    },
    skip: !hubId || !opportunityId,
  });

  const { leadUsers, memberUsers, leadOrganizations, memberOrganizations } = data?.hub.opportunity.community ?? {};

  const { t } = useTranslation();

  return (
    <CommunityPage entityTypeName="opportunity" paths={paths} hubId={hubId} communityId={communityId}>
      <CommunityContributors
        title={t('pages.generic.sections.community.leading-contributors')}
        ariaKey="leading-contributors"
        organizations={useOrganizationCardProps(leadOrganizations)}
        users={useUserCardProps(leadUsers, opportunityId)}
        organizationsCount={leadOrganizations?.length}
        usersCount={leadUsers?.length}
      />
      <CommunityContributors
        title={t('pages.generic.sections.community.contributors')}
        ariaKey="contributors"
        organizations={useOrganizationCardProps(memberOrganizations)}
        users={useUserCardProps(memberUsers, opportunityId)}
        organizationsCount={memberOrganizations?.length}
        usersCount={memberUsers?.length}
      />
    </CommunityPage>
  );
};
export default OpportunityCommunityPage;
