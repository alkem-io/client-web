import { useCreatePostOnCalloutMutation } from '@/core/apollo/generated/apollo-hooks';
import { CalloutContributionType, CreatePostInput } from '@/core/apollo/generated/graphql-schema';
import PostCreationDialog from '@/domain/collaboration/post/PostCreationDialog/PostCreationDialog';
import { useState } from 'react';
import CreateContributionButton from '../CreateContributionButton';
import { CalloutContributionCreateButtonProps } from '../interfaces/CalloutContributionCreateButtonProps';
import { normalizeLink } from '@/core/utils/links';
import useNavigate from '@/core/routing/useNavigate';
import { LocationStateKeyCachedCallout } from '../../CalloutPage/CalloutPage';

interface CreateContributionButtonPostProps extends CalloutContributionCreateButtonProps {}

const CreateContributionButtonPost = ({
  callout,
  calloutRestrictions,
  canCreateContribution,
  onContributionCreated,
}: CreateContributionButtonPostProps) => {
  const navigate = useNavigate();
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const openCreateDialog = () => setPostDialogOpen(true);
  const closeCreateDialog = () => setPostDialogOpen(false);

  const [createPost, { loading: creatingPost }] = useCreatePostOnCalloutMutation({
    refetchQueries: ['CalloutContributions'],
    awaitRefetchQueries: true,
  });

  const onCreatePost = async (post: CreatePostInput) => {
    const result = await createPost({
      variables: {
        calloutId: callout.id,
        post: {
          profileData: {
            displayName: post.profileData.displayName,
            description: post.profileData.description,
          },
          tags: post.tags,
        },
      },
    });

    await onContributionCreated?.();

    if (result.data?.createContributionOnCallout.post?.profile.url) {
      navigate(normalizeLink(result.data.createContributionOnCallout.post.profile.url), {
        state: {
          [LocationStateKeyCachedCallout]: callout,
          keepScroll: true,
        },
      });
    }
  };

  return (
    <>
      {canCreateContribution ? (
        <CreateContributionButton onClick={openCreateDialog} contributionType={CalloutContributionType.Post} />
      ) : undefined}
      <PostCreationDialog
        open={postDialogOpen}
        onClose={closeCreateDialog}
        onCreate={onCreatePost}
        calloutDisplayName={callout.framing.profile.displayName}
        calloutId={callout.id}
        defaultDisplayName={callout.contributionDefaults.defaultDisplayName}
        defaultDescription={callout.contributionDefaults.postDescription}
        creating={creatingPost}
        disableRichMedia={calloutRestrictions?.disableRichMedia}
      />
    </>
  );
};

CreateContributionButtonPost.displayName = 'CreateContributionButtonPost';
export default CreateContributionButtonPost;
