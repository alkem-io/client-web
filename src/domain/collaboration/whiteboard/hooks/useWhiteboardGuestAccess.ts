import { useCallback, useMemo, useState } from 'react';
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
  isUpdating: boolean;
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

  const enabled = Boolean(whiteboard?.guestContributionsAllowed);

  const guestLink = useMemo(() => buildGuestLink(resolvedGuestShareUrl, enabled), [resolvedGuestShareUrl, enabled]);

  const onToggle = useCallback(
    async (nextState: boolean) => {
      if (!whiteboard?.id || !canToggle) {
        return;
      }

      setHasError(false);
      trackGuestAccessToggleAttempt({ whiteboardId: whiteboard.id, nextState });

      try {
        const { data } = await updateGuestAccess({
          variables: {
            input: {
              whiteboardId: whiteboard.id,
              guestAccessEnabled: nextState,
            },
          },
        });

        const result = data?.updateWhiteboardGuestAccess;
        const updatedWhiteboard = result?.whiteboard;
        if (!result?.success || !updatedWhiteboard) {
          setHasError(true);
          if (whiteboard.id) {
            trackGuestAccessToggleFailure({
              whiteboardId: whiteboard.id,
              nextState,
              reason: 'Guest access mutation failed.',
            });
          }
          return;
        }

        trackGuestAccessToggleSuccess({ whiteboardId: whiteboard.id, nextState });
      } catch (error) {
        handleApolloError(error as ApolloError);
        setHasError(true);
        if (whiteboard.id) {
          trackGuestAccessToggleFailure({
            whiteboardId: whiteboard.id,
            nextState,
            reason: error instanceof Error ? error.message : undefined,
          });
        }
        throw error;
      }
    },
    [whiteboard, canToggle, updateGuestAccess, handleApolloError]
  );

  const resetError = useCallback(() => setHasError(false), []);

  return {
    enabled,
    canToggle,
    isUpdating: loading,
    guestLink,
    hasError,
    onToggle,
    resetError,
  } satisfies UseWhiteboardGuestAccessResult;
};

export default useWhiteboardGuestAccess;
