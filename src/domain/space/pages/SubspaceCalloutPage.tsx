import CalloutPage from '@/domain/collaboration/CalloutPage/CalloutPage';
import SubspaceHomePage from '../layout/flowLayout/SubspaceHomePage';
import { JourneyCalloutDialogProps } from '@/domain/space/pages/SpaceCalloutDialogProps';
import { useSubSpace } from '../hooks/useSubSpace';

const renderPage = () => <SubspaceHomePage />;

const ChallengeCalloutPage = (props: JourneyCalloutDialogProps) => {
  const { subspace } = useSubSpace();

  const getPageRoute = () => subspace.about.profile.url;

  return <CalloutPage parentRoute={getPageRoute} renderPage={renderPage} {...props} />;
};

export default ChallengeCalloutPage;
