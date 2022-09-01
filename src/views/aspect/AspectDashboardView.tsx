import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { alpha, Avatar, Box, Grid } from '@mui/material';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import DashboardGenericSection from '../../domain/shared/components/DashboardSections/DashboardGenericSection';
import { Reference } from '../../models/graphql-schema';
import { SectionSpacer } from '../../domain/shared/components/Section/Section';
import TagsComponent from '../../domain/shared/components/TagsComponent/TagsComponent';
import Markdown from '../../components/core/Markdown';
import References from '../../components/composite/common/References/References';
import TagLabel from '../../components/composite/common/TagLabel/TagLabel';
import DashboardColumn from '../../components/composite/sections/DashboardSection/DashboardColumn';
import CommentsComponent, { CommentsComponentProps } from '../../domain/shared/components/Comments/CommentsComponent';

export type AspectDashboardViewProps = {
  banner?: string;
  displayName?: string;
  description?: string;
  type?: string;
  tags?: string[];
  references?: Pick<Reference, 'id' | 'name' | 'uri' | 'description'>[];
  creatorAvatar?: string;
  creatorName?: string;
  createdDate?: string;
  loading: boolean;
  loadingCreator: boolean;
} & CommentsComponentProps;

const AspectDashboardView: FC<AspectDashboardViewProps> = props => {
  const { t } = useTranslation();

  const {
    banner,
    displayName,
    description,
    type,
    tags = [],
    references,
    creatorAvatar,
    creatorName,
    createdDate,
    loading,
    loadingCreator,
    ...commentsComponentProps
  } = props;
  const { canReadComments } = props;

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
          <CommentsComponent {...commentsComponentProps} />
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
