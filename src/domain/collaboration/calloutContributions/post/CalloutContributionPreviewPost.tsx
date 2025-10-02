import { Box, Button, styled, useTheme } from '@mui/material';
import CalloutContributionModel from '../CalloutContributionModel';
import { gutters } from '@/core/ui/grid/utils';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { useEffect, useMemo, useRef, useState } from 'react';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import CommentsComponent from '@/domain/communication/room/Comments/CommentsComponent';
import CalloutContributionCommentsContainer, {
  CalloutContributionCommentsContainerProps,
} from '../commentsToContribution/CalloutContributionCommentsContainer';
import Gutters from '@/core/ui/grid/Gutters';
import { GUTTER_PX } from '@/core/ui/grid/constants';

interface CalloutContributionPreviewPostProps {
  callout: CalloutContributionCommentsContainerProps['callout']; // Need callout in this contribution preview to check the callout settings about comments inside contributions
  contribution: CalloutContributionModel | undefined;
  loading?: boolean;
}

const POST_COMMENTS_PROPORTION = { post: 2, comments: 1 } as const;
const MIN_HEIGHT_DESCRIPTION_GUTTERS = 15; // Minimum height when the description is very short, if long it will grow and expand the entire dialog
const MAX_HEIGHT_COMMENTS_DESCRIPTION_IS_SHORT = MIN_HEIGHT_DESCRIPTION_GUTTERS * GUTTER_PX; // Maximum height for comments when the description is very short, if description is long comments will grow together with them

const PostContentWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  padding: gutters()(theme),
  flex: POST_COMMENTS_PROPORTION.post,
  minHeight: gutters(MIN_HEIGHT_DESCRIPTION_GUTTERS)(theme),
}));

const CommentsExpander = styled(Button)(({ theme }) => ({
  borderRadius: 0,
  border: 0,
  width: gutters()(theme),
  minWidth: 0,
  padding: 0,
  color: theme.palette.divider,
  // Icon in the button must have preserveAspectRatio="none"
  '& > svg': {
    height: gutters(3)(theme),
    width: gutters()(theme),
  },
}));

const CommentsAnimation = {
  transitionProperty: 'flex',
  transitionDuration: '100ms',
}

const PostDescriptionAnimation = {
  height: 'calc-size(auto)',  // Not supported in many browsers yet, but will look amazing in the future... //!! maybe find another way
  transitionProperty: 'height',
  transitionDuration: '100ms',
}

const CalloutContributionPreviewPost = ({ callout, contribution, loading }: CalloutContributionPreviewPostProps) => {
  const theme = useTheme();
  const [commentsExpanded, setCommentsExpanded] = useState(false);

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

  return (
    <Box margin={gutters(-1)} display="flex" flexDirection="row">
      <PostContentWrapper ref={postContentRef} sx={PostDescriptionAnimation}>
        <WrapperMarkdown>{contribution?.post?.profile.description ?? ''}</WrapperMarkdown>
      </PostContentWrapper>
      <CommentsExpander onClick={() => setCommentsExpanded(!commentsExpanded)}>
        {commentsExpanded ? (
          <KeyboardDoubleArrowRightIcon preserveAspectRatio="none" />
        ) : (
          <KeyboardDoubleArrowLeftIcon preserveAspectRatio="none" />
        )}
      </CommentsExpander>
      <Box flex={commentsExpanded ? POST_COMMENTS_PROPORTION.comments : 0} sx={CommentsAnimation} >
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
                  isMember={false /* //!! myMembershipStatus === CommunityMembershipStatus.Member*/}
                />
              )}
            </CalloutContributionCommentsContainer>
          </Gutters>
        )}
      </Box>
    </Box>
  );
};

export default CalloutContributionPreviewPost;
