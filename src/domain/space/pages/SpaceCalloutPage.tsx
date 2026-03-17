import CalloutPage from '@/domain/collaboration/CalloutPage/CalloutPage';
import type { SpaceCalloutDialogProps } from '@/domain/space/pages/SpaceCalloutDialogProps';
import { SpaceTabbedPages } from '@/domain/space/routing/SpaceRoutes';
import { buildSpaceSectionUrl } from '@/main/routing/urlBuilders';
import { useSpace } from '../context/useSpace';

const renderPage = () => <SpaceTabbedPages />;

const SpaceCalloutPage = (props: SpaceCalloutDialogProps) => {
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
