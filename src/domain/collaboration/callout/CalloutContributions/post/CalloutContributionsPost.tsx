import { forwardRef, useMemo, useState } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import ScrollableCardsLayout from '@/domain/collaboration/callout/components/ScrollableCardsLayout';
import PostCreationDialog from '@/domain/collaboration/post/PostCreationDialog/PostCreationDialog';
import { CreatePostInput } from '@/core/apollo/generated/graphql-schema';
import CreateContributionButton from '../CreateContributionButton';
import PostCard, { PostCardPost } from './PostCard';
import { BaseCalloutViewProps } from '../../CalloutViewTypes';
import { gutters } from '@/core/ui/grid/utils';
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

const CalloutContributionsPost = forwardRef<HTMLDivElement, CalloutContributionsPostProps>(
  ({ callout, contributions, loading, canCreateContribution, contributionsCount, calloutRestrictions }, ref) => {
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
    const createButton = canCreateContribution && <CreateContributionButton onClick={openCreateDialog} />;

    const navigateToPost = (post: PostCardPost) => {
      const state: LocationStateCachedCallout = {
        [LocationStateKeyCachedCallout]: callout,
        keepScroll: true,
      };
      navigate(post.profile.url, { state });
    };

    return (
      <Gutters ref={ref}>
        <ScrollableCardsLayout
          items={loading ? [undefined, undefined] : (posts ?? [])}
          createButton={!isSmallScreen && createButton}
          maxHeight={gutters(22)}
        >
          {post => <PostCard post={post} onClick={navigateToPost} />}
        </ScrollableCardsLayout>
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
  }
);

CalloutContributionsPost.displayName = 'CalloutContributionsPost';
export default CalloutContributionsPost;
