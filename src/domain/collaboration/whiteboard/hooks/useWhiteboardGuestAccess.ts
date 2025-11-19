import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { useUpdateWhiteboardGuestAccessMutation } from '@/core/apollo/generated/apollo-hooks';
import {
  trackGuestAccessToggleAttempt,
  trackGuestAccessToggleFailure,
  trackGuestAccessToggleSuccess,
} from '@/core/analytics/events/collaborationGuestAccess';
import buildGuestShareUrl from '../utils/buildGuestShareUrl';

export type GuestAccessErrorCode = 'PERMISSION_DENIED' | 'NETWORK' | 'UNKNOWN';

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

const parseGuestAccessError = (error: ApolloError): GuestAccessErrorState => {
  if (!error) {
    return { code: 'UNKNOWN' };
  }
  const graphQLError = error.graphQLErrors?.[0];
  const graphQlCode = graphQLError?.extensions?.code;
  if (graphQlCode === 'FORBIDDEN' || graphQlCode === 'UNAUTHORIZED') {
    return { code: 'PERMISSION_DENIED', message: graphQLError?.message };
  }
  if (error.networkError) {
    return { code: 'NETWORK', message: error.networkError.message };
  }
  return { code: 'UNKNOWN', message: graphQLError?.message ?? error.message };
};

const buildGuestLink = (guestShareUrl?: string, enabled?: boolean) => {
  if (!enabled) {
    return undefined;
  }
  return guestShareUrl || DEFAULT_GUEST_LINK;
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

  const onToggle = useCallback(
    async (nextState: boolean) => {
      if (!whiteboard?.id || !canToggle) {
        return;
      }

      setErrorState(undefined);
      setOptimisticState(nextState);
      trackGuestAccessToggleAttempt({ whiteboardId: whiteboard.id, nextState });

      try {
        await updateGuestAccess({
          variables: {
            input: {
              whiteboardId: whiteboard.id,
              guestAccessEnabled: nextState,
            },
          },
          optimisticResponse: {
            updateWhiteboardGuestAccess: {
              __typename: 'UpdateWhiteboardGuestAccessResult',
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
        setOptimisticState(undefined);
        trackGuestAccessToggleSuccess({ whiteboardId: whiteboard.id, nextState });
      } catch (error) {
        const parsed = parseGuestAccessError(error as ApolloError);
        setOptimisticState(undefined);
        setErrorState(parsed);
        trackGuestAccessToggleFailure({ whiteboardId: whiteboard.id, nextState, reason: parsed.code });
        throw error;
      }
    },
    [whiteboard, canToggle, updateGuestAccess]
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
