import { useApolloErrorHandler } from './index';
import { useCalloutAspectProviderQuery } from './generated/graphql';
import { CalloutType } from '../models/graphql-schema';

export interface CalloutFromAspectProps {
  hubNameId: string;
  aspectNameId: string;
}

export interface AspectsData {
  calloutId: string | undefined;
}

export const useCalloutFromAspect = ({ hubNameId, aspectNameId }: CalloutFromAspectProps): AspectsData => {
  const handleError = useApolloErrorHandler();

  const { data: hubCalloutAspectData } = useCalloutAspectProviderQuery({
    variables: { hubNameId },
    onError: handleError,
  });
  const hubAspectsCallout = hubCalloutAspectData?.hub.collaboration?.callouts?.find(
    x => x.type === CalloutType.Card && x.aspects?.find(x => x.nameID === aspectNameId)
  );
  const challengeAspectsCallout = hubCalloutAspectData?.hub.challenges
    ?.flatMap(x => x.collaboration)
    .flatMap(x => x?.callouts)
    .find(x => x?.type === CalloutType.Card && x.aspects?.find(x => x.nameID === aspectNameId));
  const opportunityAspectsCallout = hubCalloutAspectData?.hub.challenges
    ?.flatMap(x => x.opportunities)
    .flatMap(x => x?.collaboration)
    .flatMap(x => x?.callouts)
    .find(x => x?.type === CalloutType.Card && x.aspects?.find(x => x.nameID === aspectNameId));
  const calloutId = hubAspectsCallout?.id ?? challengeAspectsCallout?.id ?? opportunityAspectsCallout?.id;

  return {
    calloutId,
  };
};
