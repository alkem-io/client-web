import { Box, CardActionArea, CardContent, CardMedia, Grid } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { Skeleton } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import LinkCard from '../../../../core/LinkCard/LinkCard';
import Typography from '../../../../core/Typography';
import TagsComponent from '../../TagsComponent/TagsComponent';
import { ActivityItem } from '../../ActivityPanel/Activities';
import ActivitiesV2 from '../../Activities/ActivitiesV2';

export interface ContributionCardDetails {
  name: string;
  // todo: merge type & tag to just string
  type?: 'hub' | 'challenge' | 'opportunity';
  tag?: string;
  activity?: ActivityItem[];
  tags: string[];
  image: string;
  url?: string;
}

export const CONTRIBUTION_CARD_HEIGHT_SPACING = 18;
export const CONTRIBUTION_CARD_WIDTH_SPACING = 32;

export interface ContributionCardProps {
  details?: ContributionCardDetails;
  loading?: boolean;
}

const useStyles = makeStyles(theme =>
  createStyles({
    card: {
      height: '100%',
      minHeight: theme.spacing(CONTRIBUTION_CARD_HEIGHT_SPACING),
      width: theme.spacing(CONTRIBUTION_CARD_WIDTH_SPACING),
    },
    cardContent: {
      padding: theme.spacing(1),
    },
    cardMedia: {
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      background: theme.palette.neutralMedium.main,
      height: theme.spacing(10),
      maxHeight: '100%',
    },
    entityType: {
      color: '#FFFFFF',
    },
    entityTypeWrapper: {
      background: theme.palette.neutralMedium.main,
      boxShadow: '0px 3px 6px #00000029',
      borderRadius: '15px 0px 0px 15px',
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      marginRight: theme.spacing(-1),
    },
  })
);

const ContributionCard: FC<ContributionCardProps> = ({ details, loading }) => {
  const styles = useStyles();
  const { t } = useTranslation();
  const { name = '', type, tag, tags = [], image, activity = [], url = '' } = details || {};

  return (
    <LinkCard to={url} className={styles.card} aria-label="contribution-card">
      {loading ? (
        <Skeleton variant="rectangular" className={styles.cardMedia} animation="wave" />
      ) : (
        <CardMedia image={image} className={styles.cardMedia}>
          {/* Workaround console error when image is missing. */}
          <div />
        </CardMedia>
      )}
      <CardContent className={styles.cardContent}>
        <Grid container spacing={1}>
          <Grid item container justifyContent="space-between" alignItems="flex-start" spacing={2} wrap="nowrap">
            {loading ? (
              <Grid item xs={12}>
                <Skeleton variant="rectangular" animation="wave"></Skeleton>
              </Grid>
            ) : (
              <>
                <Grid item zeroMinWidth>
                  <Typography color="primary" weight="boldLight" clamp={1}>
                    {name}
                  </Typography>
                </Grid>
                {(type || tag) && (
                  <Grid item>
                    <Box className={styles.entityTypeWrapper}>
                      <Typography variant="body1" className={styles.entityType}>
                        {type ? t(`common.${type}` as const) : tag}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </>
            )}
          </Grid>
          {activity.length > 0 && (
            <Grid item container>
              <ActivitiesV2 activity={activity} />
            </Grid>
          )}
          <Grid item container>
            <Grid item xs={12}>
              {loading ? <Skeleton variant="rectangular" animation="wave" /> : <TagsComponent tags={tags} count={4} />}
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
      <CardActionArea></CardActionArea>
    </LinkCard>
  );
};
export default ContributionCard;
