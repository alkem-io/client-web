import CalloutPage from '@/domain/collaboration/CalloutPage/CalloutPage';
import SpaceSubspacesPage from '../layout/tabbedLayout/Tabs/SpaceSubspacesPage';
import SpaceKnowledgeBasePage from '@/domain/space/layout/tabbedLayout/Tabs/SpaceKnowledgeBase/SpaceKnowledgeBasePage';
import { JourneyCalloutDialogProps } from '@/domain/space/pages/SpaceCalloutDialogProps';
import SpaceCommunityPage from '../layout/tabbedLayout/Tabs/SpaceCommunityPage/SpaceCommunityPage';
import { useSpace } from '../context/useSpace';
import SpaceDashboardPage from '@/domain/space/layout/tabbedLayout/Tabs/SpaceDashboard/SpaceDashboardPage';
import { buildSpaceSectionUrl } from '@/main/routing/urlBuilders';

const renderPage = (sectionIndex: number | undefined) => {
  switch (sectionIndex) {
    case 0:
      return <SpaceDashboardPage />;
    case 1:
      return <SpaceCommunityPage />;
    case 2:
      return <SpaceSubspacesPage />;
    case 3:
    case 4:
      return <SpaceKnowledgeBasePage sectionIndex={sectionIndex} />;
    default: {
      return undefined;
    }
  }
};

const SpaceCalloutPage = (props: JourneyCalloutDialogProps) => {
  const { space } = useSpace();
  const about = space.about;

  const getPageRoute = (sectionIndex: number | undefined) => {
    if (sectionIndex === undefined) {
      return about.profile.url;
    } else {
      return buildSpaceSectionUrl(about.profile.url, sectionIndex + 1);
    }
  };

  return <CalloutPage parentRoute={getPageRoute} renderPage={renderPage} {...props} />;
};

export default SpaceCalloutPage;
