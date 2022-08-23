import React, { FC, useContext } from 'react';
import { useApolloErrorHandler, useUrlParams } from '../../hooks';
import {
  useCalloutAspectProviderQuery,
  useChallengeAspectProviderQuery,
  useHubAspectProviderQuery,
  useOpportunityAspectProviderQuery,
} from '../../hooks/generated/graphql';
import { ApolloError } from '@apollo/client';
import { AuthorizationPrivilege, CalloutType } from '../../models/graphql-schema';
import { getCardCallout } from '../../containers/aspect/getAspectCallout';

interface AspectPermissions {
  canUpdate: boolean;
}

interface AspectContextProps {
  id?: string;
  nameId?: string;
  displayName?: string;
  permissions: AspectPermissions;
  loading: boolean;
  error?: ApolloError;
}

const AspectContext = React.createContext<AspectContextProps>({
  loading: false,
  permissions: {
    canUpdate: true,
  },
});

const AspectProvider: FC = ({ children }) => {
  const { hubNameId = '', challengeNameId = '', opportunityNameId = '', aspectNameId = '' } = useUrlParams();

  const handleError = useApolloErrorHandler();
  const isAspectDefined = aspectNameId && hubNameId;
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
  const calloutId = hubAspectsCallout?.id ?? challengeAspectsCallout?.id ?? opportunityAspectsCallout?.id ?? '';

  const {
    data: hubData,
    loading: hubLoading,
    error: hubError,
  } = useHubAspectProviderQuery({
    variables: { hubNameId, aspectNameId, calloutId },
    skip: !isAspectDefined || !!(challengeNameId || opportunityNameId),
    onError: handleError,
  });
  const hubAspect = getCardCallout(hubData?.hub?.collaboration?.callouts, aspectNameId)?.aspects?.find(
    x => x.nameID === aspectNameId
  );
  const {
    data: challengeData,
    loading: challengeLoading,
    error: challengeError,
  } = useChallengeAspectProviderQuery({
    variables: { hubNameId, challengeNameId, aspectNameId, calloutId },
    skip: !isAspectDefined || !challengeNameId || !!opportunityNameId,
    onError: handleError,
  });
  const challengeAspect = getCardCallout(
    challengeData?.hub?.challenge?.collaboration?.callouts,
    aspectNameId
  )?.aspects?.find(x => x.nameID === aspectNameId);

  const {
    data: opportunityData,
    loading: opportunityLoading,
    error: opportunityError,
  } = useOpportunityAspectProviderQuery({
    variables: { hubNameId, opportunityNameId, aspectNameId, calloutId },
    skip: !isAspectDefined || !opportunityNameId,
    onError: handleError,
  });
  const opportunityAspect = getCardCallout(
    opportunityData?.hub?.opportunity?.collaboration?.callouts,
    aspectNameId
  )?.aspects?.find(x => x.nameID === aspectNameId);

  const aspect = hubAspect ?? challengeAspect ?? opportunityAspect;
  const loading = hubLoading || challengeLoading || opportunityLoading;
  const error = hubError ?? challengeError ?? opportunityError;

  const myPrivileges = aspect?.authorization?.myPrivileges;
  const permissions: AspectPermissions = {
    canUpdate: myPrivileges?.includes(AuthorizationPrivilege.Update) ?? true,
  };

  return (
    <AspectContext.Provider
      value={{
        loading,
        error,
        id: aspect?.id,
        nameId: aspect?.nameID,
        displayName: aspect?.displayName,
        permissions,
      }}
    >
      {children}
    </AspectContext.Provider>
  );
};
export default AspectProvider;

export const useAspect = () => useContext(AspectContext);
