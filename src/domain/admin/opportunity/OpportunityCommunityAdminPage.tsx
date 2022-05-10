import React, { FC } from 'react';
import OpportunitySettingsLayout from './OpportunitySettingsLayout';
import { SettingsSection } from '../layout/EntitySettings/constants';
import { useAppendBreadcrumb } from '../../../hooks/usePathUtils';
import { SettingsPageProps } from '../layout/EntitySettings/types';
import { useChallenge, useOpportunity } from '../../../hooks';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import CommunityAdminView from '../community/views/CommunityAdminView';
import { SectionSpacer } from '../../../components/core/Section/Section';
import { Loading } from '../../../components/core';
import CommunityGroupListPage from '../../../pages/Admin/Community/CommunityListPage';

const OpportunityCommunityAdminPage: FC<SettingsPageProps> = ({ paths, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'community' });

  const { challenge } = useChallenge();
  const { opportunity, opportunityId } = useOpportunity();

  const communityId = opportunity?.community?.id;
  const parentCommunityId = challenge?.community?.id;

  return (
    <OpportunitySettingsLayout currentTab={SettingsSection.Community} tabRoutePrefix={routePrefix}>
      <CommunityAdminView
        credential={AuthorizationCredential.OpportunityMember}
        resourceId={opportunityId}
        communityId={communityId}
        parentCommunityId={parentCommunityId}
      />
      <SectionSpacer />
      {!communityId ? <Loading /> : <CommunityGroupListPage communityId={communityId} />}
    </OpportunitySettingsLayout>
  );
};

export default OpportunityCommunityAdminPage;
