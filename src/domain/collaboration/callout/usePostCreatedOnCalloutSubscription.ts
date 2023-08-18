import { useCalloutPostsSubscriptionQuery } from '../../../core/apollo/generated/apollo-hooks';
import { ContributeTabPostFragment } from '../../../core/apollo/generated/graphql-schema';
import useCalloutPostCreatedSubscription from './post/useCalloutPostCreatedSubscription';

export interface PostsData {
  subscriptionEnabled: boolean;
  posts: ContributeTabPostFragment[] | undefined;
  loading: boolean;
}

interface UsePostDataHookProps {
  calloutId: string;
  skip?: boolean;
}

export const usePostCreatedOnCalloutSubscription = ({ calloutId, skip = false }: UsePostDataHookProps): PostsData => {
  const { data, subscribeToMore, loading } = useCalloutPostsSubscriptionQuery({
    variables: { calloutId },
    skip: skip,
  });

  const subscription = useCalloutPostCreatedSubscription(data, data => data?.lookup.callout, subscribeToMore);

  const callout = data?.lookup.callout;

  return {
    posts: callout?.posts,
    loading,
    subscriptionEnabled: subscription.enabled,
  };
};
