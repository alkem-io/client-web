import React from 'react';
import CalloutPage from '../../../collaboration/CalloutPage/CalloutPage';
import SubspaceHomePage from '../subspaceHome/SubspaceHomePage';
import { JourneyCalloutDialogProps } from '../../common/JourneyCalloutDialog/JourneyCalloutDialog';
import { useSubSpace } from '../hooks/useChallenge';

const renderPage = () => <SubspaceHomePage />;

const ChallengeCalloutPage = (props: JourneyCalloutDialogProps) => {
  const { profile } = useSubSpace();

  const getPageRoute = () => profile.url;

  return <CalloutPage journeyTypeName="subspace" parentRoute={getPageRoute} renderPage={renderPage} {...props} />;
};

export default ChallengeCalloutPage;
