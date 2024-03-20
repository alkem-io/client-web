import React, { FC } from 'react';
import useBackToParentPage from '../../../../core/routing/deprecated/useBackToParentPage';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';
import { useCalloutIdQuery } from '../../../../core/apollo/generated/apollo-hooks';
import WhiteboardView from '../WhiteboardsManagement/WhiteboardView';
import { WhiteboardProvider } from '../containers/WhiteboardProvider';

export interface WhiteboardPageProps {
  journeyId: string | undefined;
  whiteboardNameId: string;
  calloutNameId: string;
  parentUrl: string;
  journeyTypeName: JourneyTypeName;
}

const WhiteboardPage: FC<WhiteboardPageProps> = ({
  journeyId,
  whiteboardNameId,
  parentUrl,
  calloutNameId,
  journeyTypeName,
  ...props
}) => {
  const [backToExplore] = useBackToParentPage(parentUrl, { keepScroll: true });
  const backToWhiteboards = () => backToExplore();

  const { data } = useCalloutIdQuery({
    variables: {
      calloutNameId,
      spaceId: journeyId,
      challengeId: journeyId,
      opportunityId: journeyId,
      isSpace: journeyTypeName === 'space',
      isChallenge: journeyTypeName === 'challenge',
      isOpportunity: journeyTypeName === 'opportunity',
    },
    skip: !calloutNameId || !journeyId,
  });

  const calloutId =
    data?.space.collaboration?.callouts?.[0].id ??
    data?.lookup.challenge?.collaboration?.callouts?.[0].id ??
    data?.lookup.opportunity?.collaboration?.callouts?.[0].id;

  return (
    <WhiteboardProvider whiteboardNameId={whiteboardNameId} calloutId={calloutId}>
      {(entities, state) => (
        <WhiteboardView
          whiteboardId={entities.whiteboard?.id}
          backToWhiteboards={backToWhiteboards}
          journeyTypeName={journeyTypeName}
          whiteboardShareUrl={entities.whiteboard?.profile.url ?? ''}
          whiteboard={entities.whiteboard}
          authorization={entities.whiteboard?.authorization}
          loadingWhiteboards={state.loadingWhiteboards}
          {...props}
        />
      )}
    </WhiteboardProvider>
  );
};

export default WhiteboardPage;
