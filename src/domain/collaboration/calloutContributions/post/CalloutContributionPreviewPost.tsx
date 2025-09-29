import { Box } from '@mui/material';
import CalloutContributionModel from '../CalloutContributionModel';
import { gutters } from '@/core/ui/grid/utils';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { useState } from 'react';

interface CalloutContributionPreviewPostProps {
  contribution: CalloutContributionModel | undefined;
  loading?: boolean;
}

const POST_COMMENTS_PROPORTION = { post: 4, comments: 1 } as const;

const CalloutContributionPreviewPost = ({ contribution }: CalloutContributionPreviewPostProps) => {
  const [commentsExpanded, setCommentsExpanded] = useState(false);

  return (
    <Box margin={gutters(-1)} display="flex" flexDirection="row">
      <Box bgcolor={theme => theme.palette.background.default} padding={gutters()} flex={POST_COMMENTS_PROPORTION.post}>
        <WrapperMarkdown>{contribution?.post?.profile.description ?? ''}</WrapperMarkdown>
      </Box>
      <Box flex={commentsExpanded ? POST_COMMENTS_PROPORTION.comments : 0}>
        {commentsExpanded && (
          <Box>
            TODO: Comments here...
            {/*
            <CommentsComponent

              const commentsEnabled = data?.lookup.callout?.settings?.contribution?.commentsEnabled ?? false;

              const commentsContainerRef = useRef<HTMLElement>(null);
              const prevScrollTopRef = useRef<ScrollState>({ scrollTop: 0, scrollHeight: 0 });
              const wasScrolledToBottomRef = useRef(true);
              const [commentToBeDeleted, setCommentToBeDeleted] = useState<string | undefined>(undefined);

              const deleteComment = (id: string) => (comments.roomId ? actions.deleteMessage(comments.roomId, id) : undefined);
              const onDeleteComment = (id: string) => setCommentToBeDeleted(id);
                          const commentReactionsMutations = useCommentReactionsMutations(comments.roomId);

              const handleCommentsScroll = () => {
                prevScrollTopRef.current.scrollTop = commentsContainerRef.current!.scrollTop;
              };

              const canPostComments = permissions.canPostComments && commentsEnabled;


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
                  canPostMessages={canPostComments}
                  onReply={actions.postReply}
                  canDeleteMessage={permissions.canDeleteComment}
                  onDeleteMessage={onDeleteComment}
                  canAddReaction={permissions.canAddReaction}
                  {...commentReactionsMutations}
                />
              </Gutters>
            </ScrollerWithGradient>
            <Box>
              {canPostComments && (
                <PostMessageToCommentsForm
                  vcEnabled={vcEnabled}
                  placeholder={t('pages.post.dashboard.comment.placeholder')}
                  onPostComment={actions.postMessage}
                />
              )}
              {!canPostComments && (
                <Box paddingY={4} display="flex" justifyContent="center">
                  <BlockSectionTitle>{t('components.discussion.cant-post')}</BlockSectionTitle>
                </Box>
              )}
            </Box>
            */}
          </Box>
        )}

      </Box>
      {/*<ConfirmationDialog
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
      />*/}
    </Box>
  );
}

export default CalloutContributionPreviewPost;