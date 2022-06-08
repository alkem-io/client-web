import * as Apollo from '@apollo/client';
import { QueryResult } from '@apollo/client/react/types/types';
import { PossiblyUndefinedProps } from '../../shared/types/PossiblyUndefinedProps';
import somePropsNotDefined from '../../shared/utils/somePropsNotDefined';
import { useMemo } from 'react';

type EntityIds = { hubId: string } & ({} | { challengeId: string } | { opportunityId: string });

type Provided<ProvidedContributors> = ProvidedContributors & {
  loading: boolean;
};

interface Query<Data, Variables extends EntityIds> {
  (options: Apollo.QueryHookOptions<Data, Variables>): QueryResult<Data, Variables>;
}

const useCommunityContributors = <Data, Variables extends EntityIds, ProvidedContributors extends {}>(
  query: Query<Data, Variables>,
  selector: (data: Data | undefined) => ProvidedContributors,
  variables: PossiblyUndefinedProps<Variables>
): Provided<ProvidedContributors> => {
  const { data, loading } = query({
    variables: variables as Variables,
    skip: somePropsNotDefined(variables),
  });

  const contributors = useMemo(() => selector(data), [data]);

  return {
    ...contributors,
    loading,
  };
};

export default useCommunityContributors;
