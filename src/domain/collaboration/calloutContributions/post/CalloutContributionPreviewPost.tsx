import { Box, styled } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { CalloutContributionPreviewComponentProps } from '../interfaces/CalloutContributionPreviewComponentProps';
import TagsComponent from '@/domain/shared/components/TagsComponent/TagsComponent';
import References from '@/domain/shared/components/References/References';

const MIN_HEIGHT_DESCRIPTION_GUTTERS = 15;

const PostContentWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  backgroundColor: theme.palette.background.default,
  padding: gutters()(theme),
  minHeight: gutters(MIN_HEIGHT_DESCRIPTION_GUTTERS)(theme),
}));

const CalloutContributionPreviewPost = ({ contribution }: CalloutContributionPreviewComponentProps) => {
  const tags =
    contribution?.post?.profile.tagset?.tags && contribution.post.profile.tagset.tags.length > 0
      ? contribution.post.profile.tagset.tags
      : undefined;
  const references =
    contribution?.post?.profile.references && contribution.post.profile.references.length > 0
      ? contribution.post.profile.references
      : undefined;

  return (
    <PostContentWrapper>
      <Box>
        <WrapperMarkdown>{contribution?.post?.profile.description ?? ''}</WrapperMarkdown>
      </Box>
      {(tags || references) && (
        <Box>
          <hr />
          {tags && <TagsComponent variant="filled" tags={tags} marginTop="auto" />}
          {references && <References references={references} />}
        </Box>
      )}
    </PostContentWrapper>
  );
};

export default CalloutContributionPreviewPost;
