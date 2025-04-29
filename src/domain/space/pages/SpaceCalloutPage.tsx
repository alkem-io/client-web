import CalloutPage from '@/domain/collaboration/CalloutPage/CalloutPage';
import { SpaceCalloutDialogProps } from '@/domain/space/pages/SpaceCalloutDialogProps';
import { useSpace } from '../context/useSpace';
import { buildSpaceSectionUrl } from '@/main/routing/urlBuilders';
import { SpaceTabbedPages } from '@/domain/space/routing/SpaceRoutes';

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
