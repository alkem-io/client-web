import React, { FC, ReactNode, useCallback } from 'react';
import Chip from '@mui/material/Chip';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useTranslation } from 'react-i18next';
import { Tooltip, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import Skeleton from '@mui/material/Skeleton';
import LinesFitter from '../LinesFitter/LinesFitter';

const useStyles = makeStyles(theme =>
  createStyles({
    tagMargin: {
      marginRight: theme.spacing(0.2),
      marginBottom: theme.spacing(0.2),
    },
    tagWrapper: {
      display: 'flex',
      gap: theme.spacing(0.3),
      flexWrap: 'wrap',
      minHeight: '55px', // TODO specify depending on Chip size
    },
    iconSmall: {
      width: 8,
      height: 8,
      marginLeft: 4,
      marginRight: -6,
    },
    maxWidth: {
      maxWidth: '100%',
    },
  })
);

interface Props {
  tags: string[];
  tagsFor?: string;
  count?: number;
  className?: any;
  loading?: boolean;
}

const TagsComponent: FC<Props> = ({ tags, tagsFor, count = 3, className, loading }) => {
  const { t } = useTranslation();
  const styles = useStyles();

  const getMoreTagsText = (count: number) => t('components.tags-component.more', { count });
  const getMoreTagsTooltipTitle = (moreTags: string[]) => moreTags.join(', ');
  const wrapped = (children: ReactNode) => <div className={styles.tagWrapper}>{children}</div>;

  const renderTag = useCallback(
    (item: string, i: number) => (
      <Tooltip key={i} title={item} arrow placement="bottom">
        <Chip
          classes={{
            iconSmall: styles.iconSmall,
          }}
          label={item}
          variant="outlined"
          color="primary"
          sx={{ borderColor: 'primary.main' }}
          size="small"
          icon={<FiberManualRecordIcon fontSize="small" />}
          className={clsx(styles.tagMargin, styles.maxWidth)}
        />
      </Tooltip>
    ),
    []
  );

  const renderMore = useCallback(
    (remainingTags: string[]) => (
      <Tooltip title={getMoreTagsTooltipTitle(remainingTags)} arrow placement="bottom">
        <Chip
          classes={{
            iconSmall: styles.iconSmall,
          }}
          label={getMoreTagsText(remainingTags.length)}
          variant="outlined"
          color="primary"
          sx={{ borderColor: 'primary.main' }}
          size="small"
          icon={<FiberManualRecordIcon />}
          className={styles.tagMargin}
        />
      </Tooltip>
    ),
    []
  );

  const renderTags = () => {
    if (tags.length === 0) {
      return;
    }

    return <LinesFitter items={tags} className={styles.tagWrapper} renderItem={renderTag} renderMore={renderMore} />;
  };

  return (
    <div className={className}>
      {tags.length === 0 && !loading && (
        <Typography color="neutral.main" variant="subtitle2">
          {t('components.tags-component.no-tags', { name: tagsFor || 'item' })}
        </Typography>
      )}
      {loading
        ? wrapped(
            new Array(count).fill('').map((x, i) => (
              <Skeleton key={i} width={`${100 / count}%`}>
                <Chip
                  variant="outlined"
                  color="primary"
                  sx={{ borderColor: 'primary.main' }}
                  size="small"
                  icon={<FiberManualRecordIcon fontSize="small" />}
                />
              </Skeleton>
            ))
          )
        : renderTags()}
    </div>
  );
};

export default TagsComponent;
