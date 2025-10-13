import { Box, Button, styled, useTheme } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { useMemo } from 'react';
import { createPortal } from 'react-dom';
import CommentsComponent from '@/domain/communication/room/Comments/CommentsComponent';
import Gutters from '@/core/ui/grid/Gutters';
import { GUTTER_PX } from '@/core/ui/grid/constants';
import { CalloutContributionPreviewComponentProps } from '../interfaces/CalloutContributionPreviewComponentProps';
import { useTranslation } from 'react-i18next';
import { useColumns } from '@/core/ui/grid/GridContext';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import { Tooltip } from '@mui/material';
import TagsComponent from '@/domain/shared/components/TagsComponent/TagsComponent';
import References from '@/domain/shared/components/References/References';
import usePersistedState from '@/core/state/usePersistedState';
import { useResizeDetector } from 'react-resize-detector';
import CommentsExpanderButton from './CommentsExpanderButton';
import useCalloutContributionComments from '../commentsToContribution/useCalloutContributionComments';

interface CalloutContributionPreviewPostProps extends CalloutContributionPreviewComponentProps {}

const MIN_HEIGHT_DESCRIPTION_GUTTERS = 15; // Minimum height when the description is very short, if long it will grow and expand the entire dialog
const MAX_HEIGHT_COMMENTS_DESCRIPTION_IS_SHORT = MIN_HEIGHT_DESCRIPTION_GUTTERS * GUTTER_PX; // Maximum height for comments when the description is very short, if description is long comments will grow together with them
const COMMENTS_EXPANDED_LOCALSTORAGE_KEY = 'CalloutContributionPreviewPost_CommentsExpanded';

const ResponsiveConfiguration: Record<
  number, // key: Number of columns available
  {
    PostCommentsRatio: { post: number; comments: number }; // (Ignored when comments are at the bottom)
    CommentsPosition: 'right' | 'bottom';
  }
> = {
  [4]: { PostCommentsRatio: { post: 1, comments: 1 }, CommentsPosition: 'bottom' },
  [8]: { PostCommentsRatio: { post: 1, comments: 1 }, CommentsPosition: 'right' },
  [12]: { PostCommentsRatio: { post: 2, comments: 1 }, CommentsPosition: 'right' },
};

const PostContentWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  backgroundColor: theme.palette.background.default,
  padding: gutters()(theme),
  minHeight: gutters(MIN_HEIGHT_DESCRIPTION_GUTTERS)(theme),
}));

const CommentsAnimation = {
  transitionProperty: 'flex',
  transitionDuration: '100ms',
};

const PostDescriptionAnimation = {
  height: 'calc-size(auto)', // Not supported in many browsers yet, but will look amazing in the future...
  transitionProperty: 'height',
  transitionDuration: '100ms',
};

const CalloutContributionPreviewPost = ({
  callout,
  contribution,
  loading,
  extraActionsPortalRef,
}: CalloutContributionPreviewPostProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const columns = useColumns();
  const responsiveConfig = ResponsiveConfiguration[columns] || ResponsiveConfiguration[12];

  // Initialize state from localStorage
  const [commentsExpanded, setCommentsExpanded] = usePersistedState(COMMENTS_EXPANDED_LOCALSTORAGE_KEY, false);
  const toggleCommentsExpanded = () => setCommentsExpanded(expanded => !expanded);

  const { ref: postContentRef, height: postContentHeight } = useResizeDetector();

  // Calculate max height for comments (minimum gutters(10), or postContentHeight if higher)
  const commentsMaxHeight = useMemo(() => {
    const minHeight = MAX_HEIGHT_COMMENTS_DESCRIPTION_IS_SHORT;
    return Math.max(minHeight, postContentHeight ?? 0);
  }, [postContentHeight, theme]);

  const calloutContributionComments = useCalloutContributionComments({ callout, contribution });
  // Render the comments toggle button in the parent's header via portal
  const commentsCount = contribution?.post?.comments.messagesCount ?? 0;
  const commentsHidden = calloutContributionComments.commentsEnabled === false && commentsCount === 0;

  const extraActionsButton = commentsHidden ? null : (
    <Tooltip title={t('buttons.toggle', { entity: t('common.comments') })} arrow>
      <Button
        size="small"
        variant="outlined"
        sx={{
          borderRadius: '4px',
          borderColor: theme => theme.palette.divider,
          backgroundColor: commentsExpanded ? theme.palette.primary.main : 'transparent',
          color: commentsExpanded ? theme.palette.primary.contrastText : theme.palette.text.primary,
        }}
        onClick={toggleCommentsExpanded}
        disabled={loading || !contribution}
        aria-label={t('common.Comments')}
      >
        {commentsCount > 0 && (
          <Box component="span" marginRight={gutters(0.5)}>
            {commentsCount}
          </Box>
        )}
        <ForumOutlinedIcon
          fontSize="small"
          sx={{
            color: commentsExpanded
              ? theme.palette.primary.contrastText
              : commentsCount > 0
                ? theme.palette.primary.main
                : theme.palette.primary.light,
          }}
        />
      </Button>
    </Tooltip>
  );

  const tags =
    contribution?.post?.profile.tagset?.tags && contribution.post.profile.tagset.tags.length > 0
      ? contribution.post.profile.tagset.tags
      : undefined;
  const references =
    contribution?.post?.profile.references && contribution.post.profile.references.length > 0
      ? contribution.post.profile.references
      : undefined;

  return (
    <>
      {extraActionsPortalRef.current && createPortal(extraActionsButton, extraActionsPortalRef.current)}
      <Box
        margin={gutters(-1)}
        display="flex"
        flexDirection={responsiveConfig.CommentsPosition === 'right' ? 'row' : 'column'}
      >
        <PostContentWrapper sx={PostDescriptionAnimation} flex={responsiveConfig.PostCommentsRatio.post}>
          <Box ref={postContentRef}>
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
        {commentsHidden ? null : (
          <>
            <CommentsExpanderButton
              onClick={toggleCommentsExpanded}
              expanded={commentsExpanded}
              position={responsiveConfig.CommentsPosition}
              disabled={loading || !contribution}
            />
            <Box flex={commentsExpanded ? responsiveConfig.PostCommentsRatio.comments : 0} sx={CommentsAnimation}>
              {commentsExpanded && (
                <Gutters disableSidePadding disableGap height="100%">
                  <CommentsComponent
                    {...calloutContributionComments}
                    loading={loading || calloutContributionComments.loading}
                    height="100%"
                    fullHeight
                    maxHeight={commentsMaxHeight}
                  />
                </Gutters>
              )}
            </Box>
          </>
        )}
      </Box>
    </>
  );
};

export default CalloutContributionPreviewPost;
