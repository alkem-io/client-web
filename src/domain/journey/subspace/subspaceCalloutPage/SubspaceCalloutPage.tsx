import CalloutPage from '@/domain/collaboration/CalloutPage/CalloutPage';
import SubspaceHomePage from '../../../space/layout/SubspaceFlow/SubspaceHomePage';
import { JourneyCalloutDialogProps } from '@/domain/journey/common/JourneyCalloutDialog/JourneyCalloutDialog';
import { useSubSpace } from '../hooks/useSubSpace';

const renderPage = () => <SubspaceHomePage />;

const ChallengeCalloutPage = (props: JourneyCalloutDialogProps) => {
  const { about } = useSubSpace();

  const getPageRoute = () => about.profile.url;

  return <CalloutPage parentRoute={getPageRoute} renderPage={renderPage} {...props} />;
};

export default ChallengeCalloutPage;
