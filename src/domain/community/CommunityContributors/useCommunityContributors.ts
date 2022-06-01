import * as Apollo from '@apollo/client';
import { OrganizationCardFragment, UserCardFragment } from '../../../models/graphql-schema';
import { QueryResult } from '@apollo/client/react/types/types';
import { PossiblyUndefinedProps } from '../../shared/types/PossiblyUndefinedProps';
import somePropsNotDefined from '../../shared/utils/somePropsNotDefined';
import { useMemo } from 'react';

type EntityIds = { hubId: string } & ({} | { challengeId: string } | { opportunityId: string });

interface Contributors {
  leadOrganizations: OrganizationCardFragment[] | undefined;
  leadUsers: UserCardFragment[] | undefined;
  memberOrganizations: OrganizationCardFragment[] | undefined;
  memberUsers: UserCardFragment[] | undefined;
  host: OrganizationCardFragment | undefined;
}

interface Provided {
  contributors: Contributors;
  loading: boolean;
}

interface Query<Data, Variables extends EntityIds> {
  (options: Apollo.QueryHookOptions<Data, Variables>): QueryResult<Data, Variables>;
}

const useCommunityContributors = <Data, Variables extends EntityIds, Community extends Contributors>(
  query: Query<Data, Variables>,
  communitySelector: (data: Data | undefined) => Partial<Community> | undefined,
  variables: PossiblyUndefinedProps<Variables>
): Provided => {
  const { data, loading } = query({
    variables: variables as Variables,
    skip: somePropsNotDefined(variables),
  });

  const contributors = useMemo(() => {
    const { leadUsers, memberUsers, leadOrganizations, memberOrganizations, host } =
      communitySelector(data) ?? ({} as Community);
    return { leadUsers, memberUsers, leadOrganizations, memberOrganizations, host };
  }, [data]);

  return {
    contributors,
    loading,
  };
};

export default useCommunityContributors;
