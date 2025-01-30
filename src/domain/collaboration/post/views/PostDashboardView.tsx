import { ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { alpha, Box } from '@mui/material';
import Avatar from '@/core/ui/avatar/Avatar';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import DashboardGenericSection from '@/domain/shared/components/DashboardSections/DashboardGenericSection';
import { SectionSpacer } from '@/domain/shared/components/Section/Section';
import TagsComponent from '@/domain/shared/components/TagsComponent/TagsComponent';
import PostMessageToCommentsForm from '@/domain/communication/room/Comments/PostMessageToCommentsForm';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import References from '@/domain/shared/components/References/References';
import { animateScroll as scroller } from 'react-scroll';
import { useResizeDetector } from 'react-resize-detector';
import { ShareComponent } from '@/domain/shared/components/ShareDialog/ShareDialog';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import Gutters from '@/core/ui/grid/Gutters';
import useCommentReactionsMutations from '@/domain/communication/room/Comments/useCommentReactionsMutations';
import MessagesThread from '@/domain/communication/room/Comments/MessagesThread';
import ScrollerWithGradient from '@/core/ui/overflow/ScrollerWithGradient';
import LocationCaption from '@/core/ui/location/LocationCaption'; //!! add this back
import usePost from '../graphql/usePost';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentColumn from '@/core/ui/content/PageContentColumn';

const COMMENTS_CONTAINER_HEIGHT = 400;
const SCROLL_BOTTOM_MISTAKE_TOLERANCE = 10;

export interface PostDashboardViewProps {
  mode: 'messages' | 'share';
  postId: string | undefined;
  bannerOverlayOverride?: ReactNode;
  vcEnabled?: boolean;
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

const PostDashboardView = ({ mode, postId, vcEnabled, bannerOverlayOverride }: PostDashboardViewProps) => {
  const { t } = useTranslation();
  const {
    loading: {
      loading
    },
    actions,
    post,
    permissions,
    comments,
  } = usePost({
    postId
  });


  const commentsContainerRef = useRef<HTMLElement>(null);
  const prevScrollTopRef = useRef<ScrollState>({ scrollTop: 0, scrollHeight: 0 });
  const wasScrolledToBottomRef = useRef(true);
  const [commentToBeDeleted, setCommentToBeDeleted] = useState<string | undefined>(undefined);


  const deleteComment = (id: string) => (comments.roomId ? actions.deleteMessage(comments.roomId, id) : undefined);
  const onDeleteComment = (id: string) => setCommentToBeDeleted(id);

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
  }, [comments, containerHeight]);

  useEffect(() => {
    if (wasScrolledToBottomRef.current && commentsContainerRef.current) {
      scroller.scrollToBottom({ container: commentsContainerRef.current });
    }
  }, [comments]);

  const commentReactionsMutations = useCommentReactionsMutations(comments.roomId);

  const handleCommentsScroll = () => {
    prevScrollTopRef.current.scrollTop = commentsContainerRef.current!.scrollTop;
  };

  const bannerOverlay = bannerOverlayOverride ?? (
    <AuthorComponent avatarSrc={post?.createdBy?.profile.avatar?.uri} name={post?.createdBy?.profile.displayName} createdDate={post?.createdDate} loading={loading} />
  );

  return (
    <PageContentBlock>
      <PageContentColumn columns={6}>
        <DashboardGenericSection
          bannerUrl={post?.profile.banner?.uri}
          alwaysShowBanner
          bannerOverlay={bannerOverlay}
          headerText={post?.profile.displayName}
        >
          {loading ? (
            <>
              <Skeleton width={'80%'} />
              <Skeleton width={'70%'} />
              <Skeleton width={'60%'} />
            </>
          ) : (
            <Gutters>
              <WrapperMarkdown>{post?.profile.description ?? ''}</WrapperMarkdown>
              <TagsComponent tags={post?.profile.tagset?.tags ?? []} loading={loading} />
            </Gutters>
          )}
        </DashboardGenericSection>
        <References references={post?.profile.references} />
      </PageContentColumn>
      {mode === 'messages' && permissions.canReadComments && (
        <PageContentColumn columns={6}>
          <PageContentBlock title={`${t('common.comments')} (${comments.messages.length})`}>
            <ScrollerWithGradient
              maxHeight={COMMENTS_CONTAINER_HEIGHT}
              minHeight={0}
              marginRight={1}
              flexGrow={1}
              scrollerRef={commentsContainerRef}
              onScroll={handleCommentsScroll}
            >
              <Gutters gap={0}>
                <MessagesThread
                  messages={comments.messages}
                  vcInteractions={comments.vcInteractions}
                  vcEnabled={vcEnabled}
                  canPostMessages={permissions.canPostComments}
                  onReply={actions.postReply}
                  canDeleteMessage={permissions.canDeleteComment}
                  onDeleteMessage={onDeleteComment}
                  canAddReaction={permissions.canAddReaction}
                  {...commentReactionsMutations}
                />
              </Gutters>
            </ScrollerWithGradient>
            <SectionSpacer double />
            <Box>
              {permissions.canPostComments && (
                <PostMessageToCommentsForm
                  vcEnabled={vcEnabled}
                  placeholder={t('pages.post.dashboard.comment.placeholder')}
                  onPostComment={postMessage}
                />
              )}
              {!permissions.canPostComments && (
                <Box paddingY={4} display="flex" justifyContent="center">
                  <Typography variant="h4">{t('components.discussion.cant-post')}</Typography>
                </Box>
              )}
            </Box>
          </PageContentBlock>
          <ConfirmationDialog
            actions={{
              onCancel: () => setCommentToBeDeleted(undefined),
              onConfirm: async () => {
                if (commentToBeDeleted) {
                  await deleteComment(commentToBeDeleted);
                }
                setCommentToBeDeleted(undefined);
              },
            }}
            entities={{
              confirmButtonTextId: 'buttons.delete',
              contentId: 'components.confirmation-dialog.delete-comment.confirmation-text',
              titleId: 'components.confirmation-dialog.delete-comment.confirmation-title',
            }}
            options={{
              show: Boolean(commentToBeDeleted),
            }}
          />
        </PageContentColumn>
      )}
      {mode === 'share' && (
        <PageContentColumn columns={6}>
          <DashboardGenericSection>
            {(loading || !post?.profile.url) ? (
              <Skeleton />
            ) : (
              <ShareComponent url={post.profile.url} entityTypeName="card" />
            )}
          </DashboardGenericSection>
        </PageContentColumn>
      )}
    </PageContentBlock >
  );
};

export default PostDashboardView;

type AuthorComponentProps = {
  avatarSrc: string | undefined;
  name: string | undefined;
  createdDate: string | Date | undefined;
  loading?: boolean;
};

const AuthorComponent = ({ avatarSrc, name, createdDate, loading }: AuthorComponentProps) => {
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
