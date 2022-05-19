import React, { FC } from 'react';
import { Box, CardContent, CardMedia, Skeleton, Theme } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import LinkCard from '../../../../components/core/LinkCard/LinkCard';
import TagsComponent from '../../../../components/composite/common/TagsComponent/TagsComponent';
import clsx from 'clsx';
import LabelAndTitle, { LabelAndTitleComponentProps } from './LabelAndTitle';

type mediaSize = 'small' | 'medium' | 'large';

export interface ContributionCardV2Details {
  headerText?: string;
  labelText?: string;
  labelAboveTitle?: boolean; // if true, the label will appear above the title - temp solution
  descriptionText?: string;
  tagsFor?: string;
  tags?: string[];
  mediaUrl?: string;
  mediaSize?: mediaSize;
  url?: string;
  domain?: {
    communityID: string;
  };
}

export const CONTRIBUTION_CARD_HEIGHT_SPACING = 18;
export const CONTRIBUTION_CARD_WIDTH_SPACING = 32;

export interface ContributionCardV2Props {
  details?: ContributionCardV2Details;
  className?: string;
  classes?: LabelAndTitleComponentProps['classes'];
  options?: {
    noMedia?: boolean;
  };
  loading?: boolean;
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
      width: 254,
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
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      background: theme.palette.neutralMedium.light,
      height: ({ mediaSize = 'medium' }) => mediaSizes[mediaSize],
      maxHeight: '100%',
    },
    textClamp: {
      width: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  })
);

const EMPTY = [];

const ContributionCardV2: FC<ContributionCardV2Props> = ({
  details,
  loading = false,
  className,
  classes,
  options,
  children,
}) => {
  const {
    headerText = '',
    labelText,
    labelAboveTitle,
    tags = EMPTY,
    mediaUrl,
    mediaSize = 'medium',
    url = '',
    tagsFor,
  } = details || {};
  const { noMedia } = options || {};

  const styles = useStyles({ mediaSize });

  return (
    <LinkCard to={url} className={clsx(styles.card, className)} aria-label="contribution-card">
      {!noMedia && (
        <>
          {loading ? (
            <Skeleton variant="rectangular" className={styles.cardMedia} animation="wave" />
          ) : (
            <>
              <CardMedia image={mediaUrl} className={styles.cardMedia} sx={{ position: 'relative' }}>
                {/* Workaround console error when image is missing. */}
                <div />
              </CardMedia>
            </>
          )}
        </>
      )}
      <CardContent className={styles.cardContent}>
        {loading ? (
          <Skeleton variant="rectangular" animation="wave" />
        ) : (
          <LabelAndTitle
            headerText={headerText}
            labelText={labelText}
            labelAboveTitle={labelAboveTitle}
            classes={classes}
          />
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
