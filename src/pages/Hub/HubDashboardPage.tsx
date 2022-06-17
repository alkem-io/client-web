import React, { FC, useMemo } from 'react';
import HubPageContainer from '../../containers/hub/HubPageContainer';
import { useUpdateNavigation } from '../../hooks';
import HubDashboardView from '../../views/Hub/HubDashboardView';
import { PageProps } from '../common';
import { getVisualBanner } from '../../utils/visuals.utils';
import { DiscussionsProvider } from '../../context/Discussions/DiscussionsProvider';
import PageLayout from '../../domain/shared/layout/PageLayout';
import { EntityPageSection } from '../../domain/shared/layout/EntityPageSection';

export interface HubDashboardPageProps extends PageProps {}

const HubDashboardPage: FC<HubDashboardPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'dashboard', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  return (
    <DiscussionsProvider>
      <PageLayout currentSection={EntityPageSection.Dashboard} entityTypeName="hub">
        <HubPageContainer>
          {(entities, state) => (
            <HubDashboardView
              title={entities.hub?.displayName}
              bannerUrl={getVisualBanner(entities.hub?.context?.visuals)}
              tagline={entities.hub?.context?.tagline}
              vision={entities.hub?.context?.vision}
              hubId={entities.hub?.id}
              hubNameId={entities.hub?.nameID}
              communityId={entities.hub?.community?.id}
              organizationNameId={entities.hub?.host?.nameID}
              activity={entities.activity}
              challenges={entities.challenges}
              discussions={entities.discussionList}
              aspects={entities.aspects}
              aspectsCount={entities.aspectsCount}
              loading={state.loading}
              isMember={entities.isMember}
              communityReadAccess={entities.permissions.communityReadAccess}
              challengesReadAccess={entities.permissions.challengesReadAccess}
              memberUsers={entities.memberUsers}
              memberUsersCount={entities.memberUsersCount}
              memberOrganizations={entities.memberOrganizations}
              memberOrganizationsCount={entities.memberOrganizationsCount}
              leadUsers={entities.hub?.community?.leadUsers}
              hostOrganization={entities.hub?.host}
            />
          )}
        </HubPageContainer>
      </PageLayout>
    </DiscussionsProvider>
  );
};
export default HubDashboardPage;
