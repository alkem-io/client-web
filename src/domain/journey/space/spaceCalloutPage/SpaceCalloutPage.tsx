import CalloutPage from '@/domain/collaboration/CalloutPage/CalloutPage';
import SpaceDashboardPage from '../SpaceDashboard/SpaceDashboardPage';
import SpaceSubspacesPage from '../pages/SpaceSubspacesPage';
import SpaceKnowledgeBasePage from '@/domain/journey/space/SpaceKnowledgeBase/SpaceKnowledgeBasePage';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { JourneyCalloutDialogProps } from '@/domain/journey/common/JourneyCalloutDialog/JourneyCalloutDialog';
import SpaceCommunityPage from '../SpaceCommunityPage/SpaceCommunityPage';
import { useSpace } from '../SpaceContext/useSpace';
import { SpaceTab } from '@/domain/space/SpaceTabs';

const getPageSection = (flowState: string | undefined): EntityPageSection => {
  switch (flowState) {
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

const renderPage = (flowState: string | undefined) => {
  switch (flowState) {
    case SpaceTab.HOME:
      return <SpaceDashboardPage />;
    case SpaceTab.SUBSPACES:
      return <SpaceSubspacesPage />;
    case SpaceTab.COMMUNITY:
      return <SpaceCommunityPage />;
    default:
      return <SpaceKnowledgeBasePage calloutsFlowState={EntityPageSection.KnowledgeBase} />;
  }
};

const SpaceCalloutPage = (props: JourneyCalloutDialogProps) => {
  const { about } = useSpace();

  const getPageRoute = (flowState: string | undefined) => {
    return `${about.profile.url}/${getPageSection(flowState)}`;
  };

  return <CalloutPage parentRoute={getPageRoute} renderPage={renderPage} {...props} />;
};

export default SpaceCalloutPage;
