import { useMemo, useState } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import PostCreationDialog from '@/domain/collaboration/post/PostCreationDialog/PostCreationDialog';
import { CreatePostInput } from '@/core/apollo/generated/graphql-schema';
import CreateContributionButton from '../CreateContributionButton';
import PostCard, { PostCardPost } from './PostCard';
import { BaseCalloutViewProps } from '../../CalloutViewTypes';
import CalloutBlockFooter from '../../calloutBlock/CalloutBlockFooter';
import { useScreenSize } from '@/core/ui/grid/constants';
import {
  LocationStateCachedCallout,
  LocationStateKeyCachedCallout,
} from '@/domain/collaboration/CalloutPage/CalloutPage';
import { TypedCalloutDetails } from '../../models/TypedCallout';
import { compact, sortBy } from 'lodash';
import { useCreatePostOnCalloutMutation } from '@/core/apollo/generated/apollo-hooks';
import Gutters from '@/core/ui/grid/Gutters';
import CardsExpandableContainer from '../../components/CardsExpandableContainer';

interface PostContribution {
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
}

interface CalloutContributionsPostProps extends BaseCalloutViewProps {
  callout: TypedCalloutDetails;
  contributions:
    | {
        id: string;
        sortOrder: number;
        post?: PostContribution;
      }[]
    | undefined;
  loading: boolean;
}

const CalloutContributionsPost = ({
  ref,
  callout,
  contributions,
  loading,
  canCreateContribution,
  contributionsCount,
  calloutRestrictions,
}: CalloutContributionsPostProps & {
  ref?: React.Ref<HTMLDivElement>;
}) => {
  // Dialog handling
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const openCreateDialog = () => setPostDialogOpen(true);
  const closeCreateDialog = () => setPostDialogOpen(false);
  const navigate = useNavigate();
  const { isSmallScreen } = useScreenSize();

  const { posts, postNames } = useMemo(
    () => ({
      posts: sortBy(
        compact(
          contributions?.map(
            contribution =>
              contribution.post && {
                ...contribution.post,
                sortOrder: contribution.sortOrder,
                contributionId: contribution.id,
              }
          )
        ),
        'sortOrder'
      ),
      postNames: compact(contributions?.map(contribution => contribution.post?.profile.displayName)),
    }),
    [contributions]
  );

  const [createPost, { loading: creatingPost }] = useCreatePostOnCalloutMutation();

  const onCreatePost = async (post: CreatePostInput) => {
    return createPost({
      variables: {
        postData: {
          calloutID: callout.id,
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
  const createButton = canCreateContribution ? <CreateContributionButton onClick={openCreateDialog} /> : undefined;

  const navigateToPost = (post: PostCardPost) => {
    const state: LocationStateCachedCallout = {
      [LocationStateKeyCachedCallout]: callout,
      keepScroll: true,
    };
    navigate(post.profile.url, { state });
  };

  return (
    <Gutters ref={ref}>
      <CardsExpandableContainer
        items={posts}
        pagination={{ total: contributionsCount ?? posts.length }}
        loading={loading}
        createButton={createButton}
      >
        {post => <PostCard post={post} onClick={navigateToPost} />}
      </CardsExpandableContainer>
      {isSmallScreen && canCreateContribution && callout.settings.contribution.enabled && (
        <CalloutBlockFooter contributionsCount={contributionsCount} onCreate={openCreateDialog} />
      )}
      <PostCreationDialog
        open={postDialogOpen}
        onClose={closeCreateDialog}
        onCreate={onCreatePost}
        postNames={postNames}
        calloutDisplayName={callout.framing.profile.displayName}
        calloutId={callout.id}
        defaultDisplayName={callout.contributionDefaults.defaultDisplayName}
        defaultDescription={callout.contributionDefaults.postDescription}
        creating={creatingPost}
        disableRichMedia={calloutRestrictions?.disableRichMedia}
      />
    </Gutters>
  );
};

CalloutContributionsPost.displayName = 'CalloutContributionsPost';
export default CalloutContributionsPost;
