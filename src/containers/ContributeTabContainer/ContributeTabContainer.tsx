import { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { AspectCardFragment, CreateAspectOnContextInput, Scalars } from '../../models/graphql-schema';
import { useApolloErrorHandler, useHub, useAspectsData } from '../../hooks';
import {
  AspectCardFragmentDoc,
  useCreateAspectFromContributeTabMutation,
  useDeleteAspectMutation,
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
  challengeNameId,
  opportunityNameId,
  ...rendered
}) => {
  const handleError = useApolloErrorHandler();
  const { template } = useHub();

  const { aspects, loading, error, canReadAspects, canCreateAspects, contextId } = useAspectsData({
    hubNameId,
    challengeNameId,
    opportunityNameId,
  });

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
