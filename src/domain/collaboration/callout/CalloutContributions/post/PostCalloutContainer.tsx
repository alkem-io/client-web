import { useCreatePostOnCalloutMutation } from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CalloutAllowedContributors,
  CalloutContributionType,
  CreatePostInput,
} from '@/core/apollo/generated/graphql-schema';
import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { Ref } from 'react';
import { useInView } from 'react-intersection-observer';
import { PostContributionProps, useCalloutPosts } from './useCalloutPosts';
import { CalloutSettingsModelFull } from '../../../new-callout/models/CalloutSettingsModel';

interface PostCalloutContainerProvided {
  ref: Ref<Element>;
  posts: PostContributionProps[];
  loading: boolean;
  onCreatePost: (post: CreatePostInput) => Promise<unknown>;
  creatingPost: boolean;
  canCreateContribution: boolean;
}

interface PostCalloutContainerProps extends SimpleContainerProps<PostCalloutContainerProvided> {
  callout: {
    id: string;
    authorization?: {
      myPrivileges?: AuthorizationPrivilege[];
    };
    settings: Pick<CalloutSettingsModelFull, 'contribution'>;
  };
}

const PostCalloutContainer = ({ callout, children }: PostCalloutContainerProps) => {
  const calloutId = callout.id;
  const { ref: intersectionObserverRef, inView } = useInView({
    delay: 500,
    trackVisibility: true,
    triggerOnce: true,
  });

  const { posts, loading } = useCalloutPosts({
    calloutId,
    skip: !inView,
  });

  const [createPost, { loading: isCreatingPost }] = useCreatePostOnCalloutMutation();

  const onCreatePost = async (post: CreatePostInput) => {
    return createPost({
      variables: {
        postData: {
          calloutID: calloutId,
          post: {
            profileData: {
              displayName: post.profileData.displayName,
              description: post.profileData.description,
            },
            tags: post.tags,
          },
        },
      },
    });
  };

  const canCreateContribution =
    (callout.authorization?.myPrivileges?.includes(AuthorizationPrivilege.CreatePost) &&
      callout.settings.contribution.enabled &&
      callout.settings.contribution.allowedTypes.includes(CalloutContributionType.Post) &&
      ((callout.settings.contribution.canAddContributions.includes(CalloutAllowedContributors.Admins) &&
        callout.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update)) ||
        callout.settings.contribution.canAddContributions.includes(CalloutAllowedContributors.Members))) ??
    false;

  return (
    <StorageConfigContextProvider locationType="callout" calloutId={callout?.id}>
      {children({
        ref: intersectionObserverRef,
        posts,
        loading,
        creatingPost: isCreatingPost,
        canCreateContribution,
        onCreatePost,
      })}
    </StorageConfigContextProvider>
  );
};

export default PostCalloutContainer;
