import { Box, Card, CardActionArea, CardContent, CardMedia, createStyles, Grid, makeStyles } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '../../../../core/Typography';
import TagsComponent from '../../TagsComponent/TagsComponent';

export interface ContributionCardDetails {
  name: string;
  type: 'ecoverse' | 'challenge' | 'opportunity';
  tags: string[];
  image: string;
}

export interface ContributionCardProps {
  details?: ContributionCardDetails;
  loading: boolean;
}

const useStyles = makeStyles(theme =>
  createStyles({
    card: {
      height: '100%',
      width: theme.spacing(26),
    },
    cardContent: {
      padding: theme.spacing(1),
    },
    cardMedia: {
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      background: theme.palette.neutralMedium.main,
      height: theme.spacing(8),
      maxHeight: '100%',
    },
    entityType: {
      fontSize: 12,
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
  const { name = '', type = 'ecoverse', tags = [], image = '' } = details || {};

  return (
    <Card className={styles.card}>
      {loading ? (
        <Skeleton variant="rect" className={styles.cardMedia} animation="wave" />
      ) : (
        <CardMedia image={image} className={styles.cardMedia} />
      )}
      <CardContent className={styles.cardContent}>
        <Grid container>
          <Grid item container justifyContent="space-between" alignItems="flex-start" spacing={2} wrap="nowrap">
            {loading ? (
              <Grid item xs={12}>
                <Skeleton variant="rect" animation="wave"></Skeleton>
              </Grid>
            ) : (
              <>
                <Grid item zeroMinWidth>
                  <Typography color="primary" weight="boldLight" clamp={1}>
                    {name}
                  </Typography>
                </Grid>
                <Grid item>
                  <Box className={styles.entityTypeWrapper}>
                    <Typography variant="body1" className={styles.entityType}>
                      {t(`common.${type}` as const)}
                    </Typography>
                  </Box>
                </Grid>
              </>
            )}
          </Grid>
          <Grid item container>
            <Grid item xs={12}>
              {loading ? (
                <Skeleton variant="rect" animation="wave" style={{ marginTop: '10px' }} />
              ) : (
                <TagsComponent tags={tags} count={2} />
              )}
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
      <CardActionArea></CardActionArea>
    </Card>
  );
};
export default ContributionCard;
