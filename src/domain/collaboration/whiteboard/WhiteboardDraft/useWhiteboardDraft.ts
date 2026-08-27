import { type RefObject, useEffect, useRef, useState } from 'react';
import {
  useCreateWhiteboardDraftOnCalloutsSetMutation,
  useCreateWhiteboardDraftOnTemplatesSetMutation,
  useDeleteWhiteboardDraftMutation,
} from '@/core/apollo/generated/apollo-hooks';

export type WhiteboardDraftScope = { type: 'calloutsSet'; id?: string } | { type: 'templatesSet'; id?: string };

export type WhiteboardDraftSource = {
  sourceWhiteboardID?: string;
  sourceCalloutID?: string;
};

export type WhiteboardDraftHandle = {
  whiteboardID: string;
  sourceKey: string;
};

export type WhiteboardDraftPreparation = () => Promise<boolean>;

export type WhiteboardDraftLifecycle = {
  handle?: WhiteboardDraftHandle;
  loading: boolean;
  materialize: (source?: WhiteboardDraftSource) => Promise<WhiteboardDraftHandle | undefined>;
  preparationRef: RefObject<WhiteboardDraftPreparation | null>;
  prepareForConsumption: () => Promise<boolean>;
  prepared: () => void;
  discard: () => Promise<boolean>;
  consumed: () => void;
};

type UseWhiteboardDraftOptions = {
  scope: WhiteboardDraftScope;
  handle?: WhiteboardDraftHandle;
  onHandleChange: (handle: WhiteboardDraftHandle | undefined) => void;
  source?: WhiteboardDraftSource;
};

const sourceKey = (source?: WhiteboardDraftSource) =>
  `${source?.sourceWhiteboardID ?? ''}:${source?.sourceCalloutID ?? ''}`;

const sameHandle = (first?: WhiteboardDraftHandle, second?: WhiteboardDraftHandle) =>
  first?.whiteboardID === second?.whiteboardID && first?.sourceKey === second?.sourceKey;

/**
 * Owns the GraphQL-only lifecycle for a persisted live Whiteboard draft. The
 * collaborative content itself never crosses GraphQL: callers receive only the
 * real Whiteboard id used by the existing WebSocket editor.
 */
export const useWhiteboardDraft = ({
  scope,
  handle,
  onHandleChange,
  source: defaultSource,
}: UseWhiteboardDraftOptions): WhiteboardDraftLifecycle => {
  const inFlightRef = useRef<Promise<WhiteboardDraftHandle | undefined> | null>(null);
  const preparationRef = useRef<WhiteboardDraftPreparation | null>(null);
  const preparationInFlightRef = useRef<Promise<boolean> | null>(null);
  const preparedRef = useRef(false);
  const handleRef = useRef(handle);
  const lastPropHandleRef = useRef(handle);
  useEffect(() => {
    if (sameHandle(handle, lastPropHandleRef.current)) return;
    if (handle?.whiteboardID !== lastPropHandleRef.current?.whiteboardID) {
      preparedRef.current = false;
    }
    lastPropHandleRef.current = handle;
    handleRef.current = handle;
  }, [handle]);
  const [loading, setLoading] = useState(false);
  const [createOnCalloutsSet] = useCreateWhiteboardDraftOnCalloutsSetMutation();
  const [createOnTemplatesSet] = useCreateWhiteboardDraftOnTemplatesSetMutation();
  const [deleteDraft] = useDeleteWhiteboardDraftMutation();

  const discard = async (): Promise<boolean> => {
    if (inFlightRef.current) {
      await inFlightRef.current;
    }
    const currentHandle = handleRef.current;
    if (!currentHandle) return true;
    setLoading(true);
    try {
      await deleteDraft({ variables: { whiteboardID: currentHandle.whiteboardID } });
      handleRef.current = undefined;
      preparedRef.current = false;
      onHandleChange(undefined);
      return true;
    } catch {
      // Keep the handle so the user can retry; the server can still select this
      // Whiteboard by its non-NULL expiry marker later.
      return false;
    } finally {
      setLoading(false);
    }
  };

  const materialize = async (source?: WhiteboardDraftSource): Promise<WhiteboardDraftHandle | undefined> => {
    const resolvedSource = source ?? defaultSource;
    const nextSourceKey = sourceKey(resolvedSource);
    const currentHandle = handleRef.current;
    if (currentHandle?.sourceKey === nextSourceKey) return currentHandle;
    if (inFlightRef.current) return inFlightRef.current;

    const promise = (async () => {
      setLoading(true);
      try {
        if (currentHandle) {
          const discarded = await discard();
          if (!discarded) return undefined;
        }

        const common = {
          sourceWhiteboardID: resolvedSource?.sourceWhiteboardID,
          sourceCalloutID: resolvedSource?.sourceCalloutID,
        };
        const draft =
          scope.type === 'calloutsSet'
            ? scope.id
              ? (
                  await createOnCalloutsSet({
                    variables: { draftData: { ...common, calloutsSetID: scope.id } },
                  })
                ).data?.createWhiteboardDraftOnCalloutsSet
              : undefined
            : scope.id
              ? (
                  await createOnTemplatesSet({
                    variables: { draftData: { ...common, templatesSetID: scope.id } },
                  })
                ).data?.createWhiteboardDraftOnTemplatesSet
              : undefined;
        if (!draft) return undefined;
        const next: WhiteboardDraftHandle = {
          whiteboardID: draft,
          sourceKey: nextSourceKey,
        };
        handleRef.current = next;
        preparedRef.current = false;
        onHandleChange(next);
        return next;
      } catch {
        // Apollo's global error link surfaces the failure. Returning undefined
        // keeps the form open and avoids an unhandled promise rejection from a
        // button click; any existing handle was deliberately retained above.
        return undefined;
      } finally {
        setLoading(false);
        inFlightRef.current = null;
      }
    })();
    inFlightRef.current = promise;
    return promise;
  };

  const prepareForConsumption = (): Promise<boolean> => {
    if (!handleRef.current) return Promise.resolve(true);
    if (preparationInFlightRef.current) return preparationInFlightRef.current;
    const prepare = preparationRef.current;
    if (!prepare) return Promise.resolve(preparedRef.current);

    const promise = prepare()
      .then(prepared => {
        if (prepared) preparedRef.current = true;
        return prepared;
      })
      .finally(() => {
        preparationInFlightRef.current = null;
      });
    preparationInFlightRef.current = promise;
    return promise;
  };

  return {
    handle,
    loading,
    materialize,
    preparationRef,
    prepareForConsumption,
    prepared: () => {
      preparedRef.current = true;
    },
    discard,
    consumed: () => {
      handleRef.current = undefined;
      preparedRef.current = false;
      onHandleChange(undefined);
    },
  };
};
