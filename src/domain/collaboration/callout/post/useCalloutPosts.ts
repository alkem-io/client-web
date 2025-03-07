import { useMemo } from 'react';
import { useCalloutPostsQuery } from '@/core/apollo/generated/apollo-hooks';
import useCalloutPostCreatedSubscription from './useCalloutPostCreatedSubscription';
import { compact } from 'lodash';

export interface PostContributionProps {
  id: string;
  createdDate: Date;
  profile: {
    id: string;
    url: string;
    displayName: string;
    description?: string | undefined;
    visuals: {
      id: string;
      uri: string;
    }[];
    references?: {
      id: string;
      name: string;
      uri: string;
      description?: string;
    }[];
  };

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

  // @ts-ignore react-18
  const subscription = useCalloutPostCreatedSubscription(data, data => data?.lookup.callout, subscribeToMore, {
    variables: { calloutId },
  });

  const posts: PostContributionProps[] = useMemo(
    () =>
      compact(
        callout?.contributions?.map(
          contribution =>
            contribution.post && {
              ...contribution.post,
              sortOrder: contribution.sortOrder,
              contributionId: contribution.id,
            }
        )
      ),
    [callout?.contributions]
  );

  return {
    posts,
    loading,
    subscriptionEnabled: subscription.enabled,
  };
};
