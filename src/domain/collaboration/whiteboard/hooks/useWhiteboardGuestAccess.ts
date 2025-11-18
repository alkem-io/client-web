import { useCallback, useMemo, useState } from 'react';
import { AuthorizationPrivilege, WhiteboardGuestAccessErrorCode } from '@/core/apollo/generated/graphql-schema';
import { useUpdateWhiteboardGuestAccessMutation } from '@/core/apollo/generated/apollo-hooks';

export type GuestAccessErrorCode =
  | WhiteboardGuestAccessErrorCode
  | 'MISSING_WHITEBOARD_ID'
  | 'NOT_AUTHORIZED_LOCAL'
  | 'NETWORK_ERROR';

export interface GuestAccessError {
  code: GuestAccessErrorCode;
  message: string;
}

export interface UseWhiteboardGuestAccessOptions {
  whiteboardId?: string;
  guestContributionsAllowed?: boolean | null;
  authorization?: {
    myPrivileges?: AuthorizationPrivilege[];
  };
}

export interface UseWhiteboardGuestAccessResult {
  guestAccessEnabled: boolean;
  canToggle: boolean;
  isMutating: boolean;
  toggleGuestAccess: (nextState: boolean) => Promise<void>;
  error?: GuestAccessError;
  resetError: () => void;
}

const DEFAULT_ERROR_MESSAGE = 'Unable to update guest access at this time.';

const useWhiteboardGuestAccess = ({
  whiteboardId,
  guestContributionsAllowed,
  authorization,
}: UseWhiteboardGuestAccessOptions): UseWhiteboardGuestAccessResult => {
  const [updateGuestAccess, { loading }] = useUpdateWhiteboardGuestAccessMutation();
  const [error, setError] = useState<GuestAccessError | undefined>();

  const hasPublicSharePrivilege = authorization?.myPrivileges?.includes(AuthorizationPrivilege.PublicShare) ?? false;
  const canToggle = Boolean(whiteboardId && hasPublicSharePrivilege);

  const guestAccessEnabled = Boolean(guestContributionsAllowed);

  const toggleGuestAccess = useCallback(
    async (nextState: boolean) => {
      if (!whiteboardId) {
        const missingIdError: GuestAccessError = {
          code: 'MISSING_WHITEBOARD_ID',
          message: DEFAULT_ERROR_MESSAGE,
        };
        setError(missingIdError);
        throw missingIdError;
      }

      if (!canToggle) {
        const notAuthorizedError: GuestAccessError = {
          code: 'NOT_AUTHORIZED_LOCAL',
          message: DEFAULT_ERROR_MESSAGE,
        };
        setError(notAuthorizedError);
        throw notAuthorizedError;
      }

      try {
        setError(undefined);
        const { data } = await updateGuestAccess({
          variables: {
            input: {
              whiteboardId,
              guestAccessEnabled: nextState,
            },
          },
        });

        const result = data?.updateWhiteboardGuestAccess;

        if (!result?.success) {
          const [firstError] = result?.errors ?? [];
          const failure: GuestAccessError = {
            code: firstError?.code ?? WhiteboardGuestAccessErrorCode.Unknown,
            message: firstError?.message ?? DEFAULT_ERROR_MESSAGE,
          };
          setError(failure);
          throw failure;
        }
      } catch (mutationError) {
        if (isGuestAccessError(mutationError)) {
          throw mutationError;
        }

        const networkError: GuestAccessError = {
          code: 'NETWORK_ERROR',
          message: DEFAULT_ERROR_MESSAGE,
        };
        setError(networkError);
        throw networkError;
      }
    },
    [whiteboardId, canToggle, updateGuestAccess]
  );

  const resetError = useCallback(() => setError(undefined), []);

  return useMemo(
    () => ({
      guestAccessEnabled,
      canToggle,
      isMutating: loading,
      toggleGuestAccess,
      error,
      resetError,
    }),
    [guestAccessEnabled, canToggle, loading, toggleGuestAccess, error, resetError]
  );
};

const isGuestAccessError = (maybeError: unknown): maybeError is GuestAccessError =>
  Boolean(
    maybeError &&
      typeof maybeError === 'object' &&
      'code' in maybeError &&
      'message' in maybeError &&
      typeof (maybeError as GuestAccessError).message === 'string'
  );

export default useWhiteboardGuestAccess;
