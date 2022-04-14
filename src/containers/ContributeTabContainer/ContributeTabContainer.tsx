import { FC, useMemo } from 'react';
import { ApolloError } from '@apollo/client';
import {
  AspectCardFragment,
  AuthorizationPrivilege,
  CreateAspectOnContextInput,
  Scalars,
} from '../../models/graphql-schema';
import { useApolloErrorHandler, useHub } from '../../hooks';
import {
  AspectCardFragmentDoc,
  useChallengeAspectsQuery,
  useCreateAspectFromContributeTabMutation,
  useDeleteAspectMutation,
  useHubAspectsQuery,
  useOpportunityAspectsQuery,
  usePrivilegesOnChallengeContextQuery,
  usePrivilegesOnHubContextQuery,
  usePrivilegesOnOpportunityContextQuery,
} from '../../hooks/generated/graphql';
import { ContainerPropsWithProvided, renderComponentOrChildrenFn } from '../../utils/containers/ComponentOrChildrenFn';
import removeFromCache from '../../utils/apollo-cache/removeFromCache';

export interface EntityIds {
  hubNameId: Scalars['UUID_NAMEID'];
  challengeNameId?: Scalars['UUID_NAMEID'];
  opportunityNameId?: Scalars['UUID_NAMEID'];
}

export type OnCreateInput = Omit<CreateAspectOnContextInput, 'contextID'>;
export type AspectWithPermissions = AspectCardFragment & { canDelete: boolean | undefined };

export interface Provided {
  canReadAspects: boolean;
  canCreateAspects: boolean;
  aspects?: AspectWithPermissions[];
  aspectTypes?: string[];
  loading: boolean;
  creating: boolean;
  deleting: boolean;
  error?: ApolloError;
  onCreate: (aspect: OnCreateInput) => Promise<{ nameID: string } | undefined>;
  onDelete: (ID: string) => void;
}

export type ContributeContainerProps = ContainerPropsWithProvided<EntityIds, Provided>;

const ContributeTabContainer: FC<ContributeContainerProps> = ({
  hubNameId,
  challengeNameId = '',
  opportunityNameId = '',
  ...rendered
}) => {
  const handleError = useApolloErrorHandler();
  const { template, loading: hubLoading } = useHub();

  const {
    data: hubContextData,
    loading: hubContextLoading,
    error: hubContextError,
  } = usePrivilegesOnHubContextQuery({
    variables: { hubNameId },
    skip: !!(challengeNameId || opportunityNameId),
    onError: handleError,
  });
  const hubContext = hubContextData?.hub?.context;
  const hubContextPrivileges = hubContext?.authorization?.myPrivileges;
  const canReadHubContext = hubContextPrivileges?.includes(AuthorizationPrivilege.Read);
  const canCreateAspectOnHub = hubContextPrivileges?.includes(AuthorizationPrivilege.CreateAspect);
  const {
    data: hubAspectData,
    loading: hubAspectLoading,
    error: hubAspectError,
  } = useHubAspectsQuery({
    variables: { hubNameId },
    skip: !canReadHubContext || !!(challengeNameId || opportunityNameId),
    onError: handleError,
  });
  const hubAspects = hubAspectData?.hub?.context?.aspects;

  const {
    data: challengeContextData,
    loading: challengeContextLoading,
    error: challengeContextError,
  } = usePrivilegesOnChallengeContextQuery({
    variables: { hubNameId, challengeNameId },
    skip: !challengeNameId || !!opportunityNameId,
    onError: handleError,
  });
  const challengeContext = challengeContextData?.hub?.challenge?.context;
  const challengeContextPrivileges = challengeContext?.authorization?.myPrivileges;
  const canReadChallengeContext = challengeContextPrivileges?.includes(AuthorizationPrivilege.Read);
  const canCreateAspectOnChallenge = challengeContextPrivileges?.includes(AuthorizationPrivilege.CreateAspect);

  const {
    data: challengeAspectData,
    loading: challengeAspectLoading,
    error: challengeAspectError,
  } = useChallengeAspectsQuery({
    variables: { hubNameId, challengeNameId },
    skip: !canReadChallengeContext || !challengeNameId || !!opportunityNameId,
    onError: handleError,
  });
  const challengeAspects = challengeAspectData?.hub?.challenge?.context?.aspects;

  const {
    data: opportunityContextData,
    loading: opportunityContextLoading,
    error: opportunityContextError,
  } = usePrivilegesOnOpportunityContextQuery({
    variables: { hubNameId, opportunityNameId },
    skip: !opportunityNameId,
    onError: handleError,
  });
  const opportunityContext = opportunityContextData?.hub?.opportunity?.context;
  const opportunityContextPrivileges = opportunityContext?.authorization?.myPrivileges;
  const canReadOpportunityContext = opportunityContextPrivileges?.includes(AuthorizationPrivilege.Read);
  const canCreateAspectOnOpportunity = opportunityContextPrivileges?.includes(AuthorizationPrivilege.CreateAspect);

  const {
    data: opportunityAspectData,
    loading: opportunityAspectLoading,
    error: opportunityAspectError,
  } = useOpportunityAspectsQuery({
    variables: { hubNameId, opportunityNameId },
    skip: !canReadOpportunityContext || !opportunityNameId,
    onError: handleError,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  });
  const opportunityAspects = opportunityAspectData?.hub?.opportunity?.context?.aspects;

  const aspects: AspectWithPermissions[] | undefined = useMemo(
    () =>
      (hubAspects ?? challengeAspects ?? opportunityAspects)?.map(x => ({
        ...x,
        canDelete: x?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Delete),
      })),
    [hubAspects, challengeAspects, opportunityAspects]
  );
  const loading =
    hubContextLoading ||
    challengeContextLoading ||
    opportunityContextLoading ||
    hubAspectLoading ||
    challengeAspectLoading ||
    opportunityAspectLoading ||
    hubLoading;
  const error =
    hubContextError ??
    challengeContextError ??
    opportunityContextError ??
    hubAspectError ??
    challengeAspectError ??
    opportunityAspectError;

  const canReadAspects = canReadHubContext ?? canReadChallengeContext ?? canReadOpportunityContext ?? true;
  const canCreateAspects = canCreateAspectOnHub ?? canCreateAspectOnChallenge ?? canCreateAspectOnOpportunity ?? false;

  const contextId = hubContext?.id ?? challengeContext?.id ?? opportunityContext?.id;

  const aspectTypes = template.aspectTemplates.map(x => x.type);

  const [createAspect, { loading: creating }] = useCreateAspectFromContributeTabMutation({
    onError: handleError,
    update: (cache, { data }) => {
      if (!data) {
        return;
      }
      const { createAspectOnContext } = data;

      const contextRefId = cache.identify({
        __typename: 'Context',
        id: contextId,
      });

      if (!contextRefId) {
        return;
      }

      cache.modify({
        id: contextRefId,
        fields: {
          aspects(existingAspects = []) {
            const newAspectRef = cache.writeFragment({
              data: createAspectOnContext,
              fragment: AspectCardFragmentDoc,
              fragmentName: 'AspectCard',
            });
            return [...existingAspects, newAspectRef];
          },
        },
      });
    },
  });

  const onCreate = async (aspect: OnCreateInput) => {
    const { data } = await createAspect({
      variables: {
        aspectData: {
          contextID: contextId!,
          displayName: aspect.displayName,
          description: aspect.description,
          type: aspect.type,
          tags: aspect.tags,
        },
      },
      optimisticResponse: {
        createAspectOnContext: {
          __typename: 'Aspect',
          id: '',
          nameID: '',
          displayName: aspect.displayName ?? '',
          description: aspect.description,
          type: aspect.type,
          tagset: {
            id: '-1',
            name: 'default',
            tags: aspect.tags ?? [],
          },
          banner: {
            id: '-1',
            name: '',
            uri: '',
          },
          bannerNarrow: {
            id: '-1',
            name: '',
            uri: '',
          },
        },
      },
    });

    const nameID = data?.createAspectOnContext.nameID;

    return nameID ? { nameID } : undefined;
  };

  const [deleteAspect, { loading: deleting }] = useDeleteAspectMutation({
    onError: handleError,
    update: removeFromCache,
  });
  const onDelete = (ID: string) => {
    deleteAspect({
      variables: { input: { ID } },
    });
  };

  return renderComponentOrChildrenFn(rendered, {
    aspects,
    aspectTypes,
    loading,
    creating,
    deleting,
    error,
    canReadAspects,
    canCreateAspects,
    onCreate,
    onDelete,
  });
};

export default ContributeTabContainer;
