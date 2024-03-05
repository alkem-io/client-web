import React, { FC } from 'react';
import useBackToParentPage from '../../../../core/routing/deprecated/useBackToParentPage';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';
import { buildWhiteboardUrl, JourneyLocation } from '../../../../main/routing/urlBuilders';
import { useCalloutIdQuery } from '../../../../core/apollo/generated/apollo-hooks';
import WhiteboardView from '../WhiteboardsManagement/WhiteboardView';
import { WhiteboardProvider } from '../containers/WhiteboardProvider';

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
  journeyTypeName,
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
      isSpace: journeyTypeName === 'space',
      isChallenge: journeyTypeName === 'challenge',
      isOpportunity: journeyTypeName === 'opportunity',
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
        <WhiteboardView
          whiteboardId={entities.whiteboard?.id}
          backToWhiteboards={backToWhiteboards}
          journeyTypeName={journeyTypeName}
          whiteboardShareUrl={whiteboardShareUrl}
          whiteboard={entities.whiteboard}
          authorization={entities.whiteboard?.authorization}
          loadingWhiteboards={state.loadingWhiteboards}
          {...props}
        />
      )}
    </WhiteboardProvider>
  );
};

export default WhiteboardsView;
