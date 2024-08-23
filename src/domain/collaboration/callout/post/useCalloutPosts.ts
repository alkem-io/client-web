import { useMemo } from 'react';
import { useCalloutPostsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { ContributeTabPostFragment } from '../../../../core/apollo/generated/graphql-schema';
import useCalloutPostCreatedSubscription from './useCalloutPostCreatedSubscription';
import { compact } from 'lodash';

export interface PostContributionProps extends Partial<ContributeTabPostFragment> {
  sortOrder: number;
  contributionId: string;
}

export interface PostsData {
  subscriptionEnabled: boolean;
  posts: PostContributionProps[];
  loading: boolean;
}

interface UsePostDataHookProps {
  calloutId: string;
  skip?: boolean;
}

export const useCalloutPosts = ({ calloutId, skip = false }: UsePostDataHookProps): PostsData => {
  const { data, subscribeToMore, loading } = useCalloutPostsQuery({
    variables: { calloutId },
    skip,
  });

  const callout = data?.lookup.callout;

  const subscription = useCalloutPostCreatedSubscription(data, data => data?.lookup.callout, subscribeToMore, {
    variables: { calloutId },
  });

  const posts: PostContributionProps[] = useMemo(
    () =>
      compact(
        callout?.contributions?.map(contribution => ({
          ...contribution.post,
          sortOrder: contribution.sortOrder,
          contributionId: contribution.id,
        }))
      ),
    [callout?.contributions]
  );

  return {
    posts,
    loading,
    subscriptionEnabled: subscription.enabled,
  };
};
