import { Box, Button, ButtonProps, styled, useTheme } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import CommentsComponent from '@/domain/communication/room/Comments/CommentsComponent';
import CalloutContributionCommentsContainer from '../commentsToContribution/CalloutContributionCommentsContainer';
import Gutters from '@/core/ui/grid/Gutters';
import { GUTTER_PX } from '@/core/ui/grid/constants';
import { CalloutContributionPreviewComponentProps } from '../interfaces/CalloutContributionPreviewComponentProps';
import { useTranslation } from 'react-i18next';
import { useColumns } from '@/core/ui/grid/GridContext';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import { Tooltip } from '@mui/material';
import TagsComponent from '@/domain/shared/components/TagsComponent/TagsComponent';
import References from '@/domain/shared/components/References/References';

interface CalloutContributionPreviewPostProps extends CalloutContributionPreviewComponentProps {}

const MIN_HEIGHT_DESCRIPTION_GUTTERS = 15; // Minimum height when the description is very short, if long it will grow and expand the entire dialog
const MAX_HEIGHT_COMMENTS_DESCRIPTION_IS_SHORT = MIN_HEIGHT_DESCRIPTION_GUTTERS * GUTTER_PX; // Maximum height for comments when the description is very short, if description is long comments will grow together with them

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

const CommentsExpanderButton = ({
  expanded,
  position,
  ...props
}: { expanded: boolean; position: 'bottom' | 'right' } & ButtonProps) => {
  const { t } = useTranslation();
  return (
    <Button
      sx={{
        borderRadius: 0,
        border: 0,
        ...(position === 'right' ? { width: gutters(), minWidth: gutters() } : undefined),
        ...(position === 'bottom' ? { height: gutters(), minHeight: gutters(), width: '100%' } : undefined),
        padding: 0,
        // Icon in the button must have preserveAspectRatio="none"
        '& > svg': {
          color: theme => theme.palette.divider,
          height: position === 'right' ? gutters(3) : gutters(),
          width: position === 'right' ? gutters() : gutters(3),
        },
      }}
      aria-label={
        expanded
          ? t('buttons.collapseEntity', { entity: t('common.comments') })
          : t('buttons.expandEntity', { entity: t('common.comments') })
      }
      title={
        expanded
          ? t('buttons.collapseEntity', { entity: t('common.comments') })
          : t('buttons.expandEntity', { entity: t('common.comments') })
      }
      aria-expanded={expanded}
      {...props}
    >
      {position === 'right' &&
        (expanded ? (
          <KeyboardDoubleArrowRightIcon preserveAspectRatio="none" />
        ) : (
          <KeyboardDoubleArrowLeftIcon preserveAspectRatio="none" />
        ))}
      {position === 'bottom' &&
        (expanded ? (
          <KeyboardDoubleArrowUpIcon preserveAspectRatio="none" />
        ) : (
          <KeyboardDoubleArrowDownIcon preserveAspectRatio="none" />
        ))}
    </Button>
  );
};

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

  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const toggleCommentsExpanded = () => setCommentsExpanded(expanded => !expanded);

  const postContentRef = useRef<HTMLDivElement>(null);
  const [postContentHeight, setPostContentHeight] = useState(0);

  // Capture the height when PostContentWrapper renders and comments are not expanded
  useEffect(() => {
    if (!commentsExpanded && postContentRef.current) {
      const height = postContentRef.current.offsetHeight;
      setPostContentHeight(height);
    }
  }, [commentsExpanded, contribution]);

  // Calculate max height for comments (minimum gutters(10), or postContentHeight if higher)
  const commentsMaxHeight = useMemo(() => {
    const minHeight = MAX_HEIGHT_COMMENTS_DESCRIPTION_IS_SHORT;
    return Math.max(minHeight, postContentHeight);
  }, [postContentHeight, theme]);

  // Render the comments toggle button in the parent's header via portal
  const commentsCount = contribution?.post?.comments.messagesCount ?? 0;
  const extraActionsButton = (
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
        <PostContentWrapper
          ref={postContentRef}
          sx={PostDescriptionAnimation}
          flex={responsiveConfig.PostCommentsRatio.post}
        >
          <WrapperMarkdown>{contribution?.post?.profile.description ?? ''}</WrapperMarkdown>
          {(tags || references) && (
            <Box>
              <hr />
              {tags && <TagsComponent variant="filled" tags={tags} marginTop="auto" />}
              {references && <References references={references} />}
            </Box>
          )}
        </PostContentWrapper>
        <CommentsExpanderButton
          onClick={toggleCommentsExpanded}
          expanded={commentsExpanded}
          position={responsiveConfig.CommentsPosition}
          disabled={loading || !contribution}
        >
          {commentsExpanded ? (
            <KeyboardDoubleArrowRightIcon preserveAspectRatio="none" />
          ) : (
            <KeyboardDoubleArrowLeftIcon preserveAspectRatio="none" />
          )}
        </CommentsExpanderButton>
        <Box flex={commentsExpanded ? responsiveConfig.PostCommentsRatio.comments : 0} sx={CommentsAnimation}>
          {commentsExpanded && (
            <Gutters disableSidePadding disableGap height="100%">
              <CalloutContributionCommentsContainer callout={callout} contribution={contribution}>
                {props => (
                  <CommentsComponent
                    {...props}
                    commentsEnabled={props.commentsEnabled}
                    loading={loading || props.loading}
                    height="100%"
                    fullHeight
                    maxHeight={commentsMaxHeight}
                  />
                )}
              </CalloutContributionCommentsContainer>
            </Gutters>
          )}
        </Box>
      </Box>
    </>
  );
};

export default CalloutContributionPreviewPost;
