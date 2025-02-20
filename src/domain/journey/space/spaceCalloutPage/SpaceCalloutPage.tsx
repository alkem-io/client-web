import CalloutPage from '@/domain/collaboration/CalloutPage/CalloutPage';
import SpaceDashboardPage from '../SpaceDashboard/SpaceDashboardPage';
import SpaceSubspacesPage from '../pages/SpaceSubspacesPage';
import KnowledgeBasePage from '@/domain/collaboration/KnowledgeBase/KnowledgeBasePage';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { JourneyCalloutDialogProps } from '@/domain/journey/common/JourneyCalloutDialog/JourneyCalloutDialog';
import { CalloutGroupName } from '@/core/apollo/generated/graphql-schema';
import SpaceCommunityPage from '../SpaceCommunityPage/SpaceCommunityPage';
import { useSpace } from '../SpaceContext/useSpace';
import withUrlResolverParams from '@/main/routing/urlResolver/withUrlResolverParams';

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
      return <KnowledgeBasePage />;
  }
};

const SpaceCalloutPage = (props: JourneyCalloutDialogProps) => {
  const { profile } = useSpace();

  const getPageRoute = (calloutGroup: string | undefined) => {
    return `${profile.url}/${getPageSection(calloutGroup)}`;
  };

  return <CalloutPage parentRoute={getPageRoute} renderPage={renderPage} {...props} />;
};

export default withUrlResolverParams(SpaceCalloutPage);
