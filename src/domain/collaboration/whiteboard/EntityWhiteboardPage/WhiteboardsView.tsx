import React, { FC } from 'react';
import WhiteboardsManagementViewWrapper from '../WhiteboardsManagement/WhiteboardsManagementViewWrapper';
import useBackToParentPage from '../../../shared/utils/useBackToParentPage';
import { JourneyTypeName } from '../../../challenge/JourneyTypeName';
import { WhiteboardProvider } from '../containers/WhiteboardProvider';
import { buildWhiteboardUrl, JourneyLocation } from '../../../../common/utils/urlBuilders';
import { useCalloutIdQuery } from '../../../../core/apollo/generated/apollo-hooks';

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
  const { data } = useCalloutIdQuery({
    variables: {
      calloutNameId,
      spaceNameId,
      challengeNameId,
      opportunityNameId,
      includeSpace: !challengeNameId && !opportunityNameId,
      includeChallenge: !!challengeNameId && !opportunityNameId,
      includeOpportunity: !!challengeNameId && !!opportunityNameId,
    },
    skip: !spaceNameId || !calloutNameId,
  });

  const calloutId =
    data?.space.collaboration?.callouts?.[0].id ??
    data?.space.challenge?.collaboration?.callouts?.[0].id ??
    data?.space.opportunity?.collaboration?.callouts?.[0].id;

  return (
    <WhiteboardProvider whiteboardNameId={whiteboardNameId} calloutId={calloutId} spaceId={spaceNameId}>
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
