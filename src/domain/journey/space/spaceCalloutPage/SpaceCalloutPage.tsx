import React from 'react';
import CalloutPage from '../../../collaboration/CalloutPage/CalloutPage';
import SpaceDashboardPage from '../SpaceDashboard/SpaceDashboardPage';
import SpaceSubspacesPage from '../pages/SpaceSubspacesPage';
import KnowedgeBasePage from '../../../collaboration/KnowledgeBase/KnowedgeBasePage';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { JourneyCalloutDialogProps } from '../../common/JourneyCalloutDialog/JourneyCalloutDialog';
import { CalloutGroupName } from '../../../../core/apollo/generated/graphql-schema';
import SpaceCommunityPage from '../SpaceCommunityPage/SpaceCommunityPage';
import { useSpace } from '../SpaceContext/useSpace';

const getPageSection = (calloutGroup: string | undefined): EntityPageSection => {
  switch (calloutGroup) {
    case CalloutGroupName.Home:
      return EntityPageSection.Dashboard;
    case CalloutGroupName.Community:
      return EntityPageSection.Community;
    case CalloutGroupName.Subspaces:
      return EntityPageSection.Subspaces;
    default:
      return EntityPageSection.KnowledgeBase;
  }
};

const renderPage = (calloutGroup: string | undefined) => {
  switch (calloutGroup) {
    case CalloutGroupName.Home:
      return <SpaceDashboardPage />;
    case CalloutGroupName.Subspaces:
      return <SpaceSubspacesPage />;
    case CalloutGroupName.Community:
      return <SpaceCommunityPage />;
    default:
      return <KnowedgeBasePage />;
  }
};

const SpaceCalloutPage = (props: JourneyCalloutDialogProps) => {
  const { profile } = useSpace();

  const getPageRoute = (calloutGroup: string | undefined) => {
    return `${profile.url}/${getPageSection(calloutGroup)}`;
  };

  return <CalloutPage journeyTypeName="space" parentRoute={getPageRoute} renderPage={renderPage} {...props} />;
};

export default SpaceCalloutPage;
