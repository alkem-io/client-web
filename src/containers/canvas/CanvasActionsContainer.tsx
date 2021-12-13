import { useApolloClient } from '@apollo/client';
import { FC, useCallback, useMemo } from 'react';
import { useUrlParams } from '../../hooks';
import {
  CanvasDetailsFragmentDoc,
  useChallengeCanvasValuesQuery,
  useCheckoutCanvasOnContextMutation,
  useCreateCanvasOnContextMutation,
  useDeleteCanvasOnContextMutation,
  useEcoverseCanvasValuesQuery,
  useOpportunityCanvasValuesQuery,
  useUpdateCanvasOnContextMutation,
} from '../../hooks/generated/graphql';
import { ContainerProps } from '../../models/container';
import { CanvasWithoutValue } from '../../models/entities/canvas';
import {
  Canvas,
  CanvasCheckoutStateEnum,
  CreateCanvasOnContextInput,
  DeleteCanvasOnContextInput,
} from '../../models/graphql-schema';
import { evictFromCache } from '../../utils/apollo-cache/removeFromCache';

export interface ICanvasActions {
  onCreate: (canvas: CreateCanvasOnContextInput) => Promise<void>;
  onDelete: (canvas: DeleteCanvasOnContextInput) => Promise<void>;
  onLoad: (canvas: CanvasWithoutValue) => Promise<Canvas | undefined>;
  onCheckout: (canvas: Canvas) => void;
  onCheckin: (canvas: Canvas) => void;
  onUpdate: (canvas: Canvas) => void;
  onPromoteToTemplate: (canvas: Canvas) => void;
}

export interface CanvasActionsContainerState {
  creatingCanvas?: boolean;
  deletingCanvas?: boolean;
  changingCanvasLockState?: boolean;
  updatingCanvas?: boolean;
  loadinggCanvasValue?: boolean;
}

export interface CanvasActionsContainerProps extends ContainerProps<{}, ICanvasActions, CanvasActionsContainerState> {}

const CanvasActionsContainer: FC<CanvasActionsContainerProps> = ({ children }) => {
  const { ecoverseNameId: ecoverseId, challengeNameId: challengeId, opportunityNameId: opportunityId } = useUrlParams();
  const client = useApolloClient();

  // TODO: Attempted to modify cache in order to load canvas values on demand. Not working for some reason.
  const modifyCanvasCache = (canvas?: Pick<Canvas, 'id' | 'value'>) => {
    client.cache.modify({
      id: client.cache.identify({
        id: canvas?.id,
        __typename: 'Canvas',
      }),
      fields: {
        value(v) {
          if (canvas?.value) {
            return canvas.value;
          }
          return v;
        },
      },
    });
  };

  const { loading: loadingEcoverseCanvasValue, refetch: loadEcoverseCanvas } = useEcoverseCanvasValuesQuery({
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-and-network',
    skip: true, // implement something similar to lazy query, but this will handle cache update & allow returning result
    onCompleted: data => modifyCanvasCache(data.ecoverse.context?.canvases?.find(x => x)),
  });
  const { loading: loadingChallengeCanvasValue, refetch: loadChallengeCanvas } = useChallengeCanvasValuesQuery({
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-and-network',
    skip: true, // implement something similar to lazy query, but this will handle cache update & allow returning result
    onCompleted: data => modifyCanvasCache(data.ecoverse.challenge?.context?.canvases?.find(x => x)),
  });
  const { loading: loadingOpportunityCanvasValue, refetch: loadOpportunityCanvas } = useOpportunityCanvasValuesQuery({
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-and-network',
    skip: true, // implement something similar to lazy query, but this will handle cache update & allow returning result
    onCompleted: data => modifyCanvasCache(data.ecoverse.opportunity?.context?.canvases?.find(x => x)),
  });

  const loadCanvas = useCallback(
    async (
      canvas: Pick<Canvas, 'id'>,
      params?: {
        hubId?: string;
        challengeId?: string;
        opportunityId?: string;
      }
    ) => {
      let queryOpportunityId: string | undefined = opportunityId;
      let queryChallengeId: string | undefined = challengeId;
      let queryEcoverseId: string | undefined = ecoverseId;

      if (params) {
        queryOpportunityId = params?.opportunityId;
        queryChallengeId = params?.challengeId;
        queryEcoverseId = params?.hubId;
      }

      let canvases: Canvas[] | undefined = [];
      if (queryOpportunityId && queryEcoverseId) {
        const result = await loadOpportunityCanvas({
          ecoverseId: queryEcoverseId,
          opportunityId: queryOpportunityId,
          canvasId: canvas.id,
        });

        canvases = result.data.ecoverse?.opportunity?.context?.canvases as any;
      } else if (queryChallengeId && queryEcoverseId) {
        const result = await loadChallengeCanvas({
          ecoverseId: queryEcoverseId,
          challengeId: queryChallengeId,
          canvasId: canvas.id,
        });

        canvases = result.data.ecoverse?.challenge?.context?.canvases as any;
      } else if (queryEcoverseId) {
        const result = await loadEcoverseCanvas({
          ecoverseId: queryEcoverseId,
          canvasId: canvas.id,
        });
        canvases = result.data.ecoverse?.context?.canvases as any;
      }

      // return the first
      return canvases?.find(x => x);
    },
    [loadEcoverseCanvas, loadChallengeCanvas, loadOpportunityCanvas, ecoverseId, challengeId, opportunityId]
  );

  const [createCanvas, { loading: creatingCanvas }] = useCreateCanvasOnContextMutation();

  const handleCreateCanvas = async (canvas: CreateCanvasOnContextInput) => {
    if (!canvas.contextID) {
      throw new Error('[canvas:onCreate]: Missing contextID');
    }

    await createCanvas({
      update(cache, { data }) {
        cache.modify({
          id: cache.identify({
            id: canvas.contextID,
            __typename: 'Context',
          }),
          fields: {
            canvases(existingCanvases = []) {
              if (data) {
                const newCanvas = cache.writeFragment({
                  data: data?.createCanvasOnContext,
                  fragment: CanvasDetailsFragmentDoc,
                  fragmentName: 'CanvasDetails',
                });
                return [...existingCanvases, newCanvas];
              }
              return existingCanvases;
            },
          },
        });
      },
      variables: {
        input: canvas,
      },
    });
  };

  const [deleteCanvas, { loading: deletingCanvas }] = useDeleteCanvasOnContextMutation();

  const handleDeleteCanvas = async (canvas: DeleteCanvasOnContextInput) => {
    if (!canvas.contextID) {
      throw new Error('[canvas:onDelete]: Missing contextID');
    }
    if (!canvas.canvasID) {
      throw new Error('[canvas:onDelete]: Missing canvasID');
    }

    await deleteCanvas({
      update: (cache, { data }) => {
        const output = data?.deleteCanvasOnContext;
        if (output) {
          evictFromCache(cache, String(output.id), 'Canvas');
        }
      },
      variables: {
        input: canvas,
      },
    });
  };

  const [checkoutCanvas, { loading: checkingoutCanvas }] = useCheckoutCanvasOnContextMutation();

  const handleCheckoutCanvas = async (canvas: Canvas) => {
    if (!canvas.checkout?.id) {
      throw new Error('[canvas:onCheckInOut]: Missing canvas.checkout.id');
    }

    await checkoutCanvas({
      update: (cache, { data }) => {
        cache.modify({
          id: cache.identify({
            id: canvas.id,
            __typename: 'Canvas',
          }),
          fields: {
            checkout(existingCheckout) {
              const output = data?.eventOnCanvasCheckout;
              if (output) {
                return output;
              }
              return existingCheckout;
            },
          },
        });
      },
      variables: {
        input: {
          canvasCheckoutID: canvas.checkout?.id,
          eventName:
            (canvas.checkout.status === CanvasCheckoutStateEnum.CheckedOut &&
              canvas.checkout?.lifecycle?.nextEvents?.find(e => e === 'CHECKIN')) ||
            'CHECKOUT',
        },
      },
    });
  };

  const [updateCanvas, { loading: updatingCanvas }] = useUpdateCanvasOnContextMutation();
  const handleUpdateCanvas = async (canvas: Canvas) => {
    if (!canvas.id) {
      throw new Error('[canvas:onUpdate]: Missing canvas.checkout.id');
    }

    await updateCanvas({
      variables: {
        input: {
          ID: canvas.id,
          name: canvas.name,
          isTemplate: canvas.isTemplate,
          value: canvas.value,
        },
      },
    });
  };

  const handlePromotionToTemplate = async (canvas: Canvas) => {
    await handleUpdateCanvas({ ...canvas, isTemplate: true });
  };

  const actions = useMemo<ICanvasActions>(
    () => ({
      onCreate: handleCreateCanvas,
      onDelete: handleDeleteCanvas,
      onLoad: loadCanvas,
      onCheckin: handleCheckoutCanvas,
      onCheckout: handleCheckoutCanvas,
      onUpdate: handleUpdateCanvas,
      onPromoteToTemplate: handlePromotionToTemplate,
    }),
    [handleCreateCanvas, handleDeleteCanvas, handleCheckoutCanvas, handleUpdateCanvas]
  );
  return (
    <>
      {children(
        {},
        {
          creatingCanvas,
          deletingCanvas,
          changingCanvasLockState: checkingoutCanvas,
          updatingCanvas,
          loadinggCanvasValue:
            loadingEcoverseCanvasValue || loadingChallengeCanvasValue || loadingOpportunityCanvasValue,
        },
        actions
      )}
    </>
  );
};

export default CanvasActionsContainer;
