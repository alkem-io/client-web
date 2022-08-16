import { isChallengeId, isHubId, isOpportunityId, OptionalCoreEntityIds } from '../shared/types/CoreEntityIds';
import {
  useChallengeCalloutsQuery,
  useHubCalloutsQuery,
  useOpportunityCalloutsQuery,
} from '../../hooks/generated/graphql';
import {
  AuthorizationPrivilege,
  Callout,
  CalloutType,
  CanvasDetailsFragment,
  ContributeTabAspectFragment,
} from '../../models/graphql-schema';

interface CalloutChildTypePropName {
  [CalloutType.Card]: 'aspects';
  [CalloutType.Canvas]: 'canvases';
}

interface CalloutChildPropValue {
  aspects: ContributeTabAspectFragment[];
  canvases: CanvasDetailsFragment[];
}

type CalloutWithChildType<PropName extends keyof CalloutChildPropValue> = {
  [P in PropName]: CalloutChildPropValue[P];
};

type CalloutTypesWithChildTypes = {
  [Type in keyof CalloutChildTypePropName]: { type: Type } & CalloutWithChildType<CalloutChildTypePropName[Type]>;
};

type TypedCallout = Pick<Callout, 'id' | 'displayName' | 'nameID' | 'description'> &
  (CalloutTypesWithChildTypes[CalloutType.Card] | CalloutTypesWithChildTypes[CalloutType.Canvas]) & {
    draft: boolean;
    editable: boolean;
  };

const useCallouts = (params: OptionalCoreEntityIds) => {
  const { data: hubCalloutsData, loading: hubCalloutsLoading } = useHubCalloutsQuery({
    variables: isHubId(params) ? params : (params as never),
    skip: !isHubId(params),
  });

  const { data: challengeCalloutsData, loading: challengeCalloutsLoading } = useChallengeCalloutsQuery({
    variables: isChallengeId(params) ? params : (params as never),
    skip: !isChallengeId(params),
  });

  const { data: opportunityCalloutsData, loading: opportunityCalloutsLoading } = useOpportunityCalloutsQuery({
    variables: isOpportunityId(params) ? params : (params as never),
    skip: !isOpportunityId(params),
  });

  const { collaboration } =
    hubCalloutsData?.hub ?? challengeCalloutsData?.hub.challenge ?? opportunityCalloutsData?.hub.opportunity ?? {};

  const canCreateCallout = collaboration?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.CreateCallout);

  const callouts = collaboration?.callouts?.map(({ authorization, ...callout }) => {
    const draft = false;
    const editable = authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update);
    return {
      ...callout,
      draft,
      editable,
    } as TypedCallout;
  });

  return {
    callouts,
    canCreateCallout,
    loading: hubCalloutsLoading || challengeCalloutsLoading || opportunityCalloutsLoading,
  };
};

export default useCallouts;
