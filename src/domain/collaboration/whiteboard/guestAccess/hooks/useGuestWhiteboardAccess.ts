import { useGetPublicWhiteboardQuery } from '@/core/apollo/generated/apollo-hooks';
import { useGuestSession } from './useGuestSession';

/**
 * Hook for accessing public whiteboard data
 * Manages loading state and guest session requirements
 */
export const useGuestWhiteboardAccess = (whiteboardId: string | undefined, isAuthenticated = false) => {
  const { guestName, derivationAttempted } = useGuestSession();

  // Only fetch whiteboard if we have a guest name (either derived or entered) or if the user is authenticated
  const { data, loading, error, refetch } = useGetPublicWhiteboardQuery({
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { whiteboardId: whiteboardId! },
    skip: (!guestName && !isAuthenticated) || !whiteboardId,
  });

  return {
    whiteboard: data?.lookup?.whiteboard,
    loading: loading || !derivationAttempted,
    error,
    refetch,
    needsGuestName: !guestName && derivationAttempted,
  };
};
