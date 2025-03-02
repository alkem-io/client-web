import CalloutPage from '@/domain/collaboration/CalloutPage/CalloutPage';
import SpaceDashboardPage from '../SpaceDashboard/SpaceDashboardPage';
import SpaceSubspacesPage from '../pages/SpaceSubspacesPage';
import KnowledgeBasePage from '@/domain/collaboration/KnowledgeBase/KnowledgeBasePage';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { JourneyCalloutDialogProps } from '@/domain/journey/common/JourneyCalloutDialog/JourneyCalloutDialog';
import SpaceCommunityPage from '../SpaceCommunityPage/SpaceCommunityPage';
import { useSpace } from '../SpaceContext/useSpace';
import { SpaceTab } from '@/domain/space/SpaceTabs';

const getPageSection = (calloutGroup: string | undefined): EntityPageSection => {
  switch (calloutGroup) {
    case SpaceTab.HOME:
      return EntityPageSection.Dashboard;
    case SpaceTab.COMMUNITY:
      return EntityPageSection.Community;
    case SpaceTab.SUBSPACES:
      return EntityPageSection.Subspaces;
    default:
      return EntityPageSection.KnowledgeBase;
  }
};

const renderPage = (calloutGroup: string | undefined) => {
  switch (calloutGroup) {
    case SpaceTab.HOME:
      return <SpaceDashboardPage />;
    case SpaceTab.SUBSPACES:
      return <SpaceSubspacesPage />;
    case SpaceTab.COMMUNITY:
      return <SpaceCommunityPage />;
    default:
      return <KnowledgeBasePage calloutsFlowState={EntityPageSection.KnowledgeBase} />;
  }
};

const SpaceCalloutPage = (props: JourneyCalloutDialogProps) => {
  const { about } = useSpace();

  const getPageRoute = (calloutGroup: string | undefined) => {
    return `${about.profile.url}/${getPageSection(calloutGroup)}`;
  };

  return <CalloutPage parentRoute={getPageRoute} renderPage={renderPage} {...props} />;
};

export default SpaceCalloutPage;
