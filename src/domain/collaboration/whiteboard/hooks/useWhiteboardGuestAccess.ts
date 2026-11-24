import { useState } from 'react';
import {
  trackGuestAccessToggleAttempt,
  trackGuestAccessToggleFailure,
  trackGuestAccessToggleSuccess,
} from '@/core/analytics/events/collaborationGuestAccess';
import { useUpdateWhiteboardGuestAccessMutation } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
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
  // A failed request is reported by the global error handler, with the server's reason; the inline
  // error is for an answer that reports no success.
  const [updateGuestAccess, { loading }] = useUpdateWhiteboardGuestAccessMutation();

  const resolvedGuestShareUrl = (() => {
    if (guestShareUrl) {
      return guestShareUrl;
    }
    return buildGuestShareUrl(whiteboard?.id ?? whiteboard?.nameID ?? undefined);
  })();

  const canToggle = (() => {
    return Boolean(whiteboard?.authorization?.myPrivileges?.includes(PUBLIC_SHARE_PRIVILEGE) ?? false);
  })();

  const enabled = Boolean(whiteboard?.guestContributionsAllowed);

  const guestLink = buildGuestLink(resolvedGuestShareUrl, enabled);

  const onToggle = async (nextState: boolean) => {
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
      if (whiteboard.id) {
        trackGuestAccessToggleFailure({
          whiteboardId: whiteboard.id,
          nextState,
          reason: error instanceof Error ? error.message : undefined,
        });
      }
      throw error;
    }
  };

  const resetError = () => setHasError(false);

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
