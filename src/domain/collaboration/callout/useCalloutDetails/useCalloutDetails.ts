import { type ApolloError, useFragment } from '@apollo/client';
import { PostBodyFragmentDoc, usePostDetailQuery } from '@/core/apollo/generated-v2/apollo-hooks';
import type { PostBodyFragment } from '@/core/apollo/generated-v2/graphql-schema';
import { isPostNode } from '@/domain/space/hooks/useSpacePage';
import type { CalloutDetailsModelExtended } from '../models/CalloutDetailsModel';
import type { CalloutModelExtension } from '../models/CalloutModelLight';

interface useCalloutDetailsProvided {
  callout: CalloutDetailsModelExtended | undefined;
  loading: boolean;
  refetch: () => Promise<unknown>;
  error: ApolloError | undefined;
}

export interface useCalloutDetailsProps {
  calloutId: string | undefined;
  calloutsSetId: string | undefined;
  withClassification: boolean;
  overrideCalloutSettings?: Partial<CalloutModelExtension<{}>>;
  /** The page layer's mapper from the post to the callout model (dependencies point main → domain). */
  toCallout?: (post: PostBodyFragment) => CalloutDetailsModelExtended;
  skip?: boolean;
}

/** The post a feed card, a post URL load or an earlier read already put in the cache; no request. */
export const useCachedPost = (id: string | undefined): PostBodyFragment | undefined => {
  const { data, complete } = useFragment<PostBodyFragment>({
    fragment: PostBodyFragmentDoc,
    fragmentName: 'PostBody',
    from: { __typename: 'Post', id: id ?? '' },
  });
  return id && complete ? (data as PostBodyFragment) : undefined;
};

/** 021 D4: the post from the cache when the page holds it, else one PostDetail. */
const useCalloutDetails = ({
  calloutId,
  overrideCalloutSettings,
  toCallout,
  skip,
}: useCalloutDetailsProps): useCalloutDetailsProvided => {
  const cached = useCachedPost(calloutId);
  const { data, loading, refetch, error } = usePostDetailQuery({
    variables: { id: calloutId ?? '' },
    skip: skip || !calloutId || Boolean(cached),
  });
  const node = data?.post;
  const post = cached ?? (node && isPostNode(node) ? node : undefined);

  return {
    callout: post && toCallout && { ...toCallout(post), ...overrideCalloutSettings },
    loading,
    refetch,
    error,
  };
};

export default useCalloutDetails;
