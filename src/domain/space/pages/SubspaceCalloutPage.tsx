import CalloutPage from '@/domain/collaboration/CalloutPage/CalloutPage';
import type { SpaceCalloutDialogProps } from '@/domain/space/pages/SpaceCalloutDialogProps';
import { useSubSpace } from '../hooks/useSubSpace';
import SubspaceHomePage from '../layout/flowLayout/SubspaceHomePage';

const renderPage = () => <SubspaceHomePage />;

const SubspaceCalloutPage = (props: SpaceCalloutDialogProps) => {
  const { subspace } = useSubSpace();

  const getPageRoute = () => subspace.about.profile.url;

  return <CalloutPage parentRoute={getPageRoute} renderPage={renderPage} {...props} />;
};

export default SubspaceCalloutPage;
