import { useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { UserIsContactableDocument } from '@/core/apollo/generated/apollo-hooks';
import { ContributorViewModel } from '../community/utils/ContributorViewModel';
import { useCurrentUserContext } from '../userCurrent/useCurrentUserContext';

interface UseLeadUsersWithContactableResult {
  leadUsersWithContactable: ContributorViewModel[];
  loading: boolean;
}

/**
 * Hook to enrich lead users with their isContactable status.
 * Only fetches isContactable for authenticated users to avoid authorization errors.
 * For unauthenticated users or when authorization might fail, defaults to false.
 *
 * @param leadUsers - Array of lead users without isContactable status
 * @returns Lead users enriched with isContactable status and loading state
 */
export const useLeadUsersWithContactable = (
  leadUsers: ContributorViewModel[] | undefined
): UseLeadUsersWithContactableResult => {
  const [getUserContactable] = useLazyQuery(UserIsContactableDocument);
  const [leadUsersWithContactable, setLeadUsersWithContactable] = useState<ContributorViewModel[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useCurrentUserContext();

  useEffect(() => {
    if (!leadUsers || leadUsers.length === 0) {
      setLeadUsersWithContactable([]);
      return;
    }

    // If user is not authenticated, don't attempt to fetch isContactable
    // to avoid authorization errors. Default to false for all users.
    if (!isAuthenticated) {
      const usersWithDefaultContactable = leadUsers.map(user => ({
        ...user,
        isContactable: false,
      }));
      setLeadUsersWithContactable(usersWithDefaultContactable);
      return;
    }

    const fetchContactableStatus = async () => {
      setLoading(true);
      try {
        const enrichedUsers = await Promise.all(
          leadUsers.map(async user => {
            try {
              const { data, error } = await getUserContactable({
                variables: { userId: user.id },
                // Return partial data even if there are errors
                errorPolicy: 'all',
              });

              // If there's an error or no data, default to false
              if (error || !data?.lookup?.user) {
                return {
                  ...user,
                  isContactable: false,
                };
              }

              return {
                ...user,
                isContactable: data.lookup.user.isContactable ?? false,
              };
            } catch {
              // If query fails, default to false
              return {
                ...user,
                isContactable: false,
              };
            }
          })
        );

        setLeadUsersWithContactable(enrichedUsers);
      } finally {
        setLoading(false);
      }
    };

    fetchContactableStatus();
  }, [leadUsers, getUserContactable, isAuthenticated]);

  return {
    leadUsersWithContactable,
    loading,
  };
};
