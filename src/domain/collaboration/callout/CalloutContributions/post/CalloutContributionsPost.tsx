import { forwardRef, useMemo, useState } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import CalloutLayout from '../../calloutBlock/CalloutLayout';
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
import CalloutSettingsContainer from '../../calloutBlock/CalloutSettingsContainer';
import { TypedCalloutDetails } from '../../../new-callout/models/TypedCallout';
import { sortBy } from 'lodash';
import { useCreatePostOnCalloutMutation } from '@/core/apollo/generated/apollo-hooks';

interface CalloutContributionsPostProps extends BaseCalloutViewProps {
  callout: TypedCalloutDetails;
  contributions: PostCardPost[] | undefined;
  loading: boolean;
}

const CalloutContributionsPost = forwardRef<HTMLDivElement, CalloutContributionsPostProps>(
  (
    {
      callout,
      contributions,
      loading,
      canCreateContribution,
      contributionsCount,
      expanded,
      onExpand,
      onCollapse,
      calloutRestrictions,
      ...calloutSettingsProps
    },
    ref
  ) => {
    // Dialog handling
    const [postDialogOpen, setPostDialogOpen] = useState(false);
    const openCreateDialog = () => setPostDialogOpen(true);
    const closeCreateDialog = () => setPostDialogOpen(false);
    const navigate = useNavigate();
    const { isSmallScreen } = useScreenSize();

    const postNames = useMemo(() => contributions?.map(x => x.profile.displayName) ?? [], [contributions]);
    const sortedPosts = useMemo(() => sortBy(contributions, 'sortOrder'), [contributions]);

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
      <CalloutSettingsContainer
        callout={callout}
        items={{ posts: sortedPosts }}
        expanded={expanded}
        onExpand={onExpand}
        disableRichMedia={calloutRestrictions?.disableRichMedia}
        {...calloutSettingsProps}
      >
        {calloutSettingsProvided => (
          <>
            <CalloutLayout
              contentRef={ref}
              callout={callout}
              contributionsCount={contributionsCount}
              expanded={expanded}
              onExpand={onExpand}
              onCollapse={onCollapse}
              {...calloutSettingsProvided}
            >
              <ScrollableCardsLayout
                items={loading ? [undefined, undefined] : (sortedPosts ?? [])}
                createButton={!isSmallScreen && createButton}
                maxHeight={gutters(22)}
              >
                {post => <PostCard post={post} onClick={navigateToPost} />}
              </ScrollableCardsLayout>
              {isSmallScreen && canCreateContribution && callout.settings.contribution.enabled && (
                <CalloutBlockFooter contributionsCount={contributionsCount} onCreate={openCreateDialog} />
              )}
            </CalloutLayout>
            <PostCreationDialog
              open={postDialogOpen}
              onClose={closeCreateDialog}
              onCreate={onCreatePost}
              postNames={postNames}
              calloutDisplayName={callout.framing.profile.displayName}
              calloutId={callout.id}
              defaultDescription={callout.contributionDefaults.postDescription}
              creating={creatingPost}
              disableRichMedia={calloutRestrictions?.disableRichMedia}
            />
          </>
        )}
      </CalloutSettingsContainer>
    );
  }
);

export default CalloutContributionsPost;
