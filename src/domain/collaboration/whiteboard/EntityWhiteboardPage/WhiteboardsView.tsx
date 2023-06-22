import React, { FC } from 'react';
import WhiteboardsManagementViewWrapper from '../WhiteboardsManagement/WhiteboardsManagementViewWrapper';
import useBackToParentPage from '../../../shared/utils/useBackToParentPage';
import { JourneyTypeName } from '../../../challenge/JourneyTypeName';
import { WhiteboardProvider } from '../containers/WhiteboardProvider';
import { buildWhiteboardUrl, JourneyLocation } from '../../../../common/utils/urlBuilders';

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
  hubNameId,
  challengeNameId,
  opportunityNameId,
  ...props
}) => {
  const [backToExplore] = useBackToParentPage(parentUrl, { keepScroll: true });
  const backToWhiteboards = () => backToExplore();

  const whiteboardShareUrl = buildWhiteboardUrl(calloutNameId, whiteboardNameId, {
    hubNameId,
    challengeNameId,
    opportunityNameId,
  });

  return (
    <WhiteboardProvider
      whiteboardNameId={whiteboardNameId}
      calloutNameId={calloutNameId}
      hubNameId={hubNameId}
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
