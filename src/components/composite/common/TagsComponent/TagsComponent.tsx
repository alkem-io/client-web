import React, { FC } from 'react';
import Chip from '@mui/material/Chip';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useTranslation } from 'react-i18next';
import { Tooltip, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';

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
}
//  todo move in diff dir
const TagsComponent: FC<Props> = ({ tags, tagsFor, count, className, keepInRow = false }) => {
  const { t } = useTranslation();
  const styles = useStyles();

  const tagsToDisplay = count && count > 0 ? tags.slice(0, count) : tags;
  const moreTags = count ? tags.slice(count) : [];
  const moreTagsText = moreTags.length ? t('components.tags-component.more', { count: moreTags.length }) : '';
  const moreTagsTooltipTitle = moreTags.join(', ');

  return (
    <div className={className}>
      <div className={styles.tagWrapper}>
        {tags.length === 0 && (
          <Typography color="neutral.main" variant="subtitle2">
            {t('components.tags-component.no-tags', { name: tagsFor || 'item' })}
          </Typography>
        )}
        {tagsToDisplay.map((x, i) => (
          <Tooltip key={i} title={x} arrow placement="bottom">
            <Chip
              classes={{
                iconSmall: styles.iconSmall,
              }}
              label={x}
              variant="outlined"
              color="primary"
              size="small"
              icon={<FiberManualRecordIcon fontSize="small" />}
              className={clsx(styles.tagMargin, {
                [styles[`count-${count}`]]: keepInRow && count && count <= 5,
                [styles.maxWidth]: !keepInRow && (!count || count > 5),
              })}
            />
          </Tooltip>
        ))}
        {moreTags.length > 0 && (
          <Tooltip title={moreTagsTooltipTitle} arrow placement="bottom">
            <Chip
              classes={{
                iconSmall: styles.iconSmall,
              }}
              label={moreTagsText}
              variant="outlined"
              color="primary"
              size="small"
              icon={<FiberManualRecordIcon />}
              className={styles.tagMargin}
            />
          </Tooltip>
        )}
      </div>
    </div>
  );
};
export default TagsComponent;
