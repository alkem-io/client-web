import React, { FC, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ApolloError, FetchResult } from '@apollo/client';
import { alpha, Avatar, Box, Grid } from '@mui/material';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import DashboardGenericSection from '../../shared/components/DashboardSections/DashboardGenericSection';
import { Reference } from '../../../models/graphql-schema';
import { SectionSpacer } from '../../shared/components/Section/Section';
import TagsComponent from '../../shared/components/TagsComponent/TagsComponent';
import DiscussionComment from '../../shared/components/Comments/DiscussionComment';
import { Comment } from '../../../models/discussion/comment';
import PostMessageToCommentsForm from '../../shared/components/Comments/PostMessageToCommentsForm';
import Markdown from '../../../common/components/core/Markdown';
import References from '../../../common/components/composite/common/References/References';
import TagLabel from '../../../common/components/composite/common/TagLabel/TagLabel';
import DashboardColumn from '../../../common/components/composite/sections/DashboardSection/DashboardColumn';
import { mapWithSeparator } from '../../shared/utils/joinNodes';
import { animateScroll as scroller } from 'react-scroll';
import { useResizeDetector } from 'react-resize-detector';
import { MID_TEXT_LENGTH } from '../../../models/constants/field-length.constants';

const COMMENTS_CONTAINER_HEIGHT = 400;
const SCROLL_BOTTOM_MISTAKE_TOLERANCE = 10;

export interface AspectDashboardViewProps {
  canReadComments: boolean;
  canPostComments: boolean;
  canDeleteComment: (messageId: string) => boolean;
  banner?: string;
  displayName?: string;
  description?: string;
  type?: string;
  messages?: Comment[];
  commentId?: string;
  tags?: string[];
  references?: Pick<Reference, 'id' | 'name' | 'uri' | 'description'>[];
  creatorAvatar?: string;
  creatorName?: string;
  createdDate?: string;
  handlePostComment: (commentId: string, message: string) => Promise<FetchResult<unknown>> | void;
  handleDeleteComment: (commentId: string, messageId: string) => void;
  loading: boolean;
  loadingCreator: boolean;
  error?: ApolloError;
}

interface ScrollState {
  scrollTop: number;
  scrollHeight: number;
}

const isScrolledToBottom = ({
  scrollTop,
  scrollHeight,
  containerHeight,
}: ScrollState & { containerHeight: number }) => {
  // Due to a bug with the zoom in Chromium based browsers we can not check if scrollTop === (scrollHeight - containerHeight)
  // This will return true if scrollTop is approximately equal to (scrollHeight - containerHeight), if the comments are scrolled very close to the end
  return Math.abs(scrollHeight - containerHeight - scrollTop) < SCROLL_BOTTOM_MISTAKE_TOLERANCE;
};

const AspectDashboardView: FC<AspectDashboardViewProps> = props => {
  const { t } = useTranslation();
  const { loading, loadingCreator } = props;

  const commentsContainerRef = useRef<HTMLElement>(null);
  const prevScrollTopRef = useRef<ScrollState>({ scrollTop: 0, scrollHeight: 0 });
  const wasScrolledToBottomRef = useRef(true);

  const { banner, description, displayName, type, messages = [], commentId, tags = [], references } = props;
  const { creatorName, creatorAvatar, createdDate } = props;
  const { canReadComments, canDeleteComment, canPostComments } = props;
  const { handlePostComment, handleDeleteComment } = props;

  const onPostComment = (message: string) => (commentId ? handlePostComment(commentId, message) : undefined);
  const onDeleteComment = (id: string) => (commentId ? handleDeleteComment(commentId, id) : undefined);

  const { height: containerHeight = 0 } = useResizeDetector({
    targetRef: commentsContainerRef,
  });

  useEffect(() => {
    if (commentsContainerRef.current) {
      wasScrolledToBottomRef.current = isScrolledToBottom({ ...prevScrollTopRef.current, containerHeight });

      prevScrollTopRef.current = {
        scrollTop: commentsContainerRef.current.scrollTop,
        scrollHeight: commentsContainerRef.current.scrollHeight,
      };
    }
  }, [messages]);

  useEffect(() => {
    if (wasScrolledToBottomRef.current && commentsContainerRef.current) {
      scroller.scrollToBottom({ container: commentsContainerRef.current });
    }
  }, [messages]);

  const handleCommentsScroll = () => {
    prevScrollTopRef.current.scrollTop = commentsContainerRef.current!.scrollTop;
  };

  return (
    <Grid container spacing={2}>
      <DashboardColumn>
        <DashboardGenericSection
          bannerUrl={banner}
          alwaysShowBanner
          bannerOverlay={
            <AuthorComponent
              avatarSrc={creatorAvatar}
              name={creatorName}
              createdDate={createdDate}
              loading={loadingCreator}
            />
          }
          headerText={displayName}
          primaryAction={loading ? <Skeleton width={'30%'} /> : <TagLabel>{type}</TagLabel>}
        >
          {loading ? (
            <>
              <Skeleton width={'80%'} />
              <Skeleton width={'70%'} />
              <Skeleton width={'60%'} />
            </>
          ) : (
            <>
              <Typography component={Markdown}>{description}</Typography>
              <SectionSpacer double />
              <TagsComponent tags={tags} loading={loading} />
            </>
          )}
        </DashboardGenericSection>
        <DashboardGenericSection headerText={t('common.references')}>
          {loading ? (
            <>
              <Skeleton />
              <Skeleton />
              <Skeleton />
            </>
          ) : (
            <References references={references} noItemsView={<Typography>{t('common.no-references')}</Typography>} />
          )}
        </DashboardGenericSection>
      </DashboardColumn>
      {canReadComments && (
        <DashboardColumn>
          <DashboardGenericSection headerText={`${t('common.comments')} (${messages.length})`}>
            <Box
              sx={{ maxHeight: COMMENTS_CONTAINER_HEIGHT, overflowY: 'auto' }}
              ref={commentsContainerRef}
              onScroll={handleCommentsScroll}
            >
              {mapWithSeparator(messages, SectionSpacer, comment => (
                <DiscussionComment
                  key={comment.id}
                  comment={comment}
                  canDelete={canDeleteComment(comment.id)}
                  onDelete={onDeleteComment}
                />
              ))}
            </Box>
            <SectionSpacer double />
            <Box>
              {canPostComments && (
                <PostMessageToCommentsForm
                  placeholder={t('pages.aspect.dashboard.comment.placeholder')}
                  onPostComment={onPostComment}
                  maxLength={MID_TEXT_LENGTH}
                />
              )}
              {!canPostComments && (
                <Box paddingY={4} display="flex" justifyContent="center">
                  <Typography variant="h4">{t('components.discussion.cant-post')}</Typography>
                </Box>
              )}
            </Box>
            <SectionSpacer />
          </DashboardGenericSection>
        </DashboardColumn>
      )}
    </Grid>
  );
};
export default AspectDashboardView;

interface AuthorComponentProps {
  avatarSrc: string | undefined;
  name: string | undefined;
  createdDate: string | undefined;
  loading?: boolean;
}

const AuthorComponent: FC<AuthorComponentProps> = ({ avatarSrc, name, createdDate, loading }) => {
  const localeCreatedDate = createdDate && new Date(createdDate)?.toLocaleDateString();
  return (
    <Box
      sx={{
        width: '150px',
        position: 'absolute',
        top: 0,
        right: 0,
        padding: theme => theme.spacing(1),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: theme => alpha(theme.palette.neutralLight.main, 0.3),
      }}
    >
      {loading ? (
        <Skeleton variant="rectangular">
          <Avatar />
        </Skeleton>
      ) : (
        <Avatar src={avatarSrc} />
      )}
      <Typography noWrap sx={{ maxWidth: '100%' }}>
        {loading ? <Skeleton width="100%" /> : name}
      </Typography>
      <Typography noWrap>{loading ? <Skeleton width="100%" /> : localeCreatedDate}</Typography>
    </Box>
  );
};
