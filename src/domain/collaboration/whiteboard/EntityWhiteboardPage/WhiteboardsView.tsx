import React, { FC } from 'react';
import WhiteboardsManagementViewWrapper from '../WhiteboardsManagement/WhiteboardsManagementViewWrapper';
import useBackToParentPage from '../../../shared/utils/useBackToParentPage';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';
import { WhiteboardProvider } from '../containers/WhiteboardProvider';
import { buildWhiteboardUrl, JourneyLocation } from '../../../../main/routing/urlBuilders';

export interface WhiteboardsPageProps extends JourneyLocation {
  whiteboardNameId: string;
  calloutNameId: string;
  parentUrl: string;
  journeyTypeName: JourneyTypeName;
}

const WhiteboardsView: FC<WhiteboardsPageProps> = ({
  whiteboardNameId,
  parentUrl,
  calloutNameId,
  spaceNameId,
  challengeNameId,
  opportunityNameId,
  ...props
}) => {
  const [backToExplore] = useBackToParentPage(parentUrl, { keepScroll: true });
  const backToWhiteboards = () => backToExplore();

  const whiteboardShareUrl = buildWhiteboardUrl(calloutNameId, whiteboardNameId, {
    spaceNameId,
    challengeNameId,
    opportunityNameId,
  });

  return (
    <WhiteboardProvider
      whiteboardNameId={whiteboardNameId}
      calloutNameId={calloutNameId}
      spaceNameId={spaceNameId}
      challengeNameId={challengeNameId}
      opportunityNameId={opportunityNameId}
    >
      {(entities, state) => (
        <WhiteboardsManagementViewWrapper
          whiteboardNameId={whiteboardNameId}
          backToWhiteboards={backToWhiteboards}
          whiteboardShareUrl={whiteboardShareUrl}
          {...entities}
          {...state}
          {...props}
        />
      )}
    </WhiteboardProvider>
  );
};

export default WhiteboardsView;
