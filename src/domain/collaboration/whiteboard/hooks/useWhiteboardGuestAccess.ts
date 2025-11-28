import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { useUpdateWhiteboardGuestAccessMutation } from '@/core/apollo/generated/apollo-hooks';
import {
  trackGuestAccessToggleAttempt,
  trackGuestAccessToggleFailure,
  trackGuestAccessToggleSuccess,
} from '@/core/analytics/events/collaborationGuestAccess';
import { useApolloErrorHandler } from '@/core/apollo/hooks/useApolloErrorHandler';
import buildGuestShareUrl from '../utils/buildGuestShareUrl';

export interface UseWhiteboardGuestAccessOptions {
  whiteboard?: {
    id?: string;
    nameID?: string;
    guestContributionsAllowed?: boolean | null;
    authorization?: {
      id?: string;
      myPrivileges?: AuthorizationPrivilege[] | null;
    } | null;
  } | null;
  guestShareUrl?: string;
}

export interface UseWhiteboardGuestAccessResult {
  enabled: boolean;
  canToggle: boolean;
  isMutating: boolean;
  guestLink?: string;
  hasError: boolean;
  onToggle: (nextState: boolean) => Promise<void>;
  resetError: () => void;
}

const PUBLIC_SHARE_PRIVILEGE =
  (AuthorizationPrivilege as Record<string, AuthorizationPrivilege | undefined>).PublicShare ??
  ('PUBLIC_SHARE' as AuthorizationPrivilege);

const buildGuestLink = (guestShareUrl?: string, enabled?: boolean) => {
  if (!enabled) {
    return undefined;
  }
  return guestShareUrl;
};

const useWhiteboardGuestAccess = ({ whiteboard, guestShareUrl }: UseWhiteboardGuestAccessOptions) => {
  const [optimisticState, setOptimisticState] = useState<boolean | undefined>(undefined);
  const [hasError, setHasError] = useState(false);
  const [updateGuestAccess, { loading }] = useUpdateWhiteboardGuestAccessMutation();
  const handleApolloError = useApolloErrorHandler();

  const resolvedGuestShareUrl = useMemo(() => {
    if (guestShareUrl) {
      return guestShareUrl;
    }
    return buildGuestShareUrl(whiteboard?.id ?? whiteboard?.nameID ?? undefined);
  }, [guestShareUrl, whiteboard?.id, whiteboard?.nameID]);

  const canToggle = useMemo(() => {
    return Boolean(whiteboard?.authorization?.myPrivileges?.includes(PUBLIC_SHARE_PRIVILEGE) ?? false);
  }, [whiteboard?.authorization?.myPrivileges]);

  const enabled = optimisticState ?? Boolean(whiteboard?.guestContributionsAllowed);

  useEffect(() => {
    setOptimisticState(undefined);
  }, [whiteboard?.guestContributionsAllowed]);

  const guestLink = useMemo(() => buildGuestLink(resolvedGuestShareUrl, enabled), [resolvedGuestShareUrl, enabled]);

  const handleMutationFailure = useCallback(
    (nextState: boolean, error: unknown) => {
      setOptimisticState(undefined);
      setHasError(true);
      if (whiteboard?.id) {
        trackGuestAccessToggleFailure({
          whiteboardId: whiteboard.id,
          nextState,
          reason: error instanceof Error ? error.message : undefined,
        });
      }
    },
    [whiteboard?.id]
  );

  const onToggle = useCallback(
    async (nextState: boolean) => {
      if (!whiteboard?.id || !canToggle) {
        return;
      }

      setHasError(false);
      setOptimisticState(nextState);
      trackGuestAccessToggleAttempt({ whiteboardId: whiteboard.id, nextState });

      try {
        const { data } = await updateGuestAccess({
          variables: {
            input: {
              whiteboardId: whiteboard.id,
              guestAccessEnabled: nextState,
            },
          },
          optimisticResponse: {
            updateWhiteboardGuestAccess: {
              __typename: 'UpdateWhiteboardGuestAccessResult',
              success: true,
              whiteboard: {
                __typename: 'Whiteboard',
                id: whiteboard.id,
                nameID: whiteboard.nameID ?? '',
                guestContributionsAllowed: nextState,
                authorization: {
                  __typename: 'Authorization',
                  id: whiteboard.authorization?.id ?? whiteboard.id,
                  myPrivileges: whiteboard.authorization?.myPrivileges ?? [],
                },
              },
            },
          },
        });

        const result = data?.updateWhiteboardGuestAccess;
        const updatedWhiteboard = result?.whiteboard;
        if (!result?.success || !updatedWhiteboard) {
          handleMutationFailure(nextState, new Error('Guest access mutation failed.'));
          return;
        }

        setOptimisticState(undefined);
        trackGuestAccessToggleSuccess({ whiteboardId: whiteboard.id, nextState });
      } catch (error) {
        handleApolloError(error as ApolloError);
        handleMutationFailure(nextState, error);
        throw error;
      }
    },
    [whiteboard, canToggle, updateGuestAccess, handleMutationFailure, handleApolloError]
  );

  const resetError = useCallback(() => setHasError(false), []);

  return {
    enabled,
    canToggle,
    isMutating: loading,
    guestLink,
    hasError,
    onToggle,
    resetError,
  } satisfies UseWhiteboardGuestAccessResult;
};

export default useWhiteboardGuestAccess;
