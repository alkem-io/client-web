import CalloutPage from '@/domain/collaboration/CalloutPage/CalloutPage';
import SubspaceHomePage from '../subspaceHome/SubspaceHomePage';
import { JourneyCalloutDialogProps } from '@/domain/journey/common/JourneyCalloutDialog/JourneyCalloutDialog';
import { useSubSpace } from '../hooks/useSubSpace';

const renderPage = () => <SubspaceHomePage />;

const ChallengeCalloutPage = (props: JourneyCalloutDialogProps) => {
  const { profile } = useSubSpace();

  const getPageRoute = () => profile.url;

  return <CalloutPage parentRoute={getPageRoute} renderPage={renderPage} {...props} />;
};

export default ChallengeCalloutPage;
