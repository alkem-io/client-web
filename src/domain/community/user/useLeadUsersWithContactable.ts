import { useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { UserIsContactableDocument } from '@/core/apollo/generated/apollo-hooks';
import { ContributorViewModel } from '../community/utils/ContributorViewModel';

interface UseLeadUsersWithContactableResult {
  leadUsersWithContactable: ContributorViewModel[];
  loading: boolean;
}

/**
 * Hook to enrich lead users with their isContactable status.
 * Fetches isContactable separately to avoid authorization errors on the main space query.
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

  useEffect(() => {
    if (!leadUsers || leadUsers.length === 0) {
      setLeadUsersWithContactable([]);
      return;
    }

    const fetchContactableStatus = async () => {
      setLoading(true);
      try {
        const enrichedUsers = await Promise.all(
          leadUsers.map(async user => {
            try {
              const { data } = await getUserContactable({
                variables: { userId: user.id },
                // Don't throw errors if authorization fails for a specific user
                errorPolicy: 'ignore',
              });

              return {
                ...user,
                isContactable: data?.lookup?.user?.isContactable ?? false,
              };
            } catch {
              // If authorization fails for this user, default to false
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
  }, [leadUsers, getUserContactable]);

  return {
    leadUsersWithContactable,
    loading,
  };
};
