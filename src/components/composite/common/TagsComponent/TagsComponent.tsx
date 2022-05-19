import React, { FC, ReactNode, useCallback } from 'react';
import Chip from '@mui/material/Chip';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useTranslation } from 'react-i18next';
import { Tooltip, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import Skeleton from '@mui/material/Skeleton';
import LinesFitter from '../../../core/LinesFitter/LinesFitter';

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
    'count-1': {
      maxWidth: '48%',
    },
    'count-2': {
      maxWidth: '32%',
    },
    'count-3': {
      maxWidth: '24%',
    },
    'count-4': {
      maxWidth: '19%',
    },
    'count-5': {
      maxWidth: '15%',
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
  keepInRow?: boolean;
  loading?: boolean;
}
//  todo move in diff dir
const TagsComponent: FC<Props> = ({ tags, tagsFor, count = 3, className, keepInRow = false, loading }) => {
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
          className={clsx(styles.tagMargin, {
            [styles[`count-${count}`]]: keepInRow && count && count <= 5,
            [styles.maxWidth]: !keepInRow,
          })}
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

    if (keepInRow) {
      const tagsToDisplay = count && count > 0 ? tags.slice(0, count) : tags;
      const moreTags = count ? tags.slice(count) : [];

      return wrapped(
        <>
          {tagsToDisplay.map(renderTag)}
          {moreTags.length > 0 && renderMore(moreTags)}
        </>
      );
    }

    return <LinesFitter items={tags} className={styles.tagWrapper} renderItem={renderTag} renderMore={renderMore} />;
  };

  return (
    <div className={className}>
      {tags.length === 0 &&
        !loading &&
        wrapped(
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
