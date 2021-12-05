import { Box, CardContent, CardMedia, Skeleton, Theme } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import React, { FC } from 'react';
import LinkCard from '../../../../core/LinkCard/LinkCard';
import Typography from '../../../../core/Typography';
import TagsComponent from '../../TagsComponent/TagsComponent';

type mediaSize = 'small' | 'medium' | 'large';

export interface ContributionCardV2Details {
  headerText: string;
  labelText?: string;
  descriptionText?: string;
  tagsFor?: string;
  tags: string[];
  mediaUrl?: string;
  mediaSize?: mediaSize;
  url: string;
}

export const CONTRIBUTION_CARD_HEIGHT_SPACING = 18;
export const CONTRIBUTION_CARD_WIDTH_SPACING = 32;

export interface ContributionCardV2Props {
  details?: ContributionCardV2Details;
  loading: boolean;
}

const mediaSizes: { [size in mediaSize]: number } = {
  small: 60,
  medium: 90,
  large: 120,
};

const useStyles = makeStyles<Theme, Pick<ContributionCardV2Details, 'mediaSize'>>(theme =>
  createStyles({
    card: {
      height: '100%',
      width: '100%',
      minWidth: 264, // magic
      display: 'flex',
      flexDirection: 'column',
    },
    cardContent: {
      padding: theme.spacing(1.5),
      flexGrow: 1,
      background: theme.palette.background.default,
    },
    cardMedia: {
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      background: theme.palette.neutralMedium.light,
      height: ({ mediaSize = 'medium' }) => mediaSizes[mediaSize],
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
      flexShrink: 0,
    },
  })
);

const ContributionCardV2: FC<ContributionCardV2Props> = ({ details, loading, children }) => {
  const { headerText = '', labelText, tags = [], mediaUrl, mediaSize = 'medium', url = '', tagsFor } = details || {};

  const styles = useStyles({ mediaSize });

  return (
    <LinkCard to={url} className={styles.card} aria-label="contribution-card">
      {loading ? (
        <Skeleton variant="rectangular" className={styles.cardMedia} animation="wave" />
      ) : (
        <CardMedia image={mediaUrl} className={styles.cardMedia}>
          {/* Workaround console error when image is missing. */}
          <div />
        </CardMedia>
      )}
      <CardContent className={styles.cardContent}>
        {loading ? (
          <Skeleton variant="rectangular" animation="wave" />
        ) : (
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography color="primary" weight="boldLight" clamp={1}>
              {headerText}
            </Typography>
            {labelText && (
              <Box className={styles.entityTypeWrapper}>
                <Typography variant="caption" className={styles.entityType}>
                  {labelText}
                </Typography>
              </Box>
            )}
          </Box>
        )}
        {children}
        <Box paddingTop={2}>
          {loading ? (
            <Skeleton variant="rectangular" animation="wave" />
          ) : (
            <TagsComponent tags={tags} tagsFor={tagsFor} count={4} />
          )}
        </Box>
      </CardContent>
    </LinkCard>
  );
};
export default ContributionCardV2;
