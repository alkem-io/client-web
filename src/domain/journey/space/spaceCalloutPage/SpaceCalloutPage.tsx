import CalloutPage from '@/domain/collaboration/CalloutPage/CalloutPage';
import SpaceSubspacesPage from '../../../space/layout/TabbedSpaceL0/Tabs/SpaceSubspaces/SpaceSubspacesPage';
import SpaceKnowledgeBasePage from '@/domain/space/layout/TabbedSpaceL0/Tabs/SpaceKnowledgeBase/SpaceKnowledgeBasePage';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { JourneyCalloutDialogProps } from '@/domain/journey/common/JourneyCalloutDialog/JourneyCalloutDialog';
import SpaceCommunityPage from '../../../space/layout/TabbedSpaceL0/Tabs/SpaceCommunityPage/SpaceCommunityPage';
import { useSpace } from '../../../space/SpaceContext/useSpace';
import SpaceDashboardPage from '@/domain/space/layout/TabbedSpaceL0/Tabs/SpaceDashboard/SpaceDashboardPage';

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
