import {
  refetchCurrentUserFullQuery,
  useCreateUserNewRegistrationMutation,
  usePlatformLevelAuthorizationQuery,
  useCurrentUserFullQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import { ErrorPage } from '@/core/pages/Errors/ErrorPage';
import { PropsWithChildren, createContext, useEffect, useMemo, useState } from 'react';
import { toPlatformPrivilegeWrapper } from './usePlatformPrivilegeWrapper';
import { CurrentUserModel } from '../model/CurrentUserModel';

const CurrentUserContext = createContext<CurrentUserModel>({
  platformPrivilegeWrapper: undefined,
  userModel: undefined,
  accountId: undefined,
  loading: true,
  loadingMe: true, // Loading Authentication and Profile data. Once it's false that's enough for showing the page header and avatar.
  verified: false,
  isAuthenticated: false,
  platformRoles: [],
  accountPrivileges: [],
  accountEntitlements: [],
});

const MAX_REFETCH_ATTEMPTS = 5; // Maximum number of refetch attempts
const REFETCH_DELAY_MS = 50; // Initial delay in milliseconds for exponential backoff

const CurrentUserProvider = ({ children }: PropsWithChildren) => {
  const { isAuthenticated, loading: loadingAuthentication, verified } = useAuthenticationContext();

  const {
    data: meData,
    loading: loadingMe,
    error: userProviderError, // Error from useCurrentUserFullQuery
    refetch: refetchCurrentUser, // Function to refetch useCurrentUserFullQuery
  } = useCurrentUserFullQuery({ skip: !isAuthenticated });

  const user = useMemo(() => meData?.me?.user, [meData?.me?.user]);

  const { data: platformLevelAuthorizationData, loading: isLoadingPlatformLevelAuthorization } =
    usePlatformLevelAuthorizationQuery({ skip: !user || !isAuthenticated });

  const [refetchAttemptCount, setRefetchAttemptCount] = useState(0);

  const [
    createUserProfile,
    { loading: loadingCreateUser, error /* Error from useCreateUserNewRegistrationMutation */ },
  ] = useCreateUserNewRegistrationMutation({
    refetchQueries: [refetchCurrentUserFullQuery()],
    awaitRefetchQueries: true,
    onCompleted: () => {
      setRefetchAttemptCount(0); // Reset attempts on successful creation and refetch cycle
    },
  });

  useEffect(() => {
    // Conditions to either refetch user or attempt creation
    const shouldAttemptUserResolution =
      isAuthenticated &&
      !loadingMe && // Not currently loading user data from useCurrentUserFullQuery
      !user && // User data is not yet available
      !loadingCreateUser && // Not currently trying to create a user
      !error && // No error from the last useCreateUserNewRegistrationMutation attempt
      !userProviderError; // No error from the last useCurrentUserFullQuery attempt

    if (shouldAttemptUserResolution) {
      if (refetchAttemptCount < MAX_REFETCH_ATTEMPTS) {
        // Exponential backoff for retries
        const delay = REFETCH_DELAY_MS * Math.pow(2, refetchAttemptCount);
        const timerId = setTimeout(() => {
          console.log(
            `Auto-refetching current user: attempt ${refetchAttemptCount + 1}/${MAX_REFETCH_ATTEMPTS} after ${delay}ms delay.`
          );
          if (refetchCurrentUser) {
            // Ensure refetchCurrentUser is available
            refetchCurrentUser();
          }
          setRefetchAttemptCount(prevCount => prevCount + 1);
        }, delay);

        return () => clearTimeout(timerId); // Cleanup timeout if dependencies change or component unmounts
      } else {
        // Max refetch attempts reached, try to create user profile
        console.log(
          `Max auto-refetch attempts (${MAX_REFETCH_ATTEMPTS}) reached for current user. Attempting to create user profile.`
        );
        createUserProfile();
        // Reset attempts, so if this creation also fails to populate the user,
        // the refetch cycle will start again before another creation attempt.
        setRefetchAttemptCount(0);
      }
    }
  }, [
    isAuthenticated,
    loadingMe,
    user,
    loadingCreateUser,
    error, // from useCreateUserNewRegistrationMutation
    userProviderError, // from useCurrentUserFullQuery
    refetchAttemptCount,
    createUserProfile, // from useCreateUserNewRegistrationMutation hook
    refetchCurrentUser, // from useCurrentUserFullQuery hook
  ]);

  // Effect to reset refetch attempts if user is successfully found/loaded,
  // or if authentication state changes to unauthenticated,
  // or if a definitive error occurs that shouldn't be retried by refetching.
  useEffect(() => {
    if (user || !isAuthenticated || error || userProviderError) {
      if (refetchAttemptCount > 0) {
        // Only set state if it actually changes
        setRefetchAttemptCount(0);
      }
    }
  }, [user, isAuthenticated, error, userProviderError, refetchAttemptCount]);

  const loading = loadingAuthentication || loadingCreateUser || loadingMe || isLoadingPlatformLevelAuthorization;

  const platformPrivilegeWrapper = useMemo(() => {
    if (!meData?.me) {
      return undefined;
    }
    const myPrivileges = platformLevelAuthorizationData?.platform.authorization?.myPrivileges;

    return toPlatformPrivilegeWrapper(myPrivileges);
  }, [user, meData, platformLevelAuthorizationData]);

  const platformRoles = useMemo(
    () => platformLevelAuthorizationData?.platform.roleSet.myRoles ?? [],
    [platformLevelAuthorizationData]
  );
  const accountId = useMemo(() => user?.account?.id, [user]);
  const accountPrivileges = useMemo(() => user?.account?.authorization?.myPrivileges ?? [], [user]);
  const accountEntitlements = useMemo(() => user?.account?.license?.availableEntitlements ?? [], [user]);

  const providedValue = useMemo<CurrentUserModel>(
    () => ({
      platformPrivilegeWrapper,
      userModel: user,
      accountId,
      loading,
      loadingMe: loadingAuthentication || loadingMe,
      verified,
      isAuthenticated,
      platformRoles,
      accountPrivileges,
      accountEntitlements,
    }),
    [
      loadingMe,
      platformPrivilegeWrapper,
      loading,
      loadingAuthentication,
      verified,
      isAuthenticated,
      accountId,
      platformRoles,
      accountPrivileges,
      accountEntitlements,
    ]
  );

  return error ? (
    <ErrorPage error={error} />
  ) : (
    <CurrentUserContext.Provider value={providedValue}>{children}</CurrentUserContext.Provider>
  );
};

export { CurrentUserContext, CurrentUserProvider as UserProvider };
