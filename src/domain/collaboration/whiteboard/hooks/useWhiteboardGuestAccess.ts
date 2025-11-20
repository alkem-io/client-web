import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { AuthorizationPrivilege, WhiteboardGuestAccessErrorCode } from '@/core/apollo/generated/graphql-schema';
import { useUpdateWhiteboardGuestAccessMutation } from '@/core/apollo/generated/apollo-hooks';
import {
  trackGuestAccessToggleAttempt,
  trackGuestAccessToggleFailure,
  trackGuestAccessToggleSuccess,
} from '@/core/analytics/events/collaborationGuestAccess';
import buildGuestShareUrl from '../utils/buildGuestShareUrl';

export type GuestAccessErrorCode = 'PERMISSION_DENIED' | 'NETWORK' | 'UNKNOWN' | WhiteboardGuestAccessErrorCode;

export interface GuestAccessErrorState {
  code: GuestAccessErrorCode;
  message?: string;
}

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
  error?: GuestAccessErrorState;
  onToggle: (nextState: boolean) => Promise<void>;
  resetError: () => void;
}

const DEFAULT_GUEST_LINK = 'https://guest-link-placeholder.invalid';
const PUBLIC_SHARE_PRIVILEGE =
  (AuthorizationPrivilege as Record<string, AuthorizationPrivilege | undefined>).PublicShare ??
  ('PUBLIC_SHARE' as AuthorizationPrivilege);

const DEFAULT_FAILURE_MESSAGE = 'Guest access update failed. Please try again.';

const buildGuestLink = (guestShareUrl?: string, enabled?: boolean) => {
  if (!enabled) {
    return undefined;
  }
  return guestShareUrl || DEFAULT_GUEST_LINK;
};

const mapServerGuestAccessError = (
  error?: { code?: WhiteboardGuestAccessErrorCode | null; message?: string | null } | null,
  fallbackMessage: string = DEFAULT_FAILURE_MESSAGE
): GuestAccessErrorState => {
  return {
    code: (error?.code as GuestAccessErrorCode) ?? 'UNKNOWN',
    message: error?.message ?? fallbackMessage,
  };
};

type GuestAccessGraphQLErrorExtension = {
  guestAccessError?: {
    code?: WhiteboardGuestAccessErrorCode | null;
    message?: string | null;
  } | null;
  error?: {
    code?: WhiteboardGuestAccessErrorCode | null;
    message?: string | null;
  } | null;
  code?: string;
};

const parseGuestAccessError = (error: ApolloError): GuestAccessErrorState => {
  if (!error) {
    return { code: 'UNKNOWN', message: DEFAULT_FAILURE_MESSAGE };
  }

  const graphQLError = error.graphQLErrors?.[0];
  const extensions = graphQLError?.extensions as GuestAccessGraphQLErrorExtension | undefined;
  const extensionError = extensions?.guestAccessError || extensions?.error;
  if (extensionError) {
    return mapServerGuestAccessError(extensionError);
  }

  const graphQlCode = extensions?.code;
  if (graphQlCode === 'FORBIDDEN' || graphQlCode === 'UNAUTHORIZED') {
    return { code: 'PERMISSION_DENIED', message: graphQLError?.message };
  }
  if (error.networkError) {
    return { code: 'NETWORK', message: error.networkError.message };
  }
  return { code: 'UNKNOWN', message: graphQLError?.message ?? error.message ?? DEFAULT_FAILURE_MESSAGE };
};

const useWhiteboardGuestAccess = ({ whiteboard, guestShareUrl }: UseWhiteboardGuestAccessOptions) => {
  const [optimisticState, setOptimisticState] = useState<boolean | undefined>(undefined);
  const [errorState, setErrorState] = useState<GuestAccessErrorState | undefined>();
  const [updateGuestAccess, { loading }] = useUpdateWhiteboardGuestAccessMutation();

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
    (nextState: boolean, error: GuestAccessErrorState) => {
      setOptimisticState(undefined);
      setErrorState(error);
      if (whiteboard?.id) {
        trackGuestAccessToggleFailure({ whiteboardId: whiteboard.id, nextState, reason: error.code });
      }
    },
    [whiteboard?.id]
  );

  const onToggle = useCallback(
    async (nextState: boolean) => {
      if (!whiteboard?.id || !canToggle) {
        return;
      }

      setErrorState(undefined);
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
          const fallbackError: GuestAccessErrorState = {
            code: 'UNKNOWN',
            message: DEFAULT_FAILURE_MESSAGE,
          };
          handleMutationFailure(nextState, fallbackError);
          throw new Error('updateWhiteboardGuestAccess failed without a whiteboard payload.');
        }

        setOptimisticState(undefined);
        trackGuestAccessToggleSuccess({ whiteboardId: whiteboard.id, nextState });
      } catch (error) {
        const parsed = parseGuestAccessError(error as ApolloError);
        handleMutationFailure(nextState, parsed);
        throw error;
      }
    },
    [whiteboard, canToggle, updateGuestAccess, handleMutationFailure]
  );

  const resetError = useCallback(() => setErrorState(undefined), []);

  return {
    enabled,
    canToggle,
    isMutating: loading,
    guestLink,
    error: errorState,
    onToggle,
    resetError,
  } satisfies UseWhiteboardGuestAccessResult;
};

export default useWhiteboardGuestAccess;
export { DEFAULT_GUEST_LINK };
