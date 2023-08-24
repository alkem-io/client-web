import { useCalloutPostsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { ContributeTabPostFragment } from '../../../../core/apollo/generated/graphql-schema';
import useCalloutPostCreatedSubscription from './useCalloutPostCreatedSubscription';

export interface PostsData {
  subscriptionEnabled: boolean;
  posts: ContributeTabPostFragment[] | undefined;
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

  return {
    posts: callout?.posts,
    loading,
    subscriptionEnabled: subscription.enabled,
  };
};
