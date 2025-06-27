import { forwardRef, useMemo, useState } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import CalloutLayout from '../calloutBlock/CalloutLayout';
import ScrollableCardsLayout from '@/domain/collaboration/callout/components/ScrollableCardsLayout';
import PostCreationDialog from '@/domain/collaboration/post/PostCreationDialog/PostCreationDialog';
import { CalloutAllowedContributors, CalloutContributionType, CreatePostInput } from '@/core/apollo/generated/graphql-schema';
import CreateCalloutItemButton from '../CreateCalloutItemButton';
import PostCard, { PostCardPost } from './PostCard';
import { BaseCalloutViewProps } from '../CalloutViewTypes';
import { gutters } from '@/core/ui/grid/utils';
import CalloutBlockFooter from '../calloutBlock/CalloutBlockFooter';
import { useScreenSize } from '@/core/ui/grid/constants';
import {
  LocationStateCachedCallout,
  LocationStateKeyCachedCallout,
} from '@/domain/collaboration/CalloutPage/CalloutPage';
import CalloutSettingsContainer from '../calloutBlock/CalloutSettingsContainer';
import { TypedCalloutDetails } from '../../new-callout/models/TypedCallout';
import { sortBy } from 'lodash';

interface PostCalloutProps extends BaseCalloutViewProps {
  callout: TypedCalloutDetails;
  posts: PostCardPost[] | undefined;
  loading: boolean;
  creatingPost: boolean;
  onCreatePost: (post: CreatePostInput) => Promise<unknown>;
}

const PostCallout = forwardRef<Element, PostCalloutProps>(
  (
    {
      callout,
      posts,
      loading,
      creatingPost,
      onCreatePost,
      canCreateContribution: canCreate = false,
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

    const postNames = useMemo(() => posts?.map(x => x.profile.displayName) ?? [], [posts]);
    const sortedPosts = useMemo(() => sortBy(posts, 'sortOrder'), [posts]);

    const createButton = canCreate &&
      callout.settings.contribution.enabled &&
      callout.settings.contribution.allowedTypes.includes(CalloutContributionType.Post)
    callout.settings.contribution.canAddContributions.includes(CalloutAllowedContributors.Members)
      && (
      <CreateCalloutItemButton onClick={openCreateDialog} />
    );

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
                items={loading ? [undefined, undefined] : sortedPosts ?? []}
                createButton={!isSmallScreen && createButton}
                maxHeight={gutters(22)}
              >
                {post => <PostCard post={post} onClick={navigateToPost} />}
              </ScrollableCardsLayout>
              {isSmallScreen && canCreate && callout.settings.contribution.enabled && (
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

export default PostCallout;
