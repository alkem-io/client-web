import CalloutPage from '@/domain/collaboration/CalloutPage/CalloutPage';
import SpaceSubspacesPage from '../layout/tabbedLayout/Tabs/SpaceSubspacesPage';
import SpaceKnowledgeBasePage from '@/domain/space/layout/tabbedLayout/Tabs/SpaceKnowledgeBase/SpaceKnowledgeBasePage';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { JourneyCalloutDialogProps } from '@/domain/space/pages/SpaceCalloutDialogProps';
import SpaceCommunityPage from '../layout/tabbedLayout/Tabs/SpaceCommunityPage/SpaceCommunityPage';
import { useSpace } from '../context/useSpace';
import SpaceDashboardPage from '@/domain/space/layout/tabbedLayout/Tabs/SpaceDashboard/SpaceDashboardPage';

const getPageSection = (position: number | undefined): EntityPageSection => {
  switch (position) {
    case 1:
      return EntityPageSection.Community;
    case 2:
      return EntityPageSection.Subspaces;
    case 3:
      return EntityPageSection.KnowledgeBase;
    default:
      return EntityPageSection.Dashboard;
  }
};

const renderPage = (position: number | undefined) => {
  switch (position) {
    case 1:
      return <SpaceCommunityPage />;
    case 2:
      return <SpaceSubspacesPage />;
    case 3:
      return <SpaceKnowledgeBasePage calloutsFlowState={EntityPageSection.KnowledgeBase} />;
    default:
      return <SpaceDashboardPage />;
  }
};

const SpaceCalloutPage = (props: JourneyCalloutDialogProps) => {
  const { space } = useSpace();
  const about = space.about;

  const getPageRoute = (position: number | undefined) => {
    return `${about.profile.url}/${getPageSection(position)}`;
  };

  return <CalloutPage parentRoute={getPageRoute} renderPage={renderPage} {...props} />;
};

export default SpaceCalloutPage;
