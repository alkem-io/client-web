import React, { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { Box, Link } from '@mui/material';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import { ViewProps } from '../../models/view';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import { Comments, Reference } from '../../models/graphql-schema';
import { SectionSpacer } from '../../components/core/Section/Section';
import { useTranslation } from 'react-i18next';
import TagsComponent from '../../components/composite/common/TagsComponent/TagsComponent';
import ContextLayout from '../../components/composite/layout/Context/ContextLayout';
// import DiscussionComment from '../../components/composite/common/Discussion/Comment';

export interface AspectDashboardViewEntities {
  bannerNarrow?: string;
  displayName?: string;
  description?: string;
  comments?: Comments;
  tags?: string[];
  references?: Reference[];
}

export interface AspectDashboardViewActions {}

export interface AspectDashboardViewState {
  loading: boolean;
  error?: ApolloError;
}

export interface AspectDashboardViewProps
  extends ViewProps<AspectDashboardViewEntities, AspectDashboardViewActions, AspectDashboardViewState> {}

const AspectDashboardView: FC<AspectDashboardViewProps> = ({ entities, state }) => {
  const { t } = useTranslation();
  const loading = state.loading;

  const { bannerNarrow, description, displayName, comments, tags, references } = entities;
  const messages = comments?.messages ?? [];

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
              references.map((l, i) => (
                <Link key={i} href={l.uri} target="_blank">
                  <Typography>{l.uri}</Typography>
                </Link>
              ))}
          </>
        )}
      </DashboardGenericSection>
    </>
  );

  return (
    <ContextLayout rightPanel={rightPanel}>
      <>
        <DashboardGenericSection bannerUrl={bannerNarrow} headerText={displayName}>
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
        <DashboardGenericSection headerText={`${t('common.comments')} (${messages.length})`}>
          <Box marginTop={2}>
            {/*{messages.map((x, i) => (
              <DiscussionComment
                key={i}
                comment={x}
                canDelete={canDeleteComment(c.author?.id)}
                onDelete={onDeleteComment}
              />
            ))}*/}
          </Box>
        </DashboardGenericSection>
      </>
    </ContextLayout>
  );
};
export default AspectDashboardView;
