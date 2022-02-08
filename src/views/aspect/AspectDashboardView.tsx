import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ApolloError } from '@apollo/client';
import { Box, Link } from '@mui/material';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import { ViewProps } from '../../models/view';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import { Reference } from '../../models/graphql-schema';
import { SectionSpacer } from '../../components/core/Section/Section';
import TagsComponent from '../../components/composite/common/TagsComponent/TagsComponent';
import ContextLayout from '../../components/composite/layout/Context/ContextLayout';
import DiscussionComment from '../../components/composite/common/Discussion/Comment';
import { Comment } from '../../models/discussion/comment';
import PostComment from '../../components/composite/common/Discussion/PostComment';

const COMMENTS_CONTAINER_HEIGHT = 400;

export interface AspectDashboardViewEntities {
  banner?: string;
  displayName?: string;
  description?: string;
  messages?: Comment[];
  commentId?: string;
  tags?: string[];
  references?: Pick<Reference, 'id' | 'name' | 'uri'>[];
  currentUserId?: string;
}

export interface AspectDashboardViewActions {
  handlePostComment: (commentId: string, message: string) => void;
  handleDeleteComment: (commentId: string, messageId: string) => void;
}

export interface AspectDashboardViewState {
  loading: boolean;
  error?: ApolloError;
}

export interface AspectDashboardViewOptions {
  canReadComments: boolean;
  canPostComments: boolean;
  canDeleteComments: boolean;
}

export interface AspectDashboardViewProps
  extends ViewProps<
    AspectDashboardViewEntities,
    AspectDashboardViewActions,
    AspectDashboardViewState,
    AspectDashboardViewOptions
  > {}

const AspectDashboardView: FC<AspectDashboardViewProps> = ({ entities, state, options, actions }) => {
  const { t } = useTranslation();
  const loading = state.loading;

  const { banner, description, displayName, messages = [], commentId, tags, references, currentUserId } = entities;
  const { canReadComments, canDeleteComments, canPostComments } = options;
  const { handlePostComment, handleDeleteComment } = actions;

  const canDeleteComment = (authorId?: string) =>
    (currentUserId && authorId && authorId === currentUserId) || canDeleteComments;
  const onPostComment = (message: string) => (commentId ? handlePostComment(commentId, message) : undefined);
  const onDeleteComment = (id: string) => (commentId ? handleDeleteComment(commentId, id) : undefined);

  const rightPanel = (
    <>
      <DashboardGenericSection headerText={t('common.tags')}>
        <TagsComponent tags={tags ?? []} loading={loading} />
      </DashboardGenericSection>
      <SectionSpacer />
      <DashboardGenericSection headerText={t('common.references')}>
        {loading ? (
          <>
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </>
        ) : (
          <>
            {references &&
              references.length > 0 &&
              references.map((l, i) => (
                <Link key={i} href={l.uri} target="_blank">
                  <Typography>{l.uri}</Typography>
                </Link>
              ))}
            {references && !references.length && <Typography>{t('common.no-references')}</Typography>}
          </>
        )}
      </DashboardGenericSection>
    </>
  );

  return (
    <ContextLayout rightPanel={rightPanel}>
      <>
        <DashboardGenericSection bannerUrl={banner} headerText={displayName}>
          {loading ? (
            <>
              <Skeleton width={'80%'} />
              <Skeleton width={'70%'} />
              <Skeleton width={'60%'} />
            </>
          ) : (
            <Typography>{description}</Typography>
          )}
        </DashboardGenericSection>
        <SectionSpacer />
        {canReadComments && (
          <DashboardGenericSection headerText={`${t('common.comments')} (${messages.length})`}>
            <Box sx={{ maxHeight: COMMENTS_CONTAINER_HEIGHT, overflowY: 'auto' }}>
              {messages.map((x, i) => (
                <Box key={i}>
                  <DiscussionComment
                    comment={x}
                    canDelete={canDeleteComment(x.author?.id)}
                    onDelete={onDeleteComment}
                  />
                  {i < messages.length - 1 && <SectionSpacer />}
                </Box>
              ))}
            </Box>
            <SectionSpacer double />
            <Box>
              {canPostComments && (
                <PostComment
                  placeholder={t('pages.aspect.dashboard.comment.placeholder')}
                  onPostComment={onPostComment}
                />
              )}
              {!canPostComments && (
                <Box paddingY={4} display="flex" justifyContent="center">
                  <Typography variant="h4">{t('components.discussion.cant-post')}</Typography>
                </Box>
              )}
            </Box>
          </DashboardGenericSection>
        )}
      </>
    </ContextLayout>
  );
};
export default AspectDashboardView;
